import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, Sidebar, SidebarContent } from '@/components/Sidebar';
import { VerifyBanner } from '@/components/VerifyBanner';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { getStampRequests } from '@/lib/api/stampRequests';

const DashboardLayout: React.FC = () => {
  const { pendingRequestCount, setPendingRequestCount: onPendingCountChange } = useStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      try {
        const requests = await getStampRequests();
        if (active) onPendingCountChange(requests.filter(r => r.status === 'pending').length);
      } catch {}
    };
    const channel = supabase
      .channel('sidebar_requests_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stamp_requests' }, () => fetchCount())
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  const activeTitle = NAV_ITEMS.find((item) => item.path === location.pathname)?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar
        onScanQr={() => window.dispatchEvent(new Event('open-qr-scan'))}
        pendingRequestCount={pendingRequestCount}
      />
      <main className="relative flex min-h-screen flex-1 flex-col overflow-visible md:h-screen md:overflow-hidden">
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur-sm">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-background shadow-subtle"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm font-semibold">{activeTitle}</div>
          <div className="h-10 w-10" />
        </div>

        <div className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-200",
          isMobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}>
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className={cn(
            "absolute left-0 top-0 h-full w-72 border-r border-border/80 bg-card shadow-panel transition-transform duration-200",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <span className="text-sm font-semibold">Menu</span>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/80"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close navigation menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <SidebarContent
              onNavigate={() => setIsMobileNavOpen(false)}
              onScanQr={() => {
                window.dispatchEvent(new Event('open-qr-scan'));
                setIsMobileNavOpen(false);
              }}
              pendingRequestCount={pendingRequestCount}
            />
          </div>
        </div>

        <VerifyBanner />
        <div className="flex-1 overflow-visible md:overflow-hidden">
          <div
            key={location.pathname}
            className="dashboard-route-transition min-h-full md:h-full"
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
