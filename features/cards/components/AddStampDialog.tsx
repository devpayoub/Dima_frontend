import React from 'react';
import { Stamp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Customer, IssuedCard } from '@/types';

interface AddStampDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCustomer: Customer | null;
  activeCard: IssuedCard | null;
  onConfirm: () => void;
}

export function AddStampDialog({ open, onOpenChange, activeCustomer, activeCard, onConfirm }: AddStampDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Stamp</DialogTitle>
          <DialogDescription>Record a purchase for {activeCustomer?.name}?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-primary border-4 border-primary/10 shadow-inner animate-pulse">
              <Stamp size={40} />
            </div>
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-sm font-bold px-2.5 py-1 rounded-full border-2 border-white shadow-sm">
              +1
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">New Balance</p>
            <div className="text-4xl font-bold flex items-center justify-center gap-3">
              <span className="text-muted-foreground/30">{activeCard?.stamps}</span>
              <span className="text-muted-foreground/30">&rarr;</span>
              <span className="text-primary">{activeCard ? activeCard.stamps + 1 : 0}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm} className="gap-2"><Stamp size={16} /> Confirm Stamp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
