import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Edit, UserPlus, RefreshCw } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { Customer } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { upsertCustomer } from '@/lib/db/customers';
import { useAuth } from '@/app/providers/AuthProvider';
import { Alert } from '@/components/ui/alert';
import { PaginationBar } from '@/components/ui/pagination';
import { CustomersSkeleton } from '@/features/customers/components/CustomersSkeleton';

import { useStore } from '@/store/useStore';

interface CustomerDirectoryProps {
  readOnly?: boolean;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({ readOnly = false }) => {
  const { customers, updateCustomerStateLocally: setCustomers, refreshData, dataReady } = useStore();
  const { currentOwner } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PAGE_SIZE = 8;
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const pagedData = useMemo(() => filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredCustomers, currentPage]);

  if (!dataReady) return <CustomersSkeleton />;

  const handleSaveEdit = async () => {
    if (!editingCustomer || !currentOwner) return;
    setError("");
    setBusy(true);
    const result = await upsertCustomer(
      { id: editingCustomer.id, name: formData.name, email: formData.email, mobile: formData.mobile, status: editingCustomer.status },
      currentOwner.id
    );
    setBusy(false);
    if (result.ok) {
      if (refreshData && currentOwner) {
        void refreshData(currentOwner.id);
      } else {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c));
      }
      setEditingCustomer(null);
    } else {
      setError(result.error ?? "Unable to update this customer right now.");
    }
  };

  const handleAddCustomer = async () => {
    if (!currentOwner) return;
    setError("");
    setBusy(true);
    const newId = `cust-${Date.now()}`;
    const result = await upsertCustomer(
      { id: newId, name: formData.name, email: formData.email, mobile: formData.mobile, status: 'Active' },
      currentOwner.id
    );
    setBusy(false);
    if (result.ok) {
      if (refreshData && currentOwner) {
        void refreshData(currentOwner.id);
      } else {
        const newCustomer: Customer = {
          id: newId,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          status: 'Active',
          cards: []
        };
        setCustomers([...customers, newCustomer]);
      }
      setIsAddOpen(false);
      setFormData({ name: '', email: '', mobile: '' });
    } else {
      setError(result.error ?? "Unable to create this customer right now.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-gray-50/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database.</p>
        </div>
        {!readOnly && (
          <Button onClick={() => { setFormData({ name: '', email: '', mobile: '' }); setIsAddOpen(true); }} className="gap-2 rounded-full shadow-sm w-full sm:w-auto">
            <UserPlus size={16} /> Add Customer
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full max-w-sm">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customers..."
        />
        {refreshData && (
          <Button variant="outline" size="sm" onClick={async () => { if (!refreshBusy && currentOwner) { setRefreshBusy(true); try { await refreshData(currentOwner.id); } finally { setRefreshBusy(false); }}}} disabled={refreshBusy} className="shrink-0">
            <RefreshCw size={14} className={refreshBusy ? "animate-spin" : ""} />
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <div className="flex-1 flex flex-col justify-between rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-3">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
              No customers found.
            </div>
          ) : (
            pagedData.map(customer => (
              <div key={customer.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarInitials name={customer.name} className="bg-blue-100 text-blue-700" />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{customer.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail size={10} /> {customer.email}
                      </div>
                      {customer.mobile && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {customer.mobile}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {customer.cards.length} cards
                    </span>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingCustomer(customer); setFormData({ name: customer.name, email: customer.email, mobile: customer.mobile || '' }) }}
                      >
                        <Edit size={16} className="text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-center">Active Cards</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No customers found.</TableCell></TableRow>
            ) : (
              pagedData.map(customer => (
                <TableRow key={customer.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={customer.name} className="bg-blue-100 text-blue-700" />
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground gap-1">
                      <div className="flex items-center gap-2"><Mail size={12} /> {customer.email}</div>
                      {customer.mobile && <div className="flex items-center gap-2"><Phone size={12} /> {customer.mobile}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {customer.cards.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingCustomer(customer); setFormData({ name: customer.name, email: customer.email, mobile: customer.mobile || '' }) }}
                      >
                        <Edit size={16} className="text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
        <div className="border-t p-4 bg-gray-50/50">
          <PaginationBar currentPage={currentPage} totalPages={totalPages} totalItems={filteredCustomers.length} onPageChange={setCurrentPage} />
        </div>
      </div>

      <Dialog open={!readOnly && !!editingCustomer} onOpenChange={(o) => !o && !busy && setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Mobile</Label><Input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit} disabled={busy}>{busy ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!readOnly && isAddOpen} onOpenChange={(open) => !busy && setIsAddOpen(open)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Mobile</Label><Input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddCustomer} disabled={!formData.name || busy}>{busy ? "Creating..." : "Create Customer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
