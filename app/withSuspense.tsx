import React, { Suspense } from 'react';
import RouteLoader from './RouteLoader';

export const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteLoader />}>
    {node}
  </Suspense>
);
