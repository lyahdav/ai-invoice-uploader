import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { LineItem } from '@/lib/db/schema';
import type { EditingLineItem, NewLineItem } from './types';
import { LineItemRow } from './line-item-row';
import { NewLineItemForm } from './new-line-item-form';

interface LineItemsTableProps {
  invoiceId: string;
  lineItems: LineItem[];
  loadingLineItems: boolean;
  editingLineItem: EditingLineItem | null;
  isSavingLineItem: boolean;
  isDeletingLineItem: boolean;
  isAddingLineItem: boolean;
  newLineItem: NewLineItem;
  invoiceIdForNewLineItem: string | null;
  onStartEditingLineItem: (item: LineItem, field: keyof LineItem) => void;
  onLineItemInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveLineItemEdit: () => void;
  onCancelEditingLineItem: () => void;
  onDeleteLineItem: (lineItemId: string, invoiceId: string) => void;
  onNewLineItemChange: (field: keyof NewLineItem, value: string) => void;
  onSaveNewLineItem: () => void;
  onCancelAddLineItem: () => void;
  onAddLineItem: (invoiceId: string) => void;
  calculateTotal: () => string;
}

export function LineItemsTable({
  invoiceId,
  lineItems,
  loadingLineItems,
  editingLineItem,
  isSavingLineItem,
  isDeletingLineItem,
  isAddingLineItem,
  newLineItem,
  invoiceIdForNewLineItem,
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
}: LineItemsTableProps) {
  if (loadingLineItems) {
    return (
      <div className="flex justify-center">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (lineItems.length === 0 && invoiceIdForNewLineItem !== invoiceId) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No line items found for this invoice.
        <div className="mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddLineItem(invoiceId)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Line Item
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left font-medium">Description</th>
            <th className="py-2 px-4 text-right font-medium">Quantity</th>
            <th className="py-2 px-4 text-right font-medium">Unit Price</th>
            <th className="py-2 px-4 text-right font-medium">Total</th>
            <th className="py-2 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              editingLineItem={editingLineItem}
              isSavingLineItem={isSavingLineItem}
              isDeletingLineItem={isDeletingLineItem}
              onStartEditing={onStartEditingLineItem}
              onInputChange={onLineItemInputChange}
              onSaveEdit={onSaveLineItemEdit}
              onCancelEditing={onCancelEditingLineItem}
              onDelete={onDeleteLineItem}
              invoiceId={invoiceId}
            />
          ))}
          {invoiceIdForNewLineItem === invoiceId && (
            <NewLineItemForm
              newLineItem={newLineItem}
              isAddingLineItem={isAddingLineItem}
              onNewLineItemChange={onNewLineItemChange}
              onSave={onSaveNewLineItem}
              onCancel={onCancelAddLineItem}
              calculateTotal={calculateTotal}
            />
          )}
        </tbody>
      </table>
      <div className="mt-2 flex justify-end">
        {invoiceIdForNewLineItem !== invoiceId && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddLineItem(invoiceId)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Line Item
          </Button>
        )}
      </div>
    </div>
  );
}
