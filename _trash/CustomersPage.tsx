import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
    MoreHorizontal, Plus, Trash, Edit, Phone, Mail, Stamp, 
    CreditCard, Minus, Gift, ExternalLink, ArrowLeft, UserPlus, 
    CheckCircle2, User, ChevronRight 
} from "lucide-react";
import { SearchInput } from "./ui/search-input";
import { AvatarInitials } from "./ui/avatar-initials";
import { cn } from "../lib/utils";
import { Customer, Template, IssuedCard, Transaction } from '../types';
import { IssueCardDialog } from './IssueCardDialog';
import { useAuth } from '@/app/providers/AuthProvider';
import { buildPublicCardUrl } from '../lib/links';
import { PaginationBar } from './ui/pagination';
import { resolveCardTemplate } from '../lib/templateSerialization';
import { todayISO, createTransaction } from '../lib/transactionHelpers';
import { formatPhoneNumber } from '../lib/format';
import { AddStampDialog } from '@/features/cards/components/AddStampDialog';
import { RedeemRewardDialog } from '@/features/cards/components/RedeemRewardDialog';
import { EditCustomerDialog } from '@/features/cards/components/EditCustomerDialog';
import { useCardActions } from '../hooks/useCardActions';
import { useCustomerDialogs } from '../hooks/useCustomerDialogs';

interface CustomersPageProps {
  customers: Customer[];
  campaigns: Template[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ customers, campaigns, setCustomers }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser, currentOwner } = useAuth();

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);
  
  // Dialog States
  const {
    isIssueOpen, setIsIssueOpen,
    isEditOpen, setIsEditOpen,
    isStampOpen, setIsStampOpen,
    isRedeemOpen, setIsRedeemOpen,
    activeCustomer, setActiveCustomer,
    activeCard, setActiveCard,
    mobileError, setMobileError,
    editFormData, setEditFormData,
    onMobileChange,
  } = useCustomerDialogs();

  const { addStamp, removeStamp, redeemReward, deleteCard } = useCardActions({
    customers,
    setCustomers,
    currentUser,
    activeCustomer,
    activeCard,
    setActiveCard,
    setActiveCustomer,
    campaigns,
  });

  const handleAddStamp = async () => {
    await addStamp();
    setIsStampOpen(false);
  };

  const handleRemoveStamp = async (customer: Customer, card: IssuedCard) => {
    await removeStamp(customer, card);
  };

  const handleRedeemReward = async () => {
    await redeemReward();
    setIsRedeemOpen(false);
  };

  const handleDeleteCard = async (customerId: string, cardId: string) => {
    await deleteCard(customerId, cardId);
  };

  const openIssueWizard = () => {
    setIsIssueOpen(true);
  };

  const handleIssueCard = (campaign: Template, customer: Customer | null, newCustomerData: {name: string, email: string, mobile: string}): IssuedCard => {
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
          history: [initialTransaction]
      };

      const targetId = targetCustomer!.id;
      const customerToAdd = targetCustomer!;

      setCustomers(prev => {
          const exists = prev.find(c => c.id === targetId);
          if (exists) {
              return prev.map(c => c.id === targetId
                  ? { ...c, cards: [...c.cards, newCard] }
                  : c
              );
          } else {
              return [...prev, { ...customerToAdd, cards: [newCard] }];
          }
      });
      return newCard;
  };

  // --- OTHER ACTIONS ---

  const handleEditSave = () => {
    if (mobileError || !activeCustomer) return;
    const updatedCustomers = customers.map(c => 
        c.id === activeCustomer.id ? { ...c, ...editFormData } : c
    );
    setCustomers(updatedCustomers);
    setIsEditOpen(false);
    setActiveCustomer(null);
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
            pagedData.map(({ customer, card }) => (
              <div key={card.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
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
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CreditCard size={12} />
                    <span>{card.campaignName}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { const slug = currentOwner?.slug; if (!slug) return; window.open(buildPublicCardUrl(slug, card.uniqueId), '_blank'); }} className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Public View
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setActiveCustomer(customer); setActiveCard(card); setIsStampOpen(true); }} className="cursor-pointer font-medium text-green-600 focus:text-green-600">
                        <Plus className="mr-2 h-4 w-4" /> Add Stamp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRemoveStamp(customer, card)} className="cursor-pointer text-orange-600 focus:text-orange-600" disabled={card.stamps === 0}>
                        <Minus className="mr-2 h-4 w-4" /> Remove Stamp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setActiveCustomer(customer); setActiveCard(card); setIsRedeemOpen(true); }} className="cursor-pointer font-medium text-purple-600 focus:text-purple-600">
                        <Gift className="mr-2 h-4 w-4" /> Redeem Reward
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setActiveCustomer(customer); setEditFormData({ name: customer.name, email: customer.email, mobile: customer.mobile || '' }); setIsEditOpen(true); }} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => handleDeleteCard(customer.id, card.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Revoke Card
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
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
            {                filteredList.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No issued cards found.
                    </TableCell>
                </TableRow>
            ) : (
                pagedData.map(({ customer, card }) => (
                <TableRow key={card.id} className="hover:bg-muted/50 transition-colors">
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
                         <div className="flex items-center justify-end gap-1 font-bold text-lg text-primary">
                            <Stamp size={16} className="text-primary/70" />
                            {card.stamps}
                         </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{card.lastVisit}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                    const slug = currentOwner?.slug;
                                    if (!slug) return;
                                    window.open(buildPublicCardUrl(slug, card.uniqueId), '_blank');
                                }} className="cursor-pointer">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Public View
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => { setActiveCustomer(customer); setActiveCard(card); setIsStampOpen(true); }} 
                                    className="cursor-pointer font-medium text-green-600 focus:text-green-600"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Stamp
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleRemoveStamp(customer, card)} 
                                    className="cursor-pointer text-orange-600 focus:text-orange-600" 
                                    disabled={card.stamps === 0}
                                >
                                    <Minus className="mr-2 h-4 w-4" /> Remove Stamp
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => { setActiveCustomer(customer); setActiveCard(card); setIsRedeemOpen(true); }} 
                                    className="cursor-pointer font-medium text-purple-600 focus:text-purple-600"
                                >
                                    <Gift className="mr-2 h-4 w-4" /> Redeem Reward
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
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => handleDeleteCard(customer.id, card.id)}>
                                    <Trash className="mr-2 h-4 w-4" /> Revoke Card
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </div>
        </div>
        <div className="border-t p-4 bg-gray-50/50">
          <PaginationBar currentPage={currentPage} totalPages={totalPages} totalItems={filteredList.length} onPageChange={setCurrentPage} />
        </div>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        activeCustomer={activeCustomer}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        mobileError={mobileError}
        onMobileChange={onMobileChange}
        onSave={handleEditSave}
      />

      {/* Add Stamp Dialog */}
      <AddStampDialog
        open={isStampOpen}
        onOpenChange={setIsStampOpen}
        activeCustomer={activeCustomer}
        activeCard={activeCard}
        onConfirm={handleAddStamp}
      />

      {/* Redeem Reward Dialog */}
      <RedeemRewardDialog
        open={isRedeemOpen}
        onOpenChange={setIsRedeemOpen}
        activeCard={activeCard}
        onConfirm={handleRedeemReward}
      />
    </div>
  );

};
