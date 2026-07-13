import React from 'react';
import { Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import type { IssuedCard } from '../../types';

interface RedeemRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCard: IssuedCard | null;
  onConfirm: () => void;
}

export function RedeemRewardDialog({ open, onOpenChange, activeCard, onConfirm }: RedeemRewardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Redeem Reward</DialogTitle>
          <DialogDescription>Deduct all stamps for reward?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 gap-6">
          <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border-4 border-purple-100">
            <Gift size={32} />
          </div>
          <p className="text-center text-sm text-muted-foreground px-6">
            This will reset the <strong>{activeCard?.campaignName}</strong> stamp balance to 0.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            <Gift size={16} /> Confirm Redemption
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
