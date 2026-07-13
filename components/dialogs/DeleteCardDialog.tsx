import React from 'react';
import { Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import type { Customer, IssuedCard } from '../../types';

interface DeleteCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCustomer: Customer | null;
  activeCard: IssuedCard | null;
  onConfirm: () => void;
}

export function DeleteCardDialog({ open, onOpenChange, activeCustomer, onConfirm }: DeleteCardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this card for <strong>{activeCustomer?.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash size={16} /> Delete Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
