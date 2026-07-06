import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Template } from '../types';
import { LoyaltyCard } from './LoyaltyCard';

interface SimpleCampaignEditModalProps {
  campaign: Template;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Template>) => Promise<void>;
}

export function SimpleCampaignEditModal({ campaign, isOpen, onClose, onSave }: SimpleCampaignEditModalProps) {
  const [name, setName] = useState(campaign.name);
  const [rewardName, setRewardName] = useState(campaign.reward_name);
  const [totalStamps, setTotalStamps] = useState(campaign.total_stamps.toString());
  const [isSaving, setIsSaving] = useState(false);

  const previewTemplate = useMemo<Template>(() => ({
    ...campaign,
    name,
    reward_name: rewardName,
    total_stamps: parseInt(totalStamps, 10) || campaign.total_stamps,
  }), [campaign, name, rewardName, totalStamps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name,
        reward_name: rewardName,
        total_stamps: parseInt(totalStamps, 10),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save campaign details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-2">
          <div className="w-[200px]">
            <LoyaltyCard template={previewTemplate} mode="active" className="w-full pointer-events-none rounded-xl shadow-lg" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalStamps">Number of Stamps / Points Goal</Label>
            <Input 
              id="totalStamps" 
              type="number" 
              min="1" 
              value={totalStamps} 
              onChange={(e) => setTotalStamps(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rewardName">Reward Description</Label>
            <Input 
              id="rewardName" 
              value={rewardName} 
              onChange={(e) => setRewardName(e.target.value)} 
              required 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
