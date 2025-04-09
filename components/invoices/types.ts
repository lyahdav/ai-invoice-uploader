import type { Invoice, LineItem } from '@/lib/db/schema';

export type SortColumn =
  | 'invoiceDate'
  | 'dueDate'
  | 'amount'
  | 'vendorName'
  | null;
export type SortDirection = 'asc' | 'desc';

export type EditingInvoice = {
  id: string;
  field: keyof Invoice;
  value: string | number | Date;
};

export type EditingLineItem = {
  id: string;
  field: keyof LineItem;
  value: string | number;
};

export type NewLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};
