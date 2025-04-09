import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteLineItemDialogProps {
  lineItemToDelete: {
    id: string;
    invoiceId: string;
  } | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (lineItemId: string, invoiceId: string) => void;
}

export function DeleteLineItemDialog({
  lineItemToDelete,
  onOpenChange,
  onDelete,
}: DeleteLineItemDialogProps) {
  return (
    <AlertDialog
      open={!!lineItemToDelete}
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this line item?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the line
            item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              lineItemToDelete &&
              onDelete(lineItemToDelete.id, lineItemToDelete.invoiceId)
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
