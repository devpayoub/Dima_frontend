import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal, Plus, Trash, Edit, Mail, Stamp,
    CreditCard, Minus, Gift, ExternalLink
} from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { cn } from "@/lib/utils";
import { Customer, Template, IssuedCard } from '@/types';
import { IssueCardDialog } from '@/components/IssueCardDialog';
import { CardDetailDialog } from '@/components/CardDetailDialog';
import { useAuth } from '@/components/AuthProvider';
import { buildPublicCardUrl } from '@/lib/links';
import { PaginationBar } from '@/components/ui/pagination';
import { resolveCardTemplate } from '@/lib/templateSerialization';
import { todayISO, createTransaction } from '@/lib/transactionHelpers';
import * as apiCards from '@/lib/api/issuedCards';
import * as apiTransactions from '@/lib/api/transactions';
import * as apiCustomers from '@/lib/api/customers';
import { useStore } from '@/store/useStore';

const formatPhoneNumber = (value: string) => {
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const IssuedCardsPage: React.FC = () => {
  const { campaigns, customers, updateCustomerStateLocally: setCustomers, refreshData, dataReady } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, currentOwner } = useAuth();

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // Dialog States
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Single Action State
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [activeCard, setActiveCard] = useState<IssuedCard | null>(null);

  const [mobileError, setMobileError] = useState<string>("");

  // Edit Form State
  const [editFormData, setEditFormData] = useState<{name: string; email: string; mobile: string}>({
    name: '', email: '', mobile: ''
  });

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    const digits = formatted.replace(/[^\d]/g, '');

    if (isEdit) {
        setEditFormData({ ...editFormData, mobile: formatted });
    }

    if (digits.length > 0 && digits.length < 10) {
        setMobileError("Enter 10 digits");
    } else {
        setMobileError("");
    }
  };

  const openIssueWizard = () => {
    setIsIssueOpen(true);
  };

  const getMaxStamps = (card: IssuedCard) => {
    const template = resolveCardTemplate(card, campaigns);
    return template ? template.totalStamps : 10;
  };

  const handleIssueCard = async (campaign: Template, customer: Customer | null, newCustomerData: {name: string, email: string, mobile: string}): Promise<IssuedCard> => {
      let targetCustomer = customer;
      const actorName = currentUser?.businessName ?? "Owner";
      const actorRole = currentUser?.role ?? "owner";
      const actorId = currentUser?.id;

      if (!targetCustomer) {
          const newId = `cust-${Date.now()}`;
          targetCustomer = {
              id: newId,
              name: newCustomerData.name,
              email: newCustomerData.email,
              mobile: newCustomerData.mobile,
              status: "Active",
              cards: []
          };
          await apiCustomers.upsert(newId, { id: newId, name: newCustomerData.name, email: newCustomerData.email, mobile: newCustomerData.mobile });
      }

      const initialTransaction = createTransaction({
          type: 'issued',
          amount: 0,
          title: "Card Issued",
          actorName,
          actorRole,
          actorId
      });

      const newCard: IssuedCard = {
          id: `card-${Date.now()}`,
          uniqueId: crypto.randomUUID(),
          campaignId: campaign.id,
          campaignName: campaign.name,
          stamps: 0,
          lastVisit: todayISO(),
          status: 'Active',
          history: [initialTransaction],
          templateSnapshot: campaign as any
      };

      await apiCards.issue({
          id: newCard.id,
          uniqueId: newCard.uniqueId,
          customerId: targetCustomer.id,
          campaignId: campaign.id,
          campaignName: campaign.name,
          templateSnapshot: campaign as any,
          stamps: 0,
          status: 'Active'
      });

      await apiTransactions.log(newCard.id, initialTransaction);

      const targetId = targetCustomer!.id;
      const exists = customers.find(c => c.id === targetId);
      if (exists) {
          setCustomers(customers.map(c => c.id === targetId
              ? { ...c, cards: [...c.cards, newCard] }
              : c
          ));
      } else {
          setCustomers([...customers, { ...targetCustomer!, cards: [newCard] }]);
      }
      return newCard;
  };

  const handleEditSave = async () => {
    if (mobileError || !activeCustomer) return;
    await apiCustomers.upsert(activeCustomer.id, { name: editFormData.name, email: editFormData.email, mobile: editFormData.mobile });
    const updatedCustomers = customers.map(c =>
        c.id === activeCustomer.id ? { ...c, ...editFormData } : c
    );
    setCustomers(updatedCustomers);
    setIsEditOpen(false);
    setActiveCustomer(null);
  };

  const updateCardStamps = async (amount: number, reset: boolean = false) => {
    if (!activeCustomer || !activeCard) return;

    const campaign = resolveCardTemplate(activeCard, campaigns);
    const maxStamps = campaign ? campaign.totalStamps : 10;

    let newStamps = reset ? 0 : activeCard.stamps + amount;
    if (newStamps > maxStamps) return;
    if (newStamps < 0) return;

    const txType = reset ? 'redeem' : (amount > 0 ? 'stamp_add' : 'stamp_remove');
    const txTitle = reset ? 'Reward Redeemed' : (amount > 0 ? 'Stamp Collected' : 'Stamp Removed');
    const newTransaction = createTransaction({
        type: txType,
        amount: reset ? 0 : amount,
        title: txTitle,
        actorName: currentUser?.businessName ?? "Owner",
        actorRole: currentUser?.role ?? "owner",
        actorId: currentUser?.id
    });

    const updatedCard: IssuedCard = {
        ...activeCard,
        stamps: newStamps,
        lastVisit: todayISO(),
        history: [newTransaction, ...activeCard.history]
    };

    if (reset) {
        updatedCard.status = 'Redeemed';
        updatedCard.completedDate = todayISO();
    }

    await apiCards.update(activeCard.id, {
        stamps: newStamps,
        status: updatedCard.status,
        completedDate: updatedCard.completedDate,
        lastVisit: updatedCard.lastVisit
    });

    await apiTransactions.log(activeCard.id, newTransaction);

    const updatedCustomers = customers.map(c => {
        if (c.id === activeCustomer.id) {
            return {
                ...c,
                cards: c.cards.map(card => card.id === activeCard.id ? updatedCard : card)
            };
        }
        return c;
    });

    setCustomers(updatedCustomers);
    setActiveCard(updatedCard);
    setActiveCustomer(updatedCustomers.find(c => c.id === activeCustomer.id) ?? activeCustomer);
  };

  const handleAddStamp = async () => {
     await updateCardStamps(1);
     setIsStampOpen(false);
  };

  const handleRemoveStamp = async (customer: Customer, card: IssuedCard) => {
    if (card.stamps > 0) {
        const newTransaction = createTransaction({
            type: 'stamp_remove',
            amount: -1,
            title: 'Stamp Removed',
            remarks: 'Manual correction',
            actorName: currentUser?.businessName ?? "Owner",
            actorRole: currentUser?.role ?? "owner",
            actorId: currentUser?.id
        });

        const updatedCard: IssuedCard = {
            ...card,
            stamps: card.stamps - 1,
            history: [newTransaction, ...card.history]
        };

        await apiCards.update(card.id, { stamps: card.stamps - 1 });
        await apiTransactions.log(card.id, newTransaction);

        const updatedCustomers = customers.map(c => c.id === customer.id ? { ...c, cards: c.cards.map(cc => cc.id === card.id ? updatedCard : cc) } : c);
        setCustomers(updatedCustomers);
        if (activeCard?.id === card.id) {
            setActiveCard(updatedCard);
            setActiveCustomer(updatedCustomers.find(c => c.id === customer.id) ?? customer);
        }
    }
  };

  const handleRedeemReward = async () => {
     await updateCardStamps(0, true);
     setIsRedeemOpen(false);
  };

  const handleDeleteCard = async (customerId: string, cardId: string) => {
    await apiCards.remove(cardId);
    const updatedCustomers = customers.map(c => {
        if (c.id === customerId) {
             return { ...c, cards: c.cards.filter(card => card.id !== cardId) };
        }
        return c;
    }).filter(c => c.cards.length > 0 || c.id !== customerId);
    setCustomers(updatedCustomers);
  };

  const openDetail = (customer: Customer, card: IssuedCard) => {
    setActiveCustomer(customer);
    setActiveCard(card);
    setIsDetailOpen(true);
  };

  // Flatten logic
  const flatList = customers.flatMap(c => c.cards.map(card => ({ customer: c, card })));
  const filteredList = flatList.filter(({ customer, card }) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PAGE_SIZE = 8;
  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  const pagedData = useMemo(() => filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredList, currentPage]);

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Issued Cards</h1>
            <p className="text-muted-foreground">Manage active cards across all campaigns.</p>
        </div>
        <Button onClick={openIssueWizard} className="gap-2 shadow-sm">
            <Plus size={16} /> Issue New Card
        </Button>
      </div>

       <IssueCardDialog
          isOpen={isIssueOpen}
          onClose={() => setIsIssueOpen(false)}
          campaigns={campaigns}
          customers={customers}
          onIssue={handleIssueCard}
      />

      <div className="w-full max-w-sm">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, or campaign..."
        />
      </div>

      <div className="flex-1 flex flex-col justify-between rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-3">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
              No issued cards found.
            </div>
          ) : (
            pagedData.map(({ customer, card }) => {
              const maxStamps = getMaxStamps(card);
              const rewardReady = card.stamps >= maxStamps && card.status !== 'Redeemed';
              return (
              <div key={card.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm cursor-pointer active:bg-muted/40 transition-colors"
                  onClick={() => openDetail(customer, card)}
                >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarInitials name={customer.name} />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{customer.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail size={10} /> {customer.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-lg text-primary shrink-0">
                    <Stamp size={14} className="text-primary/70" />
                    {card.stamps}
                    <span className="text-xs font-semibold text-muted-foreground">/ {maxStamps}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                      <CreditCard size={12} className="shrink-0" />
                      <span className="truncate">{card.campaignName}</span>
                    </div>
                    {rewardReady && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-[10px] shrink-0">
                        <Gift size={10} className="mr-1" /> Ready
                      </Badge>
                    )}
                    {card.status === 'Redeemed' && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">Redeemed</Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openDetail(customer, card)} className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { const slug = currentOwner?.slug; if (!slug) return; window.open(buildPublicCardUrl(slug, card.uniqueId), '_blank'); }} className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Public View
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setActiveCustomer(customer); setEditFormData({ name: customer.name, email: customer.email, mobile: customer.mobile || '' }); setIsEditOpen(true); }} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => { setActiveCustomer(customer); setActiveCard(card); setIsDeleteOpen(true); }}>
                        <Trash className="mr-2 h-4 w-4" /> Delete Card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              );
            })
          )}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Cardholder</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Last Visit</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No issued cards found.
                    </TableCell>
                </TableRow>
            ) : (
                pagedData.map(({ customer, card }) => {
                  const maxStamps = getMaxStamps(card);
                  const rewardReady = card.stamps >= maxStamps && card.status !== 'Redeemed';
                  return (
                <TableRow key={card.id} className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => openDetail(customer, card)}
                    >
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <AvatarInitials name={customer.name} />
                            <div className="font-semibold">{customer.name}</div>
                        </div>
                    </TableCell>
                    <TableCell>
                         <div className="flex items-center gap-1.5">
                            <CreditCard size={14} className="text-muted-foreground" />
                            <span className="text-sm font-medium">{card.campaignName}</span>
                         </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col text-sm space-y-0.5">
                            <span className="flex items-center gap-1.5 text-foreground/80">
                                <Mail size={12} className="text-muted-foreground"/> {customer.email}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                            {rewardReady && (
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-[10px]">
                                    <Gift size={10} className="mr-1" /> Ready
                                </Badge>
                            )}
                            {card.status === 'Redeemed' && (
                                <Badge variant="secondary" className="text-[10px]">Redeemed</Badge>
                            )}
                            <div className="flex items-center gap-1 font-bold text-lg text-primary">
                                <Stamp size={16} className="text-primary/70" />
                                {card.stamps}
                                <span className="text-xs font-semibold text-muted-foreground">/ {maxStamps}</span>
                            </div>
                         </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{card.lastVisit}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openDetail(customer, card)} className="cursor-pointer">
                                    <CreditCard className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    const slug = currentOwner?.slug;
                                    if (!slug) return;
                                    window.open(buildPublicCardUrl(slug, card.uniqueId), '_blank');
                                }} className="cursor-pointer">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Public View
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        setActiveCustomer(customer);
                                        setEditFormData({ name: customer.name, email: customer.email, mobile: customer.mobile || '' });
                                        setIsEditOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => { setActiveCustomer(customer); setActiveCard(card); setIsDeleteOpen(true); }}>
                                    <Trash className="mr-2 h-4 w-4" /> Delete Card
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
        </div>
        <div className="border-t p-4 bg-gray-50/50">
          <PaginationBar currentPage={currentPage} totalPages={totalPages} totalItems={filteredList.length} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Edit Customer Dialog */}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-email" className="text-right">Email</Label>
                    <Input
                        id="edit-email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
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
                            onChange={(e) => handleMobileChange(e, true)}
                            className={cn(mobileError && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {mobileError && <p className="text-[10px] text-red-500 ml-1">{mobileError}</p>}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleEditSave} disabled={!!mobileError}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Add Stamp Dialog */}
       <Dialog open={isStampOpen} onOpenChange={setIsStampOpen}>
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
                <Button variant="outline" onClick={() => setIsStampOpen(false)}>Cancel</Button>
                <Button onClick={handleAddStamp} className="gap-2"><Stamp size={16}/> Confirm Stamp</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Reward Dialog */}
      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
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
                <Button variant="outline" onClick={() => setIsRedeemOpen(false)}>Cancel</Button>
                <Button onClick={handleRedeemReward} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <Gift size={16}/> Confirm Redemption
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
                <DialogTitle>Delete Card</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this card for <strong>{activeCustomer?.name}</strong>? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                    if (activeCustomer && activeCard) {
                        handleDeleteCard(activeCustomer.id, activeCard.id);
                        setIsDeleteOpen(false);
                    }
                }} className="gap-2">
                    <Trash size={16}/> Delete Card
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Detail Dialog */}
      <CardDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customer={activeCustomer}
        card={activeCard}
        template={activeCard ? resolveCardTemplate(activeCard, campaigns) : undefined}
        onAddStamp={handleAddStamp}
        onRemoveStamp={() => { if (activeCustomer && activeCard) handleRemoveStamp(activeCustomer, activeCard); }}
        onRedeem={() => { handleRedeemReward(); setIsDetailOpen(false); }}
        onPublicView={() => {
            const slug = currentOwner?.slug;
            if (!slug || !activeCard) return;
            window.open(buildPublicCardUrl(slug, activeCard.uniqueId), '_blank');
        }}
        onEditProfile={() => {
            if (!activeCustomer) return;
            setEditFormData({ name: activeCustomer.name, email: activeCustomer.email, mobile: activeCustomer.mobile || '' });
            setIsDetailOpen(false);
            setIsEditOpen(true);
        }}
        onRevoke={() => {
            if (activeCustomer && activeCard) {
                handleDeleteCard(activeCustomer.id, activeCard.id);
                setIsDetailOpen(false);
            }
        }}
      />
    </div>
  );

};
