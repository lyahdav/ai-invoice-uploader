import { z } from 'zod';
import { tool } from 'ai';
import { myProvider } from '../models';
import OpenAI from 'openai';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const processInvoice = tool({
  description: 'Extract customer name from an invoice PDF',
  parameters: z.object({
    file: z.string().describe('The data URL of the invoice PDF'),
  }),
  execute: async ({ file }) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Processing invoice with GPT-4 Vision');

      const content: ChatCompletionContentPart[] = [
        {
          type: "text",
          text: "What is the customer name on this invoice? Return only the name, nothing else."
        },
        {
          type: "image_url",
          image_url: {
            url: file
          }
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content
          }
        ],
        max_tokens: 100
      });

      const customerName = response.choices[0]?.message?.content?.trim() || "Unknown";
      console.log('Successfully extracted customer name:', customerName);
      return { customerName };
    } catch (error) {
      console.error('Error processing invoice:', error);
      throw new Error('Failed to process invoice: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}); 