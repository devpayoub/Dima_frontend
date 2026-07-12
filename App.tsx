import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Sidebar, NAV_ITEMS, SidebarContent } from './components/Sidebar';
import { Template, Customer, IssuedCard } from './types';
import { templates } from './data/templates';

import { BrowserRouter, Routes, Route, Outlet, useParams, useNavigate, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toStoredTemplate, fromStoredTemplate } from './lib/templateSerialization';
import { cn, hexToRgba, resolveHexAndOpacity, normalizeHexColor, mixHexColors, getHexLuminance, isPremiumTier } from './lib/utils';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { RequireAuth } from './components/RequireAuth';
import { TemplatesGallery } from './features/campaigns/TemplatesGallery';
import { RequireRole } from './components/RequireRole';
import { RequireTier } from './components/RequireTier';
import { VerifyBanner } from './components/VerifyBanner';
import { fetchPublicScanEntryContext } from './lib/db/issuedCards';
import { buildIssuedCardsKioskUrl, buildStaffPortalUrl, buildStaffScanEntryUrl } from './lib/links';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { useSubscription } from './lib/useSubscription';
import { SubscriptionProvider } from './components/SubscriptionContext';
import { APP_ORIGIN } from './lib/siteConfig';
import * as apiPublic from './lib/api/public';
import { useStore } from './store/useStore';

const SITE_ORIGIN = APP_ORIGIN;
const DEFAULT_SOCIAL_DESCRIPTION = 'Stampee is a digital loyalty card platform for small businesses, including loyalty program for cafes, loyalty program for spa, loyalty program for laundry, loyalty program for carwash, and loyalty program for salons.';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/social-preview-v2.jpg`;
const SERVICE_UNAVAILABLE_MESSAGE = 'Service is temporarily unavailable. Please try again later.';

type SeoConfig = {
  title: string;
  description: string;
  socialDescription?: string;
  canonical: string;
  robots: string;
  type?: 'website' | 'article';
};

const LoyaltyCard = lazy(() => import('./features/campaigns/components/LoyaltyCard').then((module) => ({ default: module.LoyaltyCard })));
const CardEditor = lazy(() => import('./features/campaigns/CardEditor').then((module) => ({ default: module.CardEditor })));
const MyCards = lazy(() => import('./features/campaigns/MyCards').then((module) => ({ default: module.MyCards })));
const IssuedCardsPage = lazy(() => import('./features/cards/IssuedCardsPage').then((module) => ({ default: module.IssuedCardsPage })));
const CustomerDirectory = lazy(() => import('./features/customers/CustomerDirectory').then((module) => ({ default: module.CustomerDirectory })));
const TransactionsPage = lazy(() => import('./features/transactions/TransactionsPage').then((module) => ({ default: module.TransactionsPage })));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const StaffLoginPage = lazy(() => import('./features/auth/StaffLoginPage').then((module) => ({ default: module.StaffLoginPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const RequestsPage = lazy(() => import('./features/requests/RequestsPage').then((module) => ({ default: module.RequestsPage })));
const PublicCampaignSignupPage = lazy(() => import('./features/public/PublicCampaignSignupPage').then((module) => ({ default: module.PublicCampaignSignupPage })));
const PublicRequestPendingPage = lazy(() => import('./features/public/PublicRequestPendingPage').then((module) => ({ default: module.PublicRequestPendingPage })));
const LandingPage = lazy(() => import('./features/public/LandingPage'));
const ContactPage = lazy(() => import('./features/public/ContactPage'));

const RouteLoader: React.FC = () => (
  <div className="flex min-h-[40vh] w-full items-center justify-center">
    <div className="animate-pulse rounded-md bg-muted h-8 w-8" />
  </div>
);

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<RouteLoader />}>
    {node}
  </Suspense>
);

const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonicalLink = (href: string) => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const getSeoForPathname = (pathname: string): SeoConfig => {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const canonical = `${SITE_ORIGIN}${normalizedPath}`;
  const defaultSeo: SeoConfig = {
    title: 'Stampee | Digital Loyalty Cards',
    description: DEFAULT_SOCIAL_DESCRIPTION,
    socialDescription: DEFAULT_SOCIAL_DESCRIPTION,
    canonical,
    robots: 'noindex,nofollow',
    type: 'website',
  };

  return defaultSeo;
};

const SeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPathname(location.pathname);
    const socialDescription = seo.socialDescription ?? seo.description;

    document.title = seo.title;
    setCanonicalLink(seo.canonical);
    setMetaTag('name', 'description', seo.description);
    setMetaTag('name', 'robots', seo.robots);
    setMetaTag('property', 'og:locale', 'en_US');
    setMetaTag('property', 'og:type', seo.type ?? 'website');
    setMetaTag('property', 'og:site_name', 'Stampee');
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', socialDescription);
    setMetaTag('property', 'og:url', seo.canonical);
    setMetaTag('property', 'og:image', DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:image:url', DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:image:secure_url', DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:image:type', 'image/jpeg');
    setMetaTag('property', 'og:image:width', '1536');
    setMetaTag('property', 'og:image:height', '1024');
    setMetaTag('property', 'og:image:alt', 'Stampee digital loyalty card preview');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', socialDescription);
    setMetaTag('name', 'twitter:url', seo.canonical);
    setMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE);
    setMetaTag('name', 'twitter:image:src', DEFAULT_OG_IMAGE);
    setMetaTag('name', 'twitter:image:alt', 'Stampee digital loyalty card preview');
  }, [location.pathname]);

  return null;
};

const PublicCardWrapper: React.FC = () => {
  const { slug, uniqueId } = useParams<{ slug: string; uniqueId: string }>();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<{
    card: IssuedCard;
    customer: Customer;
    template: Template;
  } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !slug || !uniqueId) { setLoading(false); return; }
    (async () => {
      let data = null;
      let error = null;
      try {
        data = await apiPublic.getCard(slug, uniqueId);
      } catch (err: any) {
        error = err;
      }
      if (error || !data) { setLoading(false); return; }

      const card: IssuedCard = {
        id: data.card.id,
        uniqueId: data.card.uniqueId,
        campaignId: data.card.campaignId,
        campaignName: data.card.campaignName,
        stamps: data.card.stamps,
        lastVisit: data.card.lastVisit,
        status: data.card.status,
        completedDate: data.card.completedDate,
        history: data.card.history ?? [],
        templateSnapshot: data.card.templateSnapshot,
      };

      const customer: Customer = {
        id: data.customer.id,
        name: data.customer.name,
        email: '',
        status: 'Active',
        cards: [card],
      };

      let template: Template | undefined;
      if (data.campaign) {
        const stored = {
          id: data.campaign.id,
          name: data.campaign.name,
          description: data.campaign.description ?? '',
          rewardName: data.campaign.reward_name ?? '',
          tagline: data.campaign.tagline,
          backgroundImage: data.campaign.background_image,
          backgroundOpacity: data.campaign.background_opacity,
          logoImage: data.campaign.logo_image,
          showLogo: data.campaign.show_logo,
          titleSize: data.campaign.title_size,
          iconKey: data.campaign.icon_key ?? 'cookie',
          colors: data.campaign.colors,
          totalStamps: data.campaign.total_stamps,
          social: data.campaign.social,
          mode: data.campaign.mode ?? 'stamps',
          createdAt: data.campaign.created_at,
        };
        template = fromStoredTemplate(stored);
      } else if (card.templateSnapshot) {
        template = fromStoredTemplate(card.templateSnapshot);
      }

      if (template) setCardData({ card, customer, template });
      setLoading(false);
    })();
  }, [slug, uniqueId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse rounded-md bg-muted h-8 w-8" />
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
        {isSupabaseConfigured ? 'Card not found.' : SERVICE_UNAVAILABLE_MESSAGE}
      </div>
    );
  }

  const { card, customer, template } = cardData;
  const isRedeemed = card.status === 'Redeemed';
  const cardBackgroundHex = resolveHexAndOpacity(template.colors.background, '#f5f5f5').hex;
  const isDarkBackground = getHexLuminance(cardBackgroundHex) < 0.38;
  const pageBackground = mixHexColors(cardBackgroundHex, isDarkBackground ? '#0b0b0d' : '#ffffff', isDarkBackground ? 0.64 : 0.22);
  const shellBackground = mixHexColors(cardBackgroundHex, isDarkBackground ? '#1a1a1d' : '#ffffff', isDarkBackground ? 0.28 : 0.1);
  const haloColor = hexToRgba(cardBackgroundHex, isDarkBackground ? 0.44 : 0.28);

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center animate-fade-in md:px-8 md:py-8"
      style={{
        backgroundColor: pageBackground,
        backgroundImage: `radial-gradient(circle at top, ${hexToRgba(shellBackground, 0.42)} 0%, transparent 42%)`
      }}
    >
      <div className="w-full min-h-[100dvh] flex items-center justify-center p-0 relative md:min-h-0">
      <div className={cn(
          "w-full h-[100dvh] md:h-[min(940px,calc(100dvh-2rem))] md:w-[min(436px,calc((100dvh-2rem)*0.4638))] md:max-w-full md:overflow-hidden md:rounded-[3.6rem] md:ring-1 md:ring-black/5",
          isRedeemed && "opacity-50 grayscale-[0.6] pointer-events-none"
        )}
        style={{
          backgroundColor: shellBackground,
          boxShadow: `0 34px 96px -42px ${haloColor}, 0 18px 40px -28px rgba(15, 23, 42, 0.3)`
        }}
      >
          {withSuspense(
            <LoyaltyCard
              template={template}
              mode="public"
              readOnly={true}
              currentStamps={card.stamps}
              customerName={customer.name}
              cardId={card.uniqueId}
              qrValue={buildStaffScanEntryUrl(slug ?? '', card.uniqueId)}
              className="h-full w-full"
              history={card.history}
              isRedeemed={isRedeemed}
            />
          )}
      </div>
        {isRedeemed && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="mx-6 w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-gray-200 p-6 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock size={22} className="text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Redeemed</h2>
              <p className="mt-1 text-sm text-gray-600">This card is closed.</p>
              <div className="mt-3 text-xs text-gray-500 font-mono">
                Card ID: {card.uniqueId}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StaffScanEntryWrapper: React.FC = () => {
  const { slug, uniqueId } = useParams<{ slug: string; uniqueId: string }>();
  const navigate = useNavigate();
  const { currentOwner, currentUser, loading } = useAuth();
  const [loadingContext, setLoadingContext] = useState(true);
  const [context, setContext] = useState<Awaited<ReturnType<typeof fetchPublicScanEntryContext>>>(null);

  useEffect(() => {
    if (!slug || !uniqueId) {
      setLoadingContext(false);
      setContext(null);
      return;
    }

    let active = true;
    setLoadingContext(true);

    void (async () => {
      const nextContext = await fetchPublicScanEntryContext(slug, uniqueId);
      if (!active) return;
      setContext(nextContext);
      setLoadingContext(false);
    })();

    return () => {
      active = false;
    };
  }, [slug, uniqueId]);

  useEffect(() => {
    if (loading || loadingContext || !context) return;

    if (!currentUser || !currentOwner) {
      window.location.replace(buildStaffPortalUrl(context.owner.slug, context.owner.id, context.card.uniqueId));
      return;
    }

    if (currentOwner.id !== context.owner.id) {
      return;
    }

    navigate(buildIssuedCardsKioskUrl(context.card.uniqueId), { replace: true });
  }, [context, currentOwner, currentUser, loading, loadingContext, navigate]);

  if (loading || loadingContext) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse rounded-md bg-muted h-8 w-8" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
        Card not found.
      </div>
    );
  }

  if (!currentUser || !currentOwner) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
        Redirecting to staff login...
      </div>
    );
  }

  if (currentOwner.id !== context.owner.id) {
    return (
      <div className="h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Wrong business</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This card is not part of your business.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
      Opening kiosk...
    </div>
  );
};

const ActiveCardWrapper: React.FC<{ templates: Template[] }> = ({ templates }) => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const template = templates.find(t => t.id === cardId);

  if (!template) return <Navigate to="/campaigns" />;

  return (
    <div className="h-screen w-full bg-background relative flex flex-col items-center justify-center animate-fade-in">
      <button
        onClick={() => navigate('/campaigns')}
        className="absolute top-6 left-6 z-50 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors backdrop-blur-sm"
        title="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      {withSuspense(
        <LoyaltyCard
          template={template}
          mode="active"
          className="h-full w-full"
        />
      )}
    </div>
  );
};

const PreviewWrapper: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = templates.find(t => t.id === templateId);

  if (!template) return <Navigate to="/gallery" />;

  return (
    <div className="h-screen w-full">
      {withSuspense(
        <LoyaltyCard
          template={template}
          mode="preview"
          onBack={() => navigate('/gallery')}
          onCreate={() => navigate(`/editor/new?templateId=${templateId}`)}
          className="h-full w-full"
        />
      )}
    </div>
  );
};

const EditorWrapper: React.FC<{ onSave: (t: Template) => Promise<void>; templates: Template[] }> = ({ onSave, templates: createdTemplates }) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { currentOwner } = useAuth();

  let initialTemplate: Template | undefined;

  if (id === 'new') {
    const baseId = searchParams.get('templateId');
    const baseTemplate = templates.find(t => t.id === baseId);
    initialTemplate = baseTemplate
      ? { ...baseTemplate, backgroundOpacity: 80 }
      : undefined;
    if (!initialTemplate && templates[0]) {
      initialTemplate = { ...templates[0], backgroundOpacity: 80 };
    }
  } else {
    initialTemplate = createdTemplates.find(t => t.id === id);
  }

  if (!initialTemplate) return <Navigate to="/campaigns" />;

  const allowFullDesign = isPremiumTier(currentOwner?.tier);

  return (
    withSuspense(
      <CardEditor
        initialTemplate={initialTemplate}
        onSave={onSave}
        allowFullDesign={allowFullDesign}
      />
    )
  );
};

const DashboardLayout: React.FC = () => {
  const { pendingRequestCount, setPendingRequestCount: onPendingCountChange } = useStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      try {
        const { getStampRequests } = await import('./lib/api/stampRequests');
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

const AppRoutes: React.FC = () => {
  const { currentOwner, isStaff } = useAuth();
  const { campaigns, customers, loadData, saveCampaign } = useStore();

  const sub = useSubscription(campaigns, customers);

  useEffect(() => {
    if (currentOwner) {
      void loadData(currentOwner.id);
    }
  }, [currentOwner?.id, loadData]);

  return (
    <SubscriptionProvider value={sub}>
      {!isSupabaseConfigured && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {SERVICE_UNAVAILABLE_MESSAGE}
        </div>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={withSuspense(<LandingPage />)} />
        <Route path="/contact" element={withSuspense(<ContactPage />)} />
        <Route path="/:slug/staff" element={withSuspense(<StaffLoginPage />)} />
        <Route path="/:slug/scan/:uniqueId" element={<StaffScanEntryWrapper />} />
        <Route path="/:slug/join/:campaignId" element={withSuspense(<PublicCampaignSignupPage />)} />
        <Route path="/:slug/request-pending/:requestId" element={withSuspense(<PublicRequestPendingPage />)} />
        <Route path="/:slug/:uniqueId" element={<PublicCardWrapper />} />
        <Route path="/login" element={withSuspense(<LoginPage />)} />
        <Route path="/forgot-password" element={withSuspense(<ForgotPasswordPage />)} />

        {/* Authenticated Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allowed={["owner"]} />}>
            <Route path="/active/:cardId" element={<ActiveCardWrapper templates={campaigns} />} />
            <Route path="/preview/:templateId" element={<PreviewWrapper />} />
            <Route path="/editor/:id?" element={
              <RequireTier>
                <EditorWrapper onSave={(t) => saveCampaign(t, currentOwner!.id)} templates={campaigns} />
              </RequireTier>
            } />
            <Route path="/gallery" element={withSuspense(<TemplatesGallery />)} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route element={<RequireRole allowed={["owner"]} />}>
            <Route path="/dashboard" element={
                withSuspense(<DashboardPage />)
              } />
              <Route path="/campaigns" element={
                withSuspense(
                  <MyCards />
                )
              } />
              <Route path="/analytics" element={withSuspense(<AnalyticsPage />)} />
              <Route path="/transactions" element={withSuspense(<TransactionsPage />)} />
              <Route path="/settings" element={withSuspense(<SettingsPage />)} />
              <Route path="/requests" element={withSuspense(<RequestsPage />)} />
            </Route>

            <Route element={<RequireRole allowed={["owner", "staff"]} />}>
              <Route path="/issued-cards" element={
                withSuspense(
                  <IssuedCardsPage />
                )
              } />
              <Route path="/customers" element={
                withSuspense(
                  <CustomerDirectory readOnly={isStaff} />
                )
              } />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SubscriptionProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SeoManager />
        <Analytics />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
