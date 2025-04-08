'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Invoice } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchInvoices, updateInvoiceAction } from '@/app/actions';
import { ChevronDown, ChevronUp, ChevronsUpDown, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type SortColumn = 'invoiceDate' | 'dueDate' | 'amount' | 'vendorName' | null;
type SortDirection = 'asc' | 'desc';

type EditingInvoice = {
  id: string;
  field: keyof Invoice;
  value: string | number | Date;
};

export default function ProcessedInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingInvoice, setEditingInvoice] = useState<EditingInvoice | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

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

  const startEditing = (invoice: Invoice, field: keyof Invoice) => {
    let value: string | number | Date;

    if (field === 'amount') {
      value = invoice.amount;
    } else if (field === 'invoiceDate' || field === 'dueDate') {
      value = new Date(invoice[field]);
    } else {
      value = invoice[field] as string;
    }

    setEditingInvoice({ id: invoice.id, field, value });
  };

  const cancelEditing = () => {
    setEditingInvoice(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingInvoice) return;

    let value: string | number | Date;

    if (e.target.type === 'number') {
      value = Number.parseFloat(e.target.value);
    } else if (e.target.type === 'date') {
      value = new Date(e.target.value);
    } else {
      value = e.target.value;
    }

    setEditingInvoice({ ...editingInvoice, value });
  };

  const saveEdit = async () => {
    if (!editingInvoice) return;

    setIsSaving(true);

    try {
      const invoice = invoices.find((inv) => inv.id === editingInvoice.id);
      if (!invoice) throw new Error('Invoice not found');

      const updatedInvoice = { ...invoice };

      // Update the specific field
      if (editingInvoice.field === 'amount') {
        updatedInvoice.amount = editingInvoice.value as number;
      } else if (
        editingInvoice.field === 'invoiceDate' ||
        editingInvoice.field === 'dueDate'
      ) {
        updatedInvoice[editingInvoice.field] = editingInvoice.value as Date;
      } else if (
        editingInvoice.field === 'customerName' ||
        editingInvoice.field === 'vendorName' ||
        editingInvoice.field === 'invoiceNumber'
      ) {
        updatedInvoice[editingInvoice.field] = editingInvoice.value as string;
      } else {
        throw new Error(`Invalid field: ${editingInvoice.field}`);
      }

      const result = await updateInvoiceAction({
        id: updatedInvoice.id,
        customerName: updatedInvoice.customerName,
        vendorName: updatedInvoice.vendorName,
        invoiceNumber: updatedInvoice.invoiceNumber,
        invoiceDate: (updatedInvoice.invoiceDate as Date).toISOString(),
        dueDate: (updatedInvoice.dueDate as Date).toISOString(),
        amount: updatedInvoice.amount,
        lineItems: updatedInvoice.lineItems as {
          description: string;
          quantity: number;
          unitPrice: number;
          total: number;
        }[],
      });

      if (result.success) {
        // Update the local state
        setInvoices(
          invoices.map((inv) =>
            inv.id === updatedInvoice.id ? updatedInvoice : inv,
          ),
        );
        toast.success('Invoice updated successfully');
      } else {
        toast.error(result.error || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to update invoice');
    } finally {
      setIsSaving(false);
      setEditingInvoice(null);
    }
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
                <th className="py-2 px-4 text-left font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center"
                    onClick={() => handleSort('vendorName')}
                    role="button"
                  >
                    Vendor {getSortIcon('vendorName')}
                  </div>
                </th>
                <th className="py-2 px-4 text-left font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center"
                    onClick={() => handleSort('invoiceDate')}
                    role="button"
                  >
                    Invoice Date {getSortIcon('invoiceDate')}
                  </div>
                </th>
                <th className="py-2 px-4 text-left font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center"
                    onClick={() => handleSort('dueDate')}
                    role="button"
                  >
                    Due Date {getSortIcon('dueDate')}
                  </div>
                </th>
                <th className="py-2 px-4 text-right font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center justify-end"
                    onClick={() => handleSort('amount')}
                    role="button"
                  >
                    Amount {getSortIcon('amount')}
                  </div>
                </th>
                <th className="py-2 px-4 text-left font-medium">Uploaded Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4">
                    {editingInvoice?.id === invoice.id &&
                    editingInvoice.field === 'invoiceNumber' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingInvoice.value as string}
                          onChange={handleInputChange}
                          className="h-8 w-full"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => startEditing(invoice, 'invoiceNumber')}
                        role="button"
                      >
                        {invoice.invoiceNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingInvoice?.id === invoice.id &&
                    editingInvoice.field === 'customerName' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingInvoice.value as string}
                          onChange={handleInputChange}
                          className="h-8 w-full"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => startEditing(invoice, 'customerName')}
                        role="button"
                      >
                        {invoice.customerName}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingInvoice?.id === invoice.id &&
                    editingInvoice.field === 'vendorName' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingInvoice.value as string}
                          onChange={handleInputChange}
                          className="h-8 w-full"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => startEditing(invoice, 'vendorName')}
                        role="button"
                      >
                        {invoice.vendorName}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingInvoice?.id === invoice.id &&
                    editingInvoice.field === 'invoiceDate' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="date"
                          value={format(editingInvoice.value as Date, 'yyyy-MM-dd')}
                          onChange={handleInputChange}
                          className="h-8 w-full"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => startEditing(invoice, 'invoiceDate')}
                        role="button"
                      >
                        {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {editingInvoice?.id === invoice.id &&
                    editingInvoice.field === 'dueDate' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="date"
                          value={format(editingInvoice.value as Date, 'yyyy-MM-dd')}
                          onChange={handleInputChange}
                          className="h-8 w-full"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => startEditing(invoice, 'dueDate')}
                        role="button"
                      >
                        {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {editingInvoice?.id === invoice.id &&
                    editingInvoice.field === 'amount' ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Input
                          type="number"
                          step="0.01"
                          value={editingInvoice.value as number}
                          onChange={handleInputChange}
                          className="h-8 w-24 text-right"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:underline text-right"
                        onClick={() => startEditing(invoice, 'amount')}
                        role="button"
                      >
                        ${invoice.amount.toFixed(2)}
                      </div>
                    )}
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
                <th className="py-2 px-4 text-left font-medium">Invoice Date</th>
                <th className="py-2 px-4 text-left font-medium">Due Date</th>
                <th className="py-2 px-4 text-right font-medium">Amount</th>
                <th className="py-2 px-4 text-left font-medium">Uploaded Date</th>
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
