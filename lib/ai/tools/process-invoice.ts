import { z } from 'zod';
import { generateUUID } from '@/lib/utils';
import { saveInvoice, checkForDuplicateInvoice } from '@/lib/db/queries';
import type { Session } from 'next-auth';
import {
  tool,
  generateObject,
  type FilePart,
  type ImagePart,
  type DataContent,
} from 'ai';
import { myProvider } from '../models';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { lineItem } from '@/lib/db/schema';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

const invoiceDataSchema = z.object({
  customerName: z.string().describe('The name of the customer on the invoice'),
  vendorName: z
    .string()
    .describe('The name of the vendor/supplier on the invoice'),
  invoiceNumber: z.string().describe('The invoice number'),
  invoiceDate: z
    .string()
    .describe('The date the invoice was issued (in ISO format)'),
  dueDate: z.string().describe('The date the invoice is due (in ISO format)'),
  amount: z.number().describe('The total amount of the invoice'),
  lineItems: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        total: z.number(),
      }),
    )
    .describe('The line items on the invoice'),
});

// Function to save line items to the database
async function saveLineItems(
  invoiceId: string,
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>,
) {
  try {
    // Map each line item to include the invoice ID and generate a unique ID
    const lineItemsToSave = lineItems.map((item) => ({
      id: generateUUID(),
      invoiceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    // Insert all line items into the database
    await db.insert(lineItem).values(lineItemsToSave);

    return { success: true };
  } catch (error) {
    console.error('Failed to save line items in database', error);
    throw error;
  }
}

export const processInvoice = ({ session }: { session: Session }) => {
  return tool({
    description: 'Process an invoice PDF or image and extract information',
    parameters: z.object({}),
    execute: async (args, { messages }) => {
      try {
        // Get the last message which should contain the file data
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || !lastMessage.content) {
          throw new Error('No file data found in the messages');
        }
        if (!Array.isArray(lastMessage.content)) {
          throw new Error('Last message content is not an array');
        }
        const lastContentItem =
          lastMessage.content[lastMessage.content.length - 1];
        if (
          lastContentItem.type !== 'file' &&
          lastContentItem.type !== 'image'
        ) {
          throw new Error('Last message content is not a file or image');
        }

        // Handle both FilePart and ImagePart types
        let fileData: DataContent | URL;
        let fileMimeType: string;

        if (lastContentItem.type === 'file') {
          fileData = (lastContentItem as FilePart).data;
          fileMimeType = (lastContentItem as FilePart).mimeType;
        } else {
          // It's an image
          fileData = (lastContentItem as ImagePart).image;
          fileMimeType =
            (lastContentItem as ImagePart).mimeType || 'image/jpeg'; // Provide a default if undefined
        }

        const attachment: ImagePart | FilePart = fileMimeType.startsWith(
          'application/pdf',
        )
          ? {
              type: 'file',
              data: fileData,
              mimeType: fileMimeType,
            }
          : {
              type: 'image',
              image: fileData,
              mimeType: fileMimeType,
            };

        // Use generateObject to extract structured data from the file
        const { object: extractedData } = await generateObject({
          model: myProvider.languageModel('chat-model-large'),
          schema: invoiceDataSchema,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Extract the following information from this invoice ${fileMimeType.startsWith('image/') ? 'image' : 'PDF'}:

                  - Customer name
                  - Vendor name
                  - Invoice number
                  - Invoice date
                  - Due date
                  - Total amount
                  - Line items`,
                },
                attachment,
              ],
            },
          ],
        });

        // Check for duplicate invoice before saving
        const duplicateCheck = await checkForDuplicateInvoice({
          vendorName: extractedData.vendorName,
          invoiceNumber: extractedData.invoiceNumber,
          amount: extractedData.amount,
        });

        if (duplicateCheck.isDuplicate && duplicateCheck.existingInvoice) {
          const existingInvoice = duplicateCheck.existingInvoice;
          const formattedDate = new Date(
            existingInvoice.invoiceDate,
          ).toLocaleDateString();

          return {
            success: false,
            isDuplicate: true,
            message: `This invoice appears to be a duplicate. An invoice with the same vendor (${existingInvoice.vendorName}), invoice number (${existingInvoice.invoiceNumber}), and amount ($${existingInvoice.amount.toFixed(2)}) was already uploaded on ${formattedDate}.`,
            data: extractedData,
          };
        }

        // Generate a unique ID for the invoice
        const id = generateUUID();

        // Save the invoice to the database using the data from the AI
        await saveInvoice({
          id,
          customerName: extractedData.customerName,
          vendorName: extractedData.vendorName,
          invoiceNumber: extractedData.invoiceNumber,
          invoiceDate: new Date(extractedData.invoiceDate),
          dueDate: new Date(extractedData.dueDate),
          amount: extractedData.amount,
        });

        // Save the line items to the database
        if (extractedData.lineItems && extractedData.lineItems.length > 0) {
          await saveLineItems(id, extractedData.lineItems);
        }

        return {
          success: true,
          isDuplicate: false,
          message: 'Invoice processed and saved successfully',
          data: extractedData,
        };
      } catch (error) {
        console.error('Error processing invoice:', error);
        return {
          success: false,
          isDuplicate: false,
          message: 'Failed to process invoice',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
};
