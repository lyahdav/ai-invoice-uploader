import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { NewLineItem } from './types';

interface NewLineItemFormProps {
  newLineItem: NewLineItem;
  isAddingLineItem: boolean;
  onNewLineItemChange: (field: keyof NewLineItem, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  calculateTotal: () => string;
}

export function NewLineItemForm({
  newLineItem,
  isAddingLineItem,
  onNewLineItemChange,
  onSave,
  onCancel,
  calculateTotal,
}: NewLineItemFormProps) {
  return (
    <tr className="border-b">
      <td className="py-2 px-4">
        <Input
          value={newLineItem.description}
          onChange={(e) => onNewLineItemChange('description', e.target.value)}
          placeholder="Description"
          className="h-8 w-full"
        />
      </td>
      <td className="py-2 px-4 text-right">
        <Input
          type="number"
          step="1"
          value={newLineItem.quantity.toString()}
          onChange={(e) => onNewLineItemChange('quantity', e.target.value)}
          className="h-8 w-full text-right"
        />
      </td>
      <td className="py-2 px-4 text-right">
        <Input
          type="number"
          step="0.01"
          value={newLineItem.unitPrice.toString()}
          onChange={(e) => onNewLineItemChange('unitPrice', e.target.value)}
          className="h-8 w-full text-right"
        />
      </td>
      <td className="py-2 px-4 text-right">
        <span className="h-8 w-full text-right">${calculateTotal()}</span>
      </td>
      <td className="py-2 px-4 text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            disabled={isAddingLineItem || !newLineItem.description}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isAddingLineItem}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
