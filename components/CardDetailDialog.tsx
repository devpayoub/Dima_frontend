import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Gift, Mail, Phone, CreditCard, ExternalLink, Edit, Trash, CalendarDays } from "lucide-react";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { cn } from "@/lib/utils";
import { Customer, IssuedCard, Template } from '@/types';

interface CardDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  card: IssuedCard | null;
  template: Template | undefined;
  onAddStamp: () => void;
  onRemoveStamp: () => void;
  onRedeem: () => void;
  onPublicView?: () => void;
  onEditProfile?: () => void;
  onRevoke?: () => void;
}

export const CardDetailDialog: React.FC<CardDetailDialogProps> = ({
  open,
  onOpenChange,
  customer,
  card,
  template,
  onAddStamp,
  onRemoveStamp,
  onRedeem,
  onPublicView,
  onEditProfile,
  onRevoke,
}) => {
  if (!customer || !card || !template) return null;

  const isRedeemed = card.status === 'Redeemed';
  const maxStamps = template.totalStamps;
  const canRemove = card.stamps > 0 && !isRedeemed;
  const canAdd = card.stamps < maxStamps && !isRedeemed;
  const canRedeem = card.stamps >= maxStamps && !isRedeemed;
  const progress = Math.min(100, Math.round((card.stamps / Math.max(maxStamps, 1)) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-3">
            <AvatarInitials name={customer.name} />
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2 text-lg leading-tight">
                <span className="truncate">{customer.name}</span>
                <Badge
                  variant={isRedeemed ? "secondary" : "default"}
                  className={cn("text-[10px] shrink-0", canRedeem && "bg-purple-600 hover:bg-purple-600")}
                >
                  {isRedeemed ? "Redeemed" : canRedeem ? "Reward Ready" : "Active"}
                </Badge>
              </DialogTitle>
              <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                {customer.email && (
                  <span className="flex items-center gap-1.5 truncate">
                    <Mail size={11} /> {customer.email}
                  </span>
                )}
                {customer.mobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={11} /> {customer.mobile}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground/80">
              <CreditCard size={12} /> {card.campaignName}
            </span>
            {card.lastVisit && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={12} /> Last visit: {card.lastVisit}
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Card preview */}
        <div className="flex justify-center px-6 py-5 bg-gradient-to-b from-muted/40 to-transparent">
          <LoyaltyCard
            template={template}
            mode="active"
            readOnly={true}
            currentStamps={card.stamps}
            customerName={customer.name}
            isRedeemed={isRedeemed}
            sizeVariant="compact"
          />
        </div>

        {/* Progress */}
        <div className="px-6 pb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">Stamp Progress</span>
            <span className="font-bold text-foreground">
              {card.stamps} <span className="text-muted-foreground font-medium">/ {maxStamps}</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                canRedeem ? "bg-purple-600" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          {canRedeem && (
            <div className="flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-xs font-medium text-purple-700">
              <Gift size={14} className="shrink-0" />
              This card is complete. The reward is ready to be redeemed!
            </div>
          )}
        </div>

        {/* Primary actions */}
        <div className="flex gap-2 px-6 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!canRemove}
            onClick={onRemoveStamp}
          >
            <Minus size={14} /> Remove
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!canAdd}
            onClick={onAddStamp}
          >
            <Plus size={14} /> Add Stamp
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!canRedeem}
            onClick={onRedeem}
          >
            <Gift size={14} /> Redeem
          </Button>
        </div>

        {/* Secondary actions */}
        {(onPublicView || onEditProfile || onRevoke) && (
          <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-6 py-3">
            <div className="flex items-center gap-1">
              {onPublicView && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={onPublicView}>
                  <ExternalLink size={13} /> Public View
                </Button>
              )}
              {onEditProfile && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={onEditProfile}>
                  <Edit size={13} /> Edit Profile
                </Button>
              )}
            </div>
            {onRevoke && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onRevoke}>
                <Trash size={13} /> Revoke
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
