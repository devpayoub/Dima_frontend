import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { fetchPublicCampaignSignupContext } from '@/lib/db/publicSignup';
import { createStampRequest } from '@/lib/api/stampRequests';
import { lookupCustomerByPhone } from '@/lib/api/public';
import { isSupabaseConfigured } from '@/lib/supabase';

const SERVICE_UNAVAILABLE_MESSAGE = 'Service is temporarily unavailable. Please try again later.';

export const PublicCampaignSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug, campaignId } = useParams<{ slug: string; campaignId: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preRedirectMessage, setPreRedirectMessage] = useState('');
  const [error, setError] = useState('');
  const [context, setContext] = useState<any>(null);

  const [step, setStep] = useState<'mobile' | 'details'>('mobile');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [existingCustomer, setExistingCustomer] = useState<{ name: string; email: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !slug || !campaignId) {
      setLoading(false);
      return;
    }

    let active = true;
    void (async () => {
      const payload = await fetchPublicCampaignSignupContext(slug, campaignId);
      if (!active) return;
      setContext(payload);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [campaignId, slug]);

  const disabled = context?.campaign.isEnabled === false;
  const isShowingPreRedirectLoader = preRedirectMessage.length > 0;

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedPhone = mobile.trim();
    if (!trimmedPhone) {
      setError('Mobile number is required.');
      return;
    }
    if (!slug) {
      setError('Invalid signup link.');
      return;
    }

    setLookingUp(true);
    try {
      const result = await lookupCustomerByPhone(slug, trimmedPhone);
      if (result.found) {
        setExistingCustomer({ name: result.name || '', email: result.email || '' });
        setName(result.name || '');
        setEmail(result.email || '');
      } else {
        setExistingCustomer(null);
        setName('');
        setEmail('');
      }
      setStep('details');
    } catch {
      setError('Failed to look up number. Please try again.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedPhone = mobile.trim();

    if (!trimmedName) {
      setError('Name is required.');
      return;
    }
    if (!slug || !campaignId) {
      setError('Invalid signup link.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await createStampRequest({
        ownerSlug: slug,
        campaignId,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        customerEmail: email.trim(),
      });

      setPreRedirectMessage('Submitting your request...');
      await new Promise((resolve) => setTimeout(resolve, 600));
      navigate(`/${slug}/request-pending/${result.requestId}`, { replace: true });
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'Unable to submit request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
        {SERVICE_UNAVAILABLE_MESSAGE}
      </div>
    );
  }

  if (!context) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
        Campaign signup link is invalid.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-10 sm:px-6 sm:py-14">
      {isShowingPreRedirectLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 text-center shadow-[0_18px_52px_-36px_rgba(0,0,0,0.45)]">
            <Spinner className="h-10 w-10" color="border-[#1d1d1f]" />
            <p className="mt-4 text-sm font-medium text-[#1d1d1f]" aria-live="polite">
              {preRedirectMessage}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#efeff1]">
              <div className="h-full w-full origin-left animate-pulse rounded-full bg-[#1d1d1f]" />
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-xl">
        <section className="rounded-[2rem] border border-black/[0.08] bg-white p-6 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] sm:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#6e6e73]">Loyalty Signup</p>
          <h1 className="mt-3 text-[clamp(1.9rem,5vw,2.7rem)] font-black leading-[0.96] tracking-[-0.03em] text-[#1d1d1f]">
            {context.owner.businessName}
          </h1>
          <p className="mt-3 text-[0.98rem] leading-7 text-[#4f5258]">
            Join <span className="font-semibold text-[#1d1d1f]">{context.campaign.name}</span> to start collecting stamps.
          </p>

          {disabled && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              New signups are currently paused for this campaign. If you already have an in-progress card, enter the same mobile number you used before.
            </div>
          )}

          {step === 'mobile' && (
            <form onSubmit={handleMobileSubmit} className="mt-6 space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="mobile" className="text-sm font-medium text-[#1d1d1f]">
                  Mobile Number <span className="text-[#d73a49]">*</span>
                </Label>
                <Input
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  autoComplete="tel"
                  required
                  className="h-12 rounded-xl border-black/10 text-[#1d1d1f] placeholder:text-[#8f9197]"
                />
                <p className="text-xs leading-5 text-[#6e6e73]">Enter the number you use at this business.</p>
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white hover:bg-black/85"
                disabled={lookingUp}
              >
                {lookingUp ? 'Looking up...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="mt-6 space-y-5">
              {existingCustomer && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800">
                  Welcome back! We found your account.
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium text-[#1d1d1f]">
                  Name <span className="text-[#d73a49]">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  readOnly={!!existingCustomer}
                  className={`h-12 rounded-xl border-black/10 text-[#1d1d1f] placeholder:text-[#8f9197] ${existingCustomer ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
                {existingCustomer && (
                  <p className="text-xs leading-5 text-[#6e6e73]">Name is pre-filled from your existing account.</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1d1d1f]">
                  Email <span className="text-[#6e6e73]">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  type="email"
                  className="h-12 rounded-xl border-black/10 text-[#1d1d1f] placeholder:text-[#8f9197]"
                />
                <p className="text-xs leading-5 text-[#6e6e73]">Used for card recovery and reward updates.</p>
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl"
                  onClick={() => {
                    setStep('mobile');
                    setExistingCustomer(null);
                    setName('');
                    setEmail('');
                    setError('');
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-12 flex-1 rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white hover:bg-black/85"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Request Stamp'}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
