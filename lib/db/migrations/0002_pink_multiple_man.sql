CREATE TABLE `LineItem` (
	`id` text PRIMARY KEY NOT NULL,
	`invoiceId` text NOT NULL,
	`description` text NOT NULL,
	`quantity` real NOT NULL,
	`unitPrice` real NOT NULL,
	`total` real NOT NULL,
	FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON UPDATE no action ON DELETE no action
);
