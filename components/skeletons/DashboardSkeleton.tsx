import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-border/80 bg-card px-6 py-6 shadow-subtle md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
          </div>
        </header>

        <Card className="rounded-[28px] border-border/80">
          <CardHeader className="gap-4 border-b border-border/70 pb-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-[24px]">
              <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="rounded-[28px]">
          <CardHeader className="border-b border-border/70 pb-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
