import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SearchInput } from './ui/search-input';
import { AvatarInitials } from './ui/avatar-initials';
import {
  Check, X, Clock, Bell, Calendar, ArrowUpDown, Download, History, Filter, RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { supabase } from '../lib/supabase';
import {
  getStampRequests,
  acceptStampRequest,
  declineStampRequest,
  StampRequest,
} from '../lib/api/stampRequests';
import { Skeleton } from './ui/skeleton';
import { cn } from '../lib/utils';

const PAGE_SIZE = 50;

const STATUS_OPTIONS = ['All', 'pending', 'accepted', 'declined', 'expired'] as const;
type StatusFilter = typeof STATUS_OPTIONS[number];

const statusColor = (s: string) => {
  switch (s) {
    case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
    case 'declined': return 'bg-red-100 text-red-700 border-red-200';
    case 'expired': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const escapeCsvValue = (value: string | number | undefined | null) => {
  const normalized = value == null ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

export const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<StampRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getStampRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('stamp_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stamp_requests' }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRequests]);

  const handleAccept = async (id: string, customerName: string) => {
    setProcessingId(id);
    try {
      await acceptStampRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      showToast('success', `${customerName}'s request approved`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: string, customerName: string) => {
    setProcessingId(id);
    try {
      await declineStampRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      showToast('error', `${customerName}'s request declined`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);

  // Sort
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? -diff : diff;
    });
  }, [requests, sortOrder]);

  // Filter
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedRequests.filter(r => {
      const matchesSearch =
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.customerPhone || '').toLowerCase().includes(q) ||
        (r.customerEmail || '').toLowerCase().includes(q) ||
        (r.campaignName || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      const matchesDate = dateFilter
        ? new Date(r.createdAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
        : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [sortedRequests, searchQuery, statusFilter, dateFilter]);

  const visibleRequests = useMemo(() => filteredList.slice(0, visibleCount), [filteredList, visibleCount]);
  const hasMore = filteredList.length > visibleCount;

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, dateFilter, statusFilter, sortOrder]);

  const toggleSort = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  const handleLoadMore = () => setVisibleCount(prev => prev + PAGE_SIZE);

  const handleExportCsv = () => {
    const headers = ['Date', 'Customer Name', 'Phone', 'Email', 'Campaign', 'Status'];
    const rows = filteredList.map(r => [
      new Date(r.createdAt).toISOString(),
      r.customerName,
      r.customerPhone,
      r.customerEmail || '',
      r.campaignName,
      r.status,
    ]);
    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map(row => row.map(escapeCsvValue).join(',')),
    ].join('\r\n');
    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `requests-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full space-y-6 bg-gray-50/50 p-4 md:h-full md:overflow-y-auto md:p-8">

      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg border ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {toast.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Requests</h1>
          <p className="text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} pending approval` : 'No pending requests'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="bg-muted/30 flex items-center border-b px-4 py-3">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-4 w-24 ml-4" />
              <Skeleton className="h-4 w-24 ml-4" />
              <Skeleton className="h-4 w-20 ml-4" />
              <Skeleton className="h-4 w-20 ml-4" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center border-b border-border/50 px-4 py-3 last:border-b-0">
                <div className="flex items-center gap-3 w-[180px]">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 ml-4" />
                <Skeleton className="h-4 w-24 ml-4" />
                <div className="ml-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="ml-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p>No requests yet. When customers request a stamp, it will appear here.</p>
            </div>
          </div>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="w-full max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, phone, or campaign..."
              />
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border w-full sm:w-auto focus-within:ring-2 focus-within:ring-ring focus-within:bg-white transition-colors">
              <Calendar className="text-gray-400" size={20} />
              <input
                type="date"
                className="bg-transparent text-sm outline-none text-gray-600"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="ml-2 text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <Filter size={14} />
                  {statusFilter === 'All' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map(opt => (
                  <DropdownMenuItem key={opt} onClick={() => setStatusFilter(opt)}>
                    <span className={cn(
                      'mr-2 inline-block h-2 w-2 rounded-full',
                      opt === 'pending' ? 'bg-amber-500' : opt === 'accepted' ? 'bg-green-500' : opt === 'declined' ? 'bg-red-500' : opt === 'expired' ? 'bg-gray-400' : 'bg-blue-500'
                    )} />
                    {opt === 'All' ? 'All Status' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchRequests()} className="gap-2">
                <RefreshCw size={14} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2" disabled={filteredList.length === 0}>
                <Download size={16} />
                Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleSort} className="gap-2 text-muted-foreground">
                <ArrowUpDown size={16} />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm">
            {/* Mobile cards */}
            <div className="max-h-[648px] overflow-y-auto space-y-3 p-3 md:hidden">
              {visibleRequests.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
                  <History size={24} className="opacity-20" />
                  No requests found matching your filters.
                </div>
              ) : (
                visibleRequests.map((req) => (
                  <div key={req.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Bell size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-foreground">{req.customerName}</h2>
                            <Badge className={cn('text-[10px] border', statusColor(req.status))}>{req.status}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{req.campaignName}</p>
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{req.customerPhone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatTimeAgo(req.createdAt)}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 gap-1 rounded-full text-xs" onClick={() => handleAccept(req.id, req.customerName)} disabled={processingId === req.id}>
                            <Check size={12} /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 gap-1 rounded-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDecline(req.id, req.customerName)} disabled={processingId === req.id}>
                            <X size={12} /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="max-h-[648px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Customer</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <History size={24} className="opacity-20" />
                          No requests found matching your filters.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AvatarInitials name={req.customerName} className="h-6 w-6 text-[10px]" />
                            <span className="text-sm font-medium">{req.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{req.campaignName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-mono">{req.customerPhone}</span>
                            {req.customerEmail && (
                              <span className="text-xs text-muted-foreground">{req.customerEmail}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {formatTimeAgo(req.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-[10px] border', statusColor(req.status))}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" className="gap-1 rounded-full" onClick={() => handleAccept(req.id, req.customerName)} disabled={processingId === req.id}>
                                <Check size={14} /> Accept
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDecline(req.id, req.customerName)} disabled={processingId === req.id}>
                                <X size={14} /> Decline
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-muted-foreground text-center">
              Showing {visibleRequests.length} of {filteredList.length} request{filteredList.length !== 1 && 's'}
            </div>
            {hasMore && (
              <Button variant="outline" size="sm" onClick={handleLoadMore}>
                Load more
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
