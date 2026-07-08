import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const CampaignsSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in h-full overflow-y-auto bg-gray-50/50">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-10 pb-12 px-2 md:px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-6 w-full max-w-[380px] mx-auto">
            <Skeleton className="w-full aspect-[380/750] rounded-[2.5rem]" />
            <div className="text-center space-y-4 w-full px-2">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-16 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
