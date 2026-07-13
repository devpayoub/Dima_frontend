import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { getStampRequests, acceptStampRequest, declineStampRequest, StampRequest } from '@/lib/api/stampRequests';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationBar } from '@/components/ui/pagination';
import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

const PAGE_SIZE = 8;

export const RequestsPage: React.FC = () => {
  const { currentOwner, currentUser } = useAuth();
  const ownerId = currentOwner?.id || currentUser?.id;

  const [requests, setRequests] = useState<StampRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const loadingRef = useRef(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getStampRequests();
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const loadRequestsSilent = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const data = await getStampRequests();
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(sorted);
    } catch {
      // silent — ignore errors on background refresh
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, []);

  // Realtime subscription for new/updated requests
  useEffect(() => {
    if (!ownerId) return;

    const channel = supabase
      .channel('stamp-requests-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stamp_requests', filter: `owner_id=eq.${ownerId}` },
        () => {
          loadRequestsSilent();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stamp_requests', filter: `owner_id=eq.${ownerId}` },
        (payload) => {
          const updated = payload.new as any;
          setRequests(prev => prev.map(r =>
            r.id === updated.id
              ? { ...r, status: updated.status, acceptedCardId: updated.accepted_card_id, updatedAt: updated.updated_at }
              : r
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId, loadRequestsSilent]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filteredRequests = useMemo(() =>
    requests.filter(r =>
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [requests, searchQuery]);

  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const pagedData = useMemo(() =>
    filteredRequests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredRequests, currentPage]);

  const handleAccept = async (id: string) => {
    setProcessing(id);
    try {
      await acceptStampRequest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r));
    } catch (err: any) {
      alert("Failed to accept: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (id: string) => {
    setProcessing(id);
    try {
      await declineStampRequest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' as const } : r));
    } catch (err: any) {
      alert("Failed to decline: " + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRefresh = async () => {
    if (refreshBusy) return;
    setRefreshBusy(true);
    try { await loadRequests(); } finally { setRefreshBusy(false); }
  };

  const StatusBadge = ({ status }: { status: StampRequest['status'] }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex w-fit items-center gap-1"><Clock size={12}/> Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex w-fit items-center gap-1"><CheckCircle2 size={12}/> Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex w-fit items-center gap-1"><XCircle size={12}/> Declined</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-gray-50/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Requests</h1>
          <p className="text-muted-foreground">Manage customer stamp requests.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full max-w-sm">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search requests..."
        />
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshBusy} className="shrink-0">
          <RefreshCw size={14} className={refreshBusy ? "animate-spin" : ""} />
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-3">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">No requests found.</div>
          ) : (
            pagedData.map(req => (
              <div key={req.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarInitials name={req.customerName} />
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{req.customerName}</div>
                      <div className="text-xs text-muted-foreground truncate">{req.customerEmail || req.customerPhone}</div>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{req.campaignName}</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDecline(req.id)}
                      disabled={processing === req.id}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAccept(req.id)}
                      disabled={processing === req.id}
                    >
                      {processing === req.id ? "..." : "Accept"}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Customer</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No requests found.</TableCell></TableRow>
              ) : (
                pagedData.map(req => (
                  <TableRow key={req.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={req.customerName} />
                        <div className="flex flex-col">
                          <span className="font-medium">{req.customerName}</span>
                          <span className="text-xs text-muted-foreground">{req.customerEmail || req.customerPhone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{req.campaignName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDecline(req.id)}
                            disabled={processing === req.id}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAccept(req.id)}
                            disabled={processing === req.id}
                          >
                            {processing === req.id ? "Processing..." : "Accept"}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="border-t p-4 bg-gray-50/50">
          <PaginationBar currentPage={currentPage} totalPages={totalPages} totalItems={filteredRequests.length} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};
