import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TransactionsSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-gray-50/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="w-full max-w-md">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      <div className="rounded-xl border bg-white flex-1 overflow-auto shadow-sm">
        <div className="bg-muted/30 flex items-center border-b px-4 py-3">
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-4 w-24 ml-4" />
          <Skeleton className="h-4 w-32 ml-4" />
          <Skeleton className="h-4 w-20 ml-4" />
          <Skeleton className="h-4 w-16 ml-4" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="flex items-center border-b border-border/50 px-4 py-3 last:border-b-0">
            <div className="w-[180px] space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="ml-4">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
};
