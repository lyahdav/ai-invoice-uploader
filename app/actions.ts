'use server';

import { getInvoices, updateInvoice } from '@/lib/db/queries';

export async function fetchInvoices() {
  try {
    const invoices = await getInvoices();
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

export async function updateInvoiceAction({
  id,
  customerName,
  vendorName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  amount,
}: {
  id: string;
  customerName: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
}) {
  try {
    await updateInvoice({
      id,
      customerName,
      vendorName,
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      dueDate: new Date(dueDate),
      amount,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, error: 'Failed to update invoice' };
  }
}
