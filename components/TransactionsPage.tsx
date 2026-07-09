import React, { useEffect, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
    Calendar, History,
    Gift, Plus, Minus, CreditCard, ArrowUpDown, Download, RefreshCw
} from "lucide-react";
import { SearchInput } from "./ui/search-input";
import { Customer, Transaction } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { getTransactionMeta } from '../lib/format';
import { TransactionsSkeleton } from './skeletons/TransactionsSkeleton';
import { PaginationBar } from './ui/pagination';

interface TransactionsPageProps {
  customers: Customer[];
  refreshData?: () => Promise<void>;
  dataReady?: boolean;
}

// Flattened Transaction Type
interface FlatTransaction extends Transaction {
    customerName: string;
    customerEmail: string;
    campaignName: string;
    cardId: string;
}

const escapeCsvValue = (value: string | number | undefined) => {
    const normalized = value == null ? "" : String(value);
    return `"${normalized.replace(/"/g, '""')}"`;
};

import { useStore } from '../store/useStore';
import { useAuth } from './AuthProvider';

export const TransactionsPage: React.FC = () => {
  const { customers, refreshData, dataReady } = useStore();
  const { currentOwner } = useAuth();
  
  const handleRefresh = async () => {
      if (currentOwner) await refreshData(currentOwner.id);
  };
  const PAGE_SIZE = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshBusy, setRefreshBusy] = useState(false);

  const allTransactions: FlatTransaction[] = useMemo(() => {
      return customers.flatMap(customer => 
          customer.cards.flatMap(card => 
              (card.history || []).map(tx => ({
                  ...tx,
                  customerName: customer.name,
                  customerEmail: customer.email,
                  campaignName: card.campaignName,
                  cardId: card.uniqueId
              }))
          )
      ).sort((a, b) => {
          return sortOrder === 'desc' 
            ? b.timestamp - a.timestamp 
            : a.timestamp - b.timestamp;
      });
  }, [customers, sortOrder]);

  const filteredTransactions = useMemo(() => {
      return allTransactions.filter(tx => {
          const lowerQuery = searchQuery.toLowerCase();
          const matchesSearch = 
              tx.customerName.toLowerCase().includes(lowerQuery) ||
              tx.campaignName.toLowerCase().includes(lowerQuery) ||
              tx.cardId.toLowerCase().includes(lowerQuery) ||
              (tx.remarks && tx.remarks.toLowerCase().includes(lowerQuery));
          const matchesDate = dateFilter 
              ? new Date(tx.timestamp).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
              : true;
          return matchesSearch && matchesDate;
      });
  }, [allTransactions, searchQuery, dateFilter]);

  useEffect(() => {
      setCurrentPage(1);
  }, [customers, searchQuery, dateFilter, sortOrder]);

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  const pagedData = useMemo(() => {
      return filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  if (!dataReady) return <TransactionsSkeleton />;

  const toggleSort = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');

  const handleExportCsv = () => {
      const headers = [
          "Recorded At",
          "Customer Name",
          "Customer Email",
          "Campaign",
          "Card ID",
          "Action",
          "Amount",
          "Processed By",
          "Actor Role",
          "Remarks"
      ];

      const rows = filteredTransactions.map((tx) => [
          new Date(tx.timestamp).toISOString(),
          tx.customerName,
          tx.customerEmail,
          tx.campaignName,
          tx.cardId,
          getTransactionMeta(tx.type).label,
          tx.amount,
          tx.actorName || "Owner",
          tx.actorRole === "staff" ? "Staff" : "Owner",
          tx.remarks || ""
      ]);

      const csvContent = [
          headers.map(escapeCsvValue).join(","),
          ...rows.map((row) => row.map(escapeCsvValue).join(","))
      ].join("\r\n");

      const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      link.href = url;
      link.download = `transactions-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const iconMap: Record<string, React.ReactNode> = {
      Plus: <Plus size={16} />,
      Minus: <Minus size={16} />,
      Gift: <Gift size={16} />,
      CreditCard: <CreditCard size={16} />,
  };

  const renderIcon = (type: Transaction['type']) =>
      iconMap[getTransactionMeta(type).icon] ?? <Plus size={16} />;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-gray-50/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
                <p className="text-muted-foreground">History of all stamps, redemptions, and issuances.</p>
            </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="w-full max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, card ID, or campaign..."
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
                    <button onClick={() => setDateFilter("")} className="ml-2 text-xs text-muted-foreground hover:text-foreground">
                        Clear
                    </button>
                )}
            </div>

             <div className="flex flex-wrap items-center gap-2 ml-auto">
                 {handleRefresh && (
                   <Button variant="outline" size="sm" onClick={async () => { if (!refreshBusy) { setRefreshBusy(true); try { await handleRefresh(); } finally { setRefreshBusy(false); }}}} disabled={refreshBusy} className="gap-2">
                     <RefreshCw size={14} className={refreshBusy ? "animate-spin" : ""} />
                   </Button>
                 )}
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCsv}
                    className="gap-2"
                    disabled={filteredTransactions.length === 0}
                 >
                    <Download size={16} />
                    Export CSV
                 </Button>
                 <Button variant="ghost" size="sm" onClick={toggleSort} className="gap-2 text-muted-foreground">
                    <ArrowUpDown size={16} />
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                 </Button>
            </div>
        </div>

        <div className="flex-1 flex flex-col justify-between rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <div className="md:hidden space-y-3 p-3">
                    {pagedData.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
                            <History size={24} className="opacity-20" />
                            No transactions found matching your filters.
                        </div>
                    ) : (
                        pagedData.map(tx => (
                            <div key={tx.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-semibold text-foreground text-sm">{tx.customerName}</div>
                                        <div className="text-xs text-muted-foreground">{tx.customerEmail}</div>
                                    </div>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0",
                                        getTransactionMeta(tx.type).color
                                    )}>
                                        {renderIcon(tx.type)}
                                        {getTransactionMeta(tx.type).label}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <span className="font-medium text-sm">{tx.campaignName}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground bg-gray-100 ml-2 px-1.5 py-0.5 rounded">#{tx.cardId.slice(0, 8)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex justify-between items-center">
                                        <span>{tx.date}</span>
                                        <span>By {tx.actorName || "Owner"}</span>
                                    </div>
                                    {tx.remarks && (
                                        <div className="mt-1 text-xs italic text-muted-foreground bg-gray-50 p-2 rounded">
                                            "{tx.remarks}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="hidden md:block">
                <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead className="w-[180px]">Date & Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Campaign / Card ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>By</TableHead>
                        <TableHead className="text-right">Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {                        pagedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-32 text-muted-foreground flex-col gap-2">
                                <div className="flex justify-center mb-2"><History size={24} className="opacity-20"/></div>
                                No transactions found matching your filters.
                            </TableCell>
                        </TableRow>
                    ) : (
                        pagedData.map(tx => (
                            <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    <div className="font-medium text-foreground">{tx.date.split(',')[0]}</div>
                                    <div>{tx.date.split(',')[1]}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{tx.customerName}</div>
                                    <div className="text-xs text-muted-foreground">{tx.customerEmail}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{tx.campaignName}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-muted-foreground bg-gray-100 inline-block px-1.5 rounded mt-0.5">
                                        #{tx.cardId.slice(0, 8)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                                        getTransactionMeta(tx.type).color
                                    )}>
                                        {renderIcon(tx.type)}
                                        {getTransactionMeta(tx.type).label}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {tx.actorName || "Owner"}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                            {tx.actorRole === "staff" ? "Staff" : "Owner"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground max-w-[200px] truncate">
                                    {tx.remarks || "-"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            </div>
            </div>
            <div className="border-t p-4 bg-gray-50/50">
                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalItems={filteredTransactions.length} onPageChange={setCurrentPage} />
            </div>
        </div>
    </div>
  );
};
