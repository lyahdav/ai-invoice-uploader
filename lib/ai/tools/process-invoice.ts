import { z } from 'zod';
import { generateUUID } from '@/lib/utils';
import { saveInvoice } from '@/lib/db/queries';
import type { Session } from 'next-auth';
import { tool, generateObject, type FilePart } from 'ai';
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
    description: 'Process an invoice PDF and extract information',
    parameters: z.object({}),
    execute: async (args, { messages }) => {
      try {
        // Get the last message which should contain the PDF data
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || !lastMessage.content) {
          throw new Error('No PDF data found in the messages');
        }
        if (!Array.isArray(lastMessage.content)) {
          throw new Error('Last message content is not an array');
        }
        const lastContentItem =
          lastMessage.content[lastMessage.content.length - 1];
        if (lastContentItem.type !== 'file') {
          throw new Error('Last message content is not a file');
        }
        const pdfData = (lastContentItem as FilePart).data;

        // Use generateObject to extract structured data from the PDF
        const { object: extractedData } = await generateObject({
          model: myProvider.languageModel('chat-model-large'),
          schema: invoiceDataSchema,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Extract the following information from this invoice PDF:

                  - Customer name
                  - Vendor name
                  - Invoice number
                  - Invoice date
                  - Due date
                  - Total amount
                  - Line items`,
                },
                {
                  type: 'file',
                  data: pdfData,
                  mimeType: 'application/pdf',
                },
              ],
            },
          ],
        });

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
          message: 'Invoice processed and saved successfully',
          data: extractedData,
        };
      } catch (error) {
        console.error('Error processing invoice:', error);
        return {
          success: false,
          message: 'Failed to process invoice',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
};
