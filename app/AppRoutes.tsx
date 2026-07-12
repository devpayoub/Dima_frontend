import React, { lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { RequireAuth } from '@/components/RequireAuth';
import { RequireRole } from '@/components/RequireRole';
import { RequireTier } from '@/components/RequireTier';
import { SubscriptionProvider } from '@/components/SubscriptionContext';
import { useSubscription } from '@/lib/useSubscription';
import { useStore } from '@/store/useStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { withSuspense } from '@/app/withSuspense';
import { SERVICE_UNAVAILABLE_MESSAGE } from '@/app/SeoManager';
import { TemplatesGallery } from '@/features/campaigns/TemplatesGallery';

const PublicCardWrapper = lazy(() => import('@/features/public/components/PublicCardWrapper').then((module) => ({ default: module.default })));
const StaffScanEntryWrapper = lazy(() => import('@/features/public/components/StaffScanEntryWrapper').then((module) => ({ default: module.default })));
const ActiveCardWrapper = lazy(() => import('@/features/campaigns/components/ActiveCardWrapper').then((module) => ({ default: module.default })));
const PreviewWrapper = lazy(() => import('@/features/campaigns/components/PreviewWrapper').then((module) => ({ default: module.default })));
const EditorWrapper = lazy(() => import('@/features/campaigns/components/EditorWrapper').then((module) => ({ default: module.default })));
const DashboardLayout = lazy(() => import('@/features/dashboard/components/DashboardLayout').then((module) => ({ default: module.default })));

const MyCards = lazy(() => import('@/features/campaigns/MyCards').then((module) => ({ default: module.MyCards })));
const IssuedCardsPage = lazy(() => import('@/features/cards/IssuedCardsPage').then((module) => ({ default: module.IssuedCardsPage })));
const CustomerDirectory = lazy(() => import('@/features/customers/CustomerDirectory').then((module) => ({ default: module.CustomerDirectory })));
const TransactionsPage = lazy(() => import('@/features/transactions/TransactionsPage').then((module) => ({ default: module.TransactionsPage })));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const StaffLoginPage = lazy(() => import('@/features/auth/StaffLoginPage').then((module) => ({ default: module.StaffLoginPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const RequestsPage = lazy(() => import('@/features/requests/RequestsPage').then((module) => ({ default: module.RequestsPage })));
const PublicCampaignSignupPage = lazy(() => import('@/features/public/PublicCampaignSignupPage').then((module) => ({ default: module.PublicCampaignSignupPage })));
const PublicRequestPendingPage = lazy(() => import('@/features/public/PublicRequestPendingPage').then((module) => ({ default: module.PublicRequestPendingPage })));
const LandingPage = lazy(() => import('@/features/public/LandingPage'));
const ContactPage = lazy(() => import('@/features/public/ContactPage'));

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
        <Route path="/:slug/scan/:uniqueId" element={withSuspense(<StaffScanEntryWrapper />)} />
        <Route path="/:slug/join/:campaignId" element={withSuspense(<PublicCampaignSignupPage />)} />
        <Route path="/:slug/request-pending/:requestId" element={withSuspense(<PublicRequestPendingPage />)} />
        <Route path="/:slug/:uniqueId" element={withSuspense(<PublicCardWrapper />)} />
        <Route path="/login" element={withSuspense(<LoginPage />)} />
        <Route path="/forgot-password" element={withSuspense(<ForgotPasswordPage />)} />

        {/* Authenticated Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allowed={["owner"]} />}>
            <Route path="/active/:cardId" element={withSuspense(<ActiveCardWrapper templates={campaigns} />)} />
            <Route path="/preview/:templateId" element={withSuspense(<PreviewWrapper />)} />
            <Route path="/editor/:id?" element={
              <RequireTier>
                {withSuspense(<EditorWrapper onSave={(t) => saveCampaign(t, currentOwner!.id)} templates={campaigns} />)}
              </RequireTier>
            } />
            <Route path="/gallery" element={withSuspense(<TemplatesGallery />)} />
          </Route>

          <Route element={withSuspense(<DashboardLayout />)}>
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

export default AppRoutes;
