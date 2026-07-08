import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const CustomersSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in h-full flex flex-col bg-gray-50/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="flex items-center gap-2 w-full max-w-sm">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      </div>

      <div className="rounded-xl border bg-white flex-1 overflow-auto shadow-sm">
        <div className="bg-muted/30 flex items-center border-b px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40 ml-4" />
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-16 ml-4" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center border-b border-border/50 px-4 py-3 last:border-b-0">
            <div className="flex items-center gap-3 w-48">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="ml-4 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
};
