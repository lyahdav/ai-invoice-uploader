import { z } from 'zod';
import { generateUUID } from '@/lib/utils';
import { saveInvoice } from '@/lib/db/queries';
import { Session } from 'next-auth';
import { tool } from 'ai';

const processInvoiceSchema = z.object({
  pdfContent: z.string().describe('The base64 encoded content of the PDF invoice'),
});

export const processInvoice = ({ session }: { session: Session }) => {
  return tool({
    description: 'Process an invoice PDF and extract information',
    parameters: processInvoiceSchema,
    execute: async ({ pdfContent }) => {
      console.log('processing invoice');
      try {
        // The AI has already parsed the PDF and extracted the data
        // We'll use the data returned by the AI
        
        // Generate a unique ID for the invoice
        const id = generateUUID();
        
        // The AI response will contain the extracted invoice data
        // We need to ensure it has all the required fields for saveInvoice
        const aiResponse = await fetch('/api/ai/parse-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pdfContent }),
        });
        
        if (!aiResponse.ok) {
          throw new Error('Failed to parse invoice with AI');
        }
        
        const extractedData = await aiResponse.json();
        
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
          invoice: {
            id,
            ...extractedData,
          },
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