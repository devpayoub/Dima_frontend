-- ============================================================
-- Performance Indexes for Stampee
-- Run this on existing deployments to add missing indexes.
-- Safe to re-run (uses IF NOT EXISTS).
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON public.campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON public.customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_issued_cards_owner_id ON public.issued_cards(owner_id);
CREATE INDEX IF NOT EXISTS idx_issued_cards_campaign_id ON public.issued_cards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_issued_cards_customer_id ON public.issued_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON public.transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_license_keys_profile_id ON public.license_keys(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_owner_email ON public.customers(owner_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_owner_mobile ON public.customers(owner_id, mobile);
CREATE INDEX IF NOT EXISTS idx_issued_cards_dedup ON public.issued_cards(owner_id, campaign_id, customer_id, status);
