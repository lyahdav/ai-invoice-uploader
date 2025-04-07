import { z } from 'zod';
import { generateUUID } from '@/lib/utils';
import { saveInvoice } from '@/lib/db/queries';
import { Session } from 'next-auth';
import { tool, generateObject, FilePart } from 'ai';
import { myProvider } from '../models';

const invoiceDataSchema = z.object({
  customerName: z.string().describe('The name of the customer on the invoice'),
  vendorName: z.string().describe('The name of the vendor/supplier on the invoice'),
  invoiceNumber: z.string().describe('The invoice number'),
  invoiceDate: z.string().describe('The date the invoice was issued (in ISO format)'),
  dueDate: z.string().describe('The date the invoice is due (in ISO format)'),
  amount: z.number().describe('The total amount of the invoice'),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number()
  })).describe('The line items on the invoice')
});

export const processInvoice = ({ session }: { session: Session }) => {
  return tool({
    description: 'Process an invoice PDF and extract information',
    parameters: z.object({}),
    execute: async (args, { messages }) => {
      console.log('processInvoice, begin');
      
      try {
        // Get the last message which should contain the PDF data
        const lastMessage = messages[messages.length - 1];
        
        if (!lastMessage || !lastMessage.content) {
          throw new Error('No PDF data found in the messages');
        }
        if (!Array.isArray(lastMessage.content)) {
          throw new Error('Last message content is not an array');
        }
        const lastContentItem = lastMessage.content[lastMessage.content.length - 1];
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
                  - Line items`
                },
                {
                  type: 'file',
                  data: pdfData,
                  mimeType: 'application/pdf',
                }
              ]
            }]
        });
        
        console.log('processInvoice, extractedData: ', extractedData);

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
          lineItems: extractedData.lineItems,
        });
        
        return {
          success: true,
          message: 'Invoice processed and saved successfully',
          data: extractedData
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