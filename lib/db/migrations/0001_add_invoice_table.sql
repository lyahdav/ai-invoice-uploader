CREATE TABLE `Invoice` (
  `id` text PRIMARY KEY NOT NULL,
  `customerName` text NOT NULL,
  `vendorName` text NOT NULL,
  `invoiceNumber` text NOT NULL,
  `invoiceDate` integer NOT NULL,
  `dueDate` integer NOT NULL,
  `amount` real NOT NULL,
  `lineItems` blob NOT NULL,
  `createdAt` integer NOT NULL
); 