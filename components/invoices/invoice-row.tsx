import { format } from 'date-fns';
import { Check, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Invoice } from '@/lib/db/schema';
import type { EditingInvoice } from './types';

interface InvoiceRowProps {
  invoice: Invoice;
  expandedInvoices: Record<string, boolean>;
  editingInvoice: EditingInvoice | null;
  isSaving: boolean;
  onToggleExpand: (invoiceId: string) => void;
  onStartEditing: (invoice: Invoice, field: keyof Invoice) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
}

export function InvoiceRow({
  invoice,
  expandedInvoices,
  editingInvoice,
  isSaving,
  onToggleExpand,
  onStartEditing,
  onInputChange,
  onSaveEdit,
  onCancelEditing,
}: InvoiceRowProps) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-2 px-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onToggleExpand(invoice.id)}
        >
          {expandedInvoices[invoice.id] ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </td>
      <td className="py-2 px-4">
        {editingInvoice?.id === invoice.id &&
        editingInvoice.field === 'invoiceNumber' ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingInvoice.value as string}
              onChange={onInputChange}
              className="h-8 w-full"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => onStartEditing(invoice, 'invoiceNumber')}
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
              onChange={onInputChange}
              className="h-8 w-full"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => onStartEditing(invoice, 'customerName')}
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
              onChange={onInputChange}
              className="h-8 w-full"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => onStartEditing(invoice, 'vendorName')}
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
              onChange={onInputChange}
              className="h-8 w-full"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => onStartEditing(invoice, 'invoiceDate')}
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
              onChange={onInputChange}
              className="h-8 w-full"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => onStartEditing(invoice, 'dueDate')}
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
              onChange={onInputChange}
              className="h-8 w-24 text-right"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline text-right"
            onClick={() => onStartEditing(invoice, 'amount')}
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
  );
}
