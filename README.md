# Invoice Processing AI Chatbot

A modern AI-powered chatbot built with Next.js that can extract information from PDF/image invoices and save them to a database.

## Running locally

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Create a `.env.development.local` file in the root directory
   - Add the following environment variables:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ANTHROPIC_API_KEY=your_anthropic_api_key
     ```
   - You can get your API keys from:
     - OpenAI API Key: https://platform.openai.com/account/api-keys
     - Anthropic API Key: https://console.anthropic.com/

4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Features

The chatbot supports the following commands:
- `process this invoice` - Upload and process an invoice (PDF or image) to extract information and save it to the database. If you upload an invoice that already exists it will prevent it from being saved to the database again.
- `show invoices` or `view invoices` - Display all processed invoices from the database

The invoice list supports the following features:
- Manual editing
- Sorting
- Viewing and editing of line items by clicking the plus at the start of each row
