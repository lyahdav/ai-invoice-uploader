'use server';

import {
  getInvoices,
  updateInvoice,
  getLineItemsByInvoiceId,
  updateLineItem,
  deleteLineItem,
  insertLineItem,
} from '@/lib/db/queries';

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

export async function fetchLineItems({ id }: { id: string }) {
  try {
    const lineItems = await getLineItemsByInvoiceId({ id });
    return { success: true, data: lineItems };
  } catch (error) {
    console.error('Error fetching line items:', error);
    return { success: false, error: 'Failed to fetch line items' };
  }
}

export async function updateLineItemAction({
  id,
  description,
  quantity,
  unitPrice,
  total,
}: {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}) {
  try {
    await updateLineItem({
      id,
      description,
      quantity,
      unitPrice,
      total,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating line item:', error);
    return { success: false, error: 'Failed to update line item' };
  }
}

export async function deleteLineItemAction({ id }: { id: string }) {
  try {
    await deleteLineItem({ id });
    return { success: true };
  } catch (error) {
    console.error('Error deleting line item:', error);
    return { success: false, error: 'Failed to delete line item' };
  }
}

export async function addLineItemAction({
  invoiceId,
  description,
  quantity,
  unitPrice,
}: {
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}) {
  try {
    const id = crypto.randomUUID();
    const total = quantity * unitPrice;

    await insertLineItem({
      id,
      invoiceId,
      description,
      quantity,
      unitPrice,
      total,
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error('Error adding line item:', error);
    return { success: false, error: 'Failed to add line item' };
  }
}
