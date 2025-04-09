'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Invoice, LineItem } from '@/lib/db/schema';
import {
  fetchInvoices,
  updateInvoiceAction,
  fetchLineItems,
  updateLineItemAction,
  deleteLineItemAction,
  addLineItemAction,
} from '@/app/actions';
import { InvoiceTable } from './invoice-table';
import { DeleteLineItemDialog } from './delete-line-item-dialog';
import type {
  SortColumn,
  SortDirection,
  EditingInvoice,
  EditingLineItem,
  NewLineItem,
} from './types';
import React from 'react';

export default function ProcessedInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingInvoice, setEditingInvoice] = useState<EditingInvoice | null>(
    null,
  );
  const [editingLineItem, setEditingLineItem] =
    useState<EditingLineItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLineItem, setIsSavingLineItem] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState<
    Record<string, boolean>
  >({});
  const [lineItems, setLineItems] = useState<Record<string, LineItem[]>>({});
  const [loadingLineItems, setLoadingLineItems] = useState<
    Record<string, boolean>
  >({});
  const [isDeletingLineItem, setIsDeletingLineItem] = useState(false);
  const [lineItemToDelete, setLineItemToDelete] = useState<{
    id: string;
    invoiceId: string;
  } | null>(null);
  const [newLineItem, setNewLineItem] = useState<NewLineItem>({
    description: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [isAddingLineItem, setIsAddingLineItem] = useState(false);
  const [invoiceIdForNewLineItem, setInvoiceIdForNewLineItem] = useState<
    string | null
  >(null);

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

  const toggleExpandInvoice = async (invoiceId: string) => {
    // Toggle the expanded state
    setExpandedInvoices((prev) => ({
      ...prev,
      [invoiceId]: !prev[invoiceId],
    }));

    // If we're expanding and don't have line items yet, fetch them
    if (!expandedInvoices[invoiceId] && !lineItems[invoiceId]) {
      setLoadingLineItems((prev) => ({ ...prev, [invoiceId]: true }));

      try {
        const result = await fetchLineItems({ id: invoiceId });
        if (result.success && result.data) {
          setLineItems((prev) => ({
            ...prev,
            [invoiceId]: result.data,
          }));
        } else {
          toast.error(result.error || 'Failed to load line items');
        }
      } catch (err) {
        console.error('Error fetching line items:', err);
        toast.error('Failed to load line items');
      } finally {
        setLoadingLineItems((prev) => ({ ...prev, [invoiceId]: false }));
      }
    }
  };

  const startEditingLineItem = (item: LineItem, field: keyof LineItem) => {
    let value: string | number;

    if (field === 'quantity' || field === 'unitPrice' || field === 'total') {
      value = item[field] as number;
    } else {
      value = item[field] as string;
    }

    setEditingLineItem({ id: item.id, field, value });
  };

  const cancelEditingLineItem = () => {
    setEditingLineItem(null);
  };

  const handleLineItemInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!editingLineItem) return;

    let value: string | number;

    if (e.target.type === 'number') {
      value = Number.parseFloat(e.target.value);
    } else {
      value = e.target.value;
    }

    setEditingLineItem({ ...editingLineItem, value });
  };

  const saveLineItemEdit = async () => {
    if (!editingLineItem) return;

    setIsSavingLineItem(true);

    try {
      // Find the invoice that contains this line item
      const invoiceId = Object.keys(lineItems).find((id) =>
        lineItems[id].some((item) => item.id === editingLineItem.id),
      );

      if (!invoiceId) throw new Error('Invoice not found for this line item');

      const lineItemList = lineItems[invoiceId];
      const lineItem = lineItemList.find(
        (item) => item.id === editingLineItem.id,
      );

      if (!lineItem) throw new Error('Line item not found');

      const updatedLineItem = { ...lineItem };

      // Update the specific field
      if (
        editingLineItem.field === 'quantity' ||
        editingLineItem.field === 'unitPrice' ||
        editingLineItem.field === 'total'
      ) {
        updatedLineItem[editingLineItem.field] =
          editingLineItem.value as number;
      } else if (editingLineItem.field === 'description') {
        updatedLineItem[editingLineItem.field] =
          editingLineItem.value as string;
      } else {
        throw new Error(`Invalid field: ${editingLineItem.field}`);
      }

      // Recalculate total if quantity or unit price changed
      if (
        editingLineItem.field === 'quantity' ||
        editingLineItem.field === 'unitPrice'
      ) {
        updatedLineItem.total =
          updatedLineItem.quantity * updatedLineItem.unitPrice;
      }

      const result = await updateLineItemAction({
        id: updatedLineItem.id,
        description: updatedLineItem.description,
        quantity: updatedLineItem.quantity,
        unitPrice: updatedLineItem.unitPrice,
        total: updatedLineItem.total,
      });

      if (result.success) {
        // Update the local state
        setLineItems((prev) => ({
          ...prev,
          [invoiceId]: prev[invoiceId].map((item) =>
            item.id === updatedLineItem.id ? updatedLineItem : item,
          ),
        }));
        toast.success('Line item updated successfully');
      } else {
        toast.error(result.error || 'Failed to update line item');
      }
    } catch (error) {
      console.error('Error saving line item:', error);
      toast.error('Failed to update line item');
    } finally {
      setIsSavingLineItem(false);
      setEditingLineItem(null);
    }
  };

  const handleDeleteLineItem = async (
    lineItemId: string,
    invoiceId: string,
  ) => {
    setIsDeletingLineItem(true);

    try {
      const result = await deleteLineItemAction({ id: lineItemId });

      if (result.success) {
        // Update the local state by removing the deleted line item
        setLineItems((prev) => ({
          ...prev,
          [invoiceId]: prev[invoiceId].filter((item) => item.id !== lineItemId),
        }));
        toast.success('Line item deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete line item');
      }
    } catch (error) {
      console.error('Error deleting line item:', error);
      toast.error('Failed to delete line item');
    } finally {
      setIsDeletingLineItem(false);
      setLineItemToDelete(null);
    }
  };

  const handleAddLineItem = async (invoiceId: string) => {
    setInvoiceIdForNewLineItem(invoiceId);
  };

  const handleNewLineItemChange = (field: keyof NewLineItem, value: string) => {
    const parsedValue =
      field === 'quantity' || field === 'unitPrice'
        ? Number.parseFloat(value)
        : value;
    setNewLineItem((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsedValue) ? '' : parsedValue,
    }));
  };

  const saveNewLineItem = async () => {
    if (!invoiceIdForNewLineItem) return;

    setIsAddingLineItem(true);

    try {
      const result = await addLineItemAction({
        invoiceId: invoiceIdForNewLineItem,
        description: newLineItem.description,
        quantity: newLineItem.quantity || 0,
        unitPrice: newLineItem.unitPrice || 0,
      });

      if (result.success) {
        // Refresh the line items for this invoice
        const lineItemsResult = await fetchLineItems({
          id: invoiceIdForNewLineItem,
        });
        if (lineItemsResult.success && lineItemsResult.data) {
          setLineItems((prev) => ({
            ...prev,
            [invoiceIdForNewLineItem]: lineItemsResult.data,
          }));
        }

        // Reset the form
        setNewLineItem({
          description: '',
          quantity: 1,
          unitPrice: 0,
        });
        setInvoiceIdForNewLineItem(null);
        toast.success('Line item added successfully');
      } else {
        toast.error(result.error || 'Failed to add line item');
      }
    } catch (error) {
      console.error('Error adding line item:', error);
      toast.error('Failed to add line item');
    } finally {
      setIsAddingLineItem(false);
    }
  };

  const calculateTotal = () => {
    const quantity = newLineItem.quantity || 0;
    const unitPrice = newLineItem.unitPrice || 0;
    return (quantity * unitPrice).toFixed(2);
  };

  const cancelAddLineItem = () => {
    setNewLineItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
    setInvoiceIdForNewLineItem(null);
    setIsAddingLineItem(false);
  };

  return (
    <>
      <InvoiceTable
        invoices={invoices}
        loading={loading}
        error={error}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        editingInvoice={editingInvoice}
        isSaving={isSaving}
        expandedInvoices={expandedInvoices}
        lineItems={lineItems}
        loadingLineItems={loadingLineItems}
        editingLineItem={editingLineItem}
        isSavingLineItem={isSavingLineItem}
        isDeletingLineItem={isDeletingLineItem}
        lineItemToDelete={lineItemToDelete}
        newLineItem={newLineItem}
        isAddingLineItem={isAddingLineItem}
        invoiceIdForNewLineItem={invoiceIdForNewLineItem}
        onSort={handleSort}
        onToggleExpandInvoice={toggleExpandInvoice}
        onStartEditing={startEditing}
        onInputChange={handleInputChange}
        onSaveEdit={saveEdit}
        onCancelEditing={cancelEditing}
        onStartEditingLineItem={startEditingLineItem}
        onLineItemInputChange={handleLineItemInputChange}
        onSaveLineItemEdit={saveLineItemEdit}
        onCancelEditingLineItem={cancelEditingLineItem}
        onDeleteLineItem={(lineItemId, invoiceId) =>
          setLineItemToDelete({ id: lineItemId, invoiceId })
        }
        onNewLineItemChange={handleNewLineItemChange}
        onSaveNewLineItem={saveNewLineItem}
        onCancelAddLineItem={cancelAddLineItem}
        onAddLineItem={handleAddLineItem}
        calculateTotal={calculateTotal}
      />
      <DeleteLineItemDialog
        lineItemToDelete={lineItemToDelete}
        onOpenChange={(open) => !open && setLineItemToDelete(null)}
        onDelete={handleDeleteLineItem}
      />
    </>
  );
}
