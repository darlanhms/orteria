import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ExternalSyncProvider } from '../hooks/useExternalSync';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ExternalSyncProvider>
      <Outlet />
    </ExternalSyncProvider>
  );
}
