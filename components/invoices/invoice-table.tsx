import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Invoice, LineItem } from '@/lib/db/schema';
import type { SortColumn, SortDirection } from './types';
import { InvoiceRow } from './invoice-row';
import { LineItemsTable } from './line-items-table';
import { InvoiceTableSkeleton } from './invoice-table-skeleton';
import React from 'react';

interface InvoiceTableProps {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  editingInvoice: {
    id: string;
    field: keyof Invoice;
    value: string | number | Date;
  } | null;
  isSaving: boolean;
  expandedInvoices: Record<string, boolean>;
  lineItems: Record<string, LineItem[]>;
  loadingLineItems: Record<string, boolean>;
  editingLineItem: {
    id: string;
    field: keyof LineItem;
    value: string | number;
  } | null;
  isSavingLineItem: boolean;
  isDeletingLineItem: boolean;
  lineItemToDelete: {
    id: string;
    invoiceId: string;
  } | null;
  newLineItem: {
    description: string;
    quantity: number;
    unitPrice: number;
  };
  isAddingLineItem: boolean;
  invoiceIdForNewLineItem: string | null;
  onSort: (column: SortColumn) => void;
  onToggleExpandInvoice: (invoiceId: string) => void;
  onStartEditing: (invoice: Invoice, field: keyof Invoice) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
  onStartEditingLineItem: (item: LineItem, field: keyof LineItem) => void;
  onLineItemInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveLineItemEdit: () => void;
  onCancelEditingLineItem: () => void;
  onDeleteLineItem: (lineItemId: string, invoiceId: string) => void;
  onNewLineItemChange: (
    field: 'description' | 'quantity' | 'unitPrice',
    value: string,
  ) => void;
  onSaveNewLineItem: () => void;
  onCancelAddLineItem: () => void;
  onAddLineItem: (invoiceId: string) => void;
  calculateTotal: () => string;
}

export function InvoiceTable({
  invoices,
  loading,
  error,
  sortColumn,
  sortDirection,
  editingInvoice,
  isSaving,
  expandedInvoices,
  lineItems,
  loadingLineItems,
  editingLineItem,
  isSavingLineItem,
  isDeletingLineItem,
  lineItemToDelete,
  newLineItem,
  isAddingLineItem,
  invoiceIdForNewLineItem,
  onSort,
  onToggleExpandInvoice,
  onStartEditing,
  onInputChange,
  onSaveEdit,
  onCancelEditing,
  onStartEditingLineItem,
  onLineItemInputChange,
  onSaveLineItemEdit,
  onCancelEditingLineItem,
  onDeleteLineItem,
  onNewLineItemChange,
  onSaveNewLineItem,
  onCancelAddLineItem,
  onAddLineItem,
  calculateTotal,
}: InvoiceTableProps) {
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
                <th className="py-2 px-4 text-left font-medium w-10" />
                <th className="py-2 px-4 text-left font-medium">Invoice #</th>
                <th className="py-2 px-4 text-left font-medium">Customer</th>
                <th className="py-2 px-4 text-left font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center"
                    onClick={() => onSort('vendorName')}
                    role="button"
                  >
                    Vendor {getSortIcon('vendorName')}
                  </div>
                </th>
                <th className="py-2 px-4 text-left font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center"
                    onClick={() => onSort('invoiceDate')}
                    role="button"
                  >
                    Invoice Date {getSortIcon('invoiceDate')}
                  </div>
                </th>
                <th className="py-2 px-4 text-left font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center"
                    onClick={() => onSort('dueDate')}
                    role="button"
                  >
                    Due Date {getSortIcon('dueDate')}
                  </div>
                </th>
                <th className="py-2 px-4 text-right font-medium">
                  <div
                    className="cursor-pointer hover:bg-muted/50 inline-flex items-center justify-end"
                    onClick={() => onSort('amount')}
                    role="button"
                  >
                    Amount {getSortIcon('amount')}
                  </div>
                </th>
                <th className="py-2 px-4 text-left font-medium">
                  Uploaded Date
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <InvoiceRow
                    invoice={invoice}
                    expandedInvoices={expandedInvoices}
                    editingInvoice={editingInvoice}
                    isSaving={isSaving}
                    onToggleExpand={onToggleExpandInvoice}
                    onStartEditing={onStartEditing}
                    onInputChange={onInputChange}
                    onSaveEdit={onSaveEdit}
                    onCancelEditing={onCancelEditing}
                  />
                  {expandedInvoices[invoice.id] && (
                    <tr className="border-b bg-muted/30">
                      <td colSpan={8} className="py-4 px-4">
                        <LineItemsTable
                          invoiceId={invoice.id}
                          lineItems={lineItems[invoice.id] || []}
                          loadingLineItems={
                            loadingLineItems[invoice.id] || false
                          }
                          editingLineItem={editingLineItem}
                          isSavingLineItem={isSavingLineItem}
                          isDeletingLineItem={isDeletingLineItem}
                          isAddingLineItem={isAddingLineItem}
                          newLineItem={newLineItem}
                          invoiceIdForNewLineItem={invoiceIdForNewLineItem}
                          onStartEditingLineItem={onStartEditingLineItem}
                          onLineItemInputChange={onLineItemInputChange}
                          onSaveLineItemEdit={onSaveLineItemEdit}
                          onCancelEditingLineItem={onCancelEditingLineItem}
                          onDeleteLineItem={onDeleteLineItem}
                          onNewLineItemChange={onNewLineItemChange}
                          onSaveNewLineItem={onSaveNewLineItem}
                          onCancelAddLineItem={onCancelAddLineItem}
                          onAddLineItem={onAddLineItem}
                          calculateTotal={calculateTotal}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
