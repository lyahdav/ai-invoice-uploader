import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';
import { generateObject } from 'ai';
import { myProvider } from '@/lib/ai/models';
import type { FilePart, ImagePart } from 'ai';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size should be less than 10MB',
    })
    .refine(
      (file) =>
        [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ].includes(file.type),
      {
        message: 'File type should be PDF or an image (JPEG, PNG, GIF, WebP)',
      },
    ),
});

// Schema for invoice validation
const InvoiceValidationSchema = z.object({
  isInvoice: z.boolean().describe('Whether the document is an invoice'),
  documentType: z
    .string()
    .describe('The type of document (invoice, receipt, statement, etc.)'),
  confidence: z
    .number()
    .describe('Confidence score of the classification (0-1)'),
  explanation: z
    .string()
    .describe('Brief explanation of why this is or is not an invoice'),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    try {
      // Validate if the document is an invoice using AI
      const { object: validationResult } = await generateObject({
        model: myProvider.languageModel('chat-model-large'),
        schema: InvoiceValidationSchema,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this document and determine if it's an invoice. 
                An invoice typically contains:
                - A clear indication it's an invoice (title, header, etc.)
                - Invoice number
                - Date issued
                - Due date
                - Line items with descriptions and prices
                - Total amount
                - Vendor/supplier information
                - Customer/billing information
                
                Receipts, account statements, and other financial documents are NOT invoices.
                Provide a confidence score and explanation for your classification.`,
              },
              {
                type: file.type.startsWith('application/pdf')
                  ? 'file'
                  : 'image',
                ...(file.type.startsWith('application/pdf')
                  ? { data: fileBuffer, mimeType: file.type }
                  : { image: fileBuffer, mimeType: file.type }),
              } as FilePart | ImagePart,
            ],
          },
        ],
      });

      // If the document is not an invoice, reject it
      if (!validationResult.isInvoice) {
        return NextResponse.json(
          {
            error: `Upload rejected: This appears to be a ${validationResult.documentType}, not an invoice. ${validationResult.explanation}`,
          },
          { status: 400 },
        );
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${filename}`;

      // Create data URL for immediate preview and vision API
      const dataURL = `data:${file.type};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        url: dataURL,
        pathname: `/uploads/${uniqueFilename}`,
        contentType: file.type,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
