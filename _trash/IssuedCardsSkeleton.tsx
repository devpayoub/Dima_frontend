import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const IssuedCardsSkeleton: React.FC = () => {
  return (
    <div className="min-h-full space-y-6 bg-gray-50/50 p-4 md:h-full md:overflow-y-auto md:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:max-w-sm">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="hidden md:block">
          <div className="bg-muted/30 flex items-center border-b px-4 py-3">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-24 ml-8" />
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-4 w-16 ml-8" />
            <Skeleton className="h-4 w-8 ml-4" />
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center border-b border-border/50 px-4 py-3 last:border-b-0">
              <div className="flex items-center gap-3 w-[300px]">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-8">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex flex-col items-end gap-1 ml-auto">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-1.5 w-24 rounded-full" />
              </div>
              <div className="flex items-center gap-2 ml-8">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 ml-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
