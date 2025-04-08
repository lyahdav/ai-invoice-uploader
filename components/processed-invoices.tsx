'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Invoice } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchInvoices } from '@/app/actions';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

type SortColumn = 'invoiceDate' | 'dueDate' | 'amount' | 'vendorName' | null;
type SortDirection = 'asc' | 'desc';

export default function ProcessedInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const result = await fetchInvoices();
        if (result.success && result.data) {
          setInvoices(result.data);
        } else {
          setError(result.error || 'Failed to load invoices');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again later.');
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedInvoices = () => {
    if (!sortColumn) return invoices;

    return [...invoices].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle date fields
      if (sortColumn === 'invoiceDate' || sortColumn === 'dueDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column)
      return <ChevronsUpDown className="h-4 w-4 inline ml-1 opacity-50" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  if (loading) {
    return <InvoiceTableSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No invoices found.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedInvoices = getSortedInvoices();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium">Invoice #</th>
                <th className="py-2 px-4 text-left font-medium">Customer</th>
                <th
                  className="py-2 px-4 text-left font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('vendorName')}
                >
                  Vendor {getSortIcon('vendorName')}
                </th>
                <th
                  className="py-2 px-4 text-left font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('invoiceDate')}
                >
                  Date {getSortIcon('invoiceDate')}
                </th>
                <th
                  className="py-2 px-4 text-left font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date {getSortIcon('dueDate')}
                </th>
                <th
                  className="py-2 px-4 text-right font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </th>
                <th className="py-2 px-4 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4">{invoice.invoiceNumber}</td>
                  <td className="py-2 px-4">{invoice.customerName}</td>
                  <td className="py-2 px-4">{invoice.vendorName}</td>
                  <td className="py-2 px-4">
                    {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}
                  </td>
                  <td className="py-2 px-4">
                    {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4">
                    {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceTableSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium">Invoice #</th>
                <th className="py-2 px-4 text-left font-medium">Customer</th>
                <th className="py-2 px-4 text-left font-medium">Vendor</th>
                <th className="py-2 px-4 text-left font-medium">Date</th>
                <th className="py-2 px-4 text-left font-medium">Due Date</th>
                <th className="py-2 px-4 text-right font-medium">Amount</th>
                <th className="py-2 px-4 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: order of rows won't change
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="py-2 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
