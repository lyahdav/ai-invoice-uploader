import { z } from 'zod';
import { tool } from 'ai';
import type { Session } from 'next-auth';

export const showInvoices = ({ session }: { session: Session }) => {
  return tool({
    description: 'Display processed invoices without any additional processing',
    parameters: z.object({}),
    execute: async (args) => {
      console.log('showInvoices, begin');

      try {
        // This tool simply returns a success message
        // The actual rendering of invoices is handled by the ProcessedInvoices component
        return {
          success: true,
          message: 'Invoices displayed successfully',
        };
      } catch (error) {
        console.error('Error showing invoices:', error);
        return {
          success: false,
          message: 'Failed to show invoices',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
};
