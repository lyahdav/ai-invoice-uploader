'use server';

import { getInvoices } from '@/lib/db/queries';

export async function fetchInvoices() {
  try {
    const invoices = await getInvoices();
    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
} 