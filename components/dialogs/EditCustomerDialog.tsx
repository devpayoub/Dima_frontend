import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';
import type { Customer } from '../../types';

export interface EditFormData {
  name: string;
  email: string;
  mobile: string;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCustomer: Customer | null;
  editFormData: EditFormData;
  setEditFormData: React.Dispatch<React.SetStateAction<EditFormData>>;
  mobileError: string;
  onMobileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  activeCustomer,
  editFormData,
  setEditFormData,
  mobileError,
  onMobileChange,
  onSave,
}: EditCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update contact details for {activeCustomer?.name}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Name</Label>
            <Input
              id="edit-name"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">Email</Label>
            <Input
              id="edit-email"
              value={editFormData.email}
              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-mobile" className="text-right mt-3">Mobile</Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="edit-mobile"
                placeholder="(555) 000-0000"
                value={editFormData.mobile}
                onChange={onMobileChange}
                className={cn(mobileError && "border-red-500 focus-visible:ring-red-500")}
              />
              {mobileError && <p className="text-[10px] text-red-500 ml-1">{mobileError}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={!!mobileError}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
