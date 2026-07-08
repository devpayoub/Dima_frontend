import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto flex flex-col space-y-8 bg-background p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-subtle">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-12 rounded-md" />
            <Skeleton className="h-8 w-14 rounded-md" />
            <Skeleton className="h-8 w-12 rounded-md" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border/80 bg-card shadow-subtle">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-3 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/80 bg-card shadow-subtle">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-56 w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-subtle">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-card shadow-subtle">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border/80 bg-background px-4 py-4 shadow-subtle space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-28 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
