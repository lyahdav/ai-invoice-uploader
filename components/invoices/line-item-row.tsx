import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LineItem } from '@/lib/db/schema';
import type { EditingLineItem } from './types';

interface LineItemRowProps {
  item: LineItem;
  editingLineItem: EditingLineItem | null;
  isSavingLineItem: boolean;
  isDeletingLineItem: boolean;
  onStartEditing: (item: LineItem, field: keyof LineItem) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
  onDelete: (lineItemId: string, invoiceId: string) => void;
  invoiceId: string;
}

export function LineItemRow({
  item,
  editingLineItem,
  isSavingLineItem,
  isDeletingLineItem,
  onStartEditing,
  onInputChange,
  onSaveEdit,
  onCancelEditing,
  onDelete,
  invoiceId,
}: LineItemRowProps) {
  return (
    <tr key={item.id} className="border-b">
      <td className="py-2 px-4">
        {editingLineItem?.id === item.id &&
        editingLineItem.field === 'description' ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingLineItem.value as string}
              onChange={onInputChange}
              className="h-8 w-full"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => onStartEditing(item, 'description')}
            role="button"
          >
            {item.description}
          </div>
        )}
      </td>
      <td className="py-2 px-4 text-right">
        {editingLineItem?.id === item.id &&
        editingLineItem.field === 'quantity' ? (
          <div className="flex items-center gap-1 justify-end">
            <Input
              type="number"
              step="1"
              value={editingLineItem.value as number}
              onChange={onInputChange}
              className="h-8 w-24 text-right"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline text-right"
            onClick={() => onStartEditing(item, 'quantity')}
            role="button"
          >
            {item.quantity}
          </div>
        )}
      </td>
      <td className="py-2 px-4 text-right">
        {editingLineItem?.id === item.id &&
        editingLineItem.field === 'unitPrice' ? (
          <div className="flex items-center gap-1 justify-end">
            <Input
              type="number"
              step="0.01"
              value={editingLineItem.value as number}
              onChange={onInputChange}
              className="h-8 w-24 text-right"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline text-right"
            onClick={() => onStartEditing(item, 'unitPrice')}
            role="button"
          >
            ${item.unitPrice.toFixed(2)}
          </div>
        )}
      </td>
      <td className="py-2 px-4 text-right">
        {editingLineItem?.id === item.id &&
        editingLineItem.field === 'total' ? (
          <div className="flex items-center gap-1 justify-end">
            <Input
              type="number"
              step="0.01"
              value={editingLineItem.value as number}
              onChange={onInputChange}
              className="h-8 w-24 text-right"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              disabled={isSavingLineItem}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:underline text-right"
            onClick={() => onStartEditing(item, 'total')}
            role="button"
          >
            ${item.total.toFixed(2)}
          </div>
        )}
      </td>
      <td className="py-2 px-4 text-right">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(item.id, invoiceId)}
          disabled={isDeletingLineItem}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
