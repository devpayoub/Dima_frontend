import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from './ui/spinner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const PublicRequestPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug, requestId } = useParams<{ slug: string; requestId: string }>();
  const [status, setStatus] = useState<'loading' | 'pending' | 'accepted' | 'declined' | 'expired' | 'error'>('loading');
  const [cardUniqueId, setCardUniqueId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !requestId) {
      setStatus('error');
      setError('Invalid request.');
      return;
    }

    let pollingId: any;
    let timeoutId: any;
    let channel: any;

    const checkStatus = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_stamp_request_status', {
          request_id_input: requestId,
        });

        if (rpcError) {
          console.error('Failed to check request status:', rpcError);
          return;
        }

        if (!data) {
          setStatus('error');
          setError('Request not found.');
          return;
        }

        const newStatus = data.status;
        if (newStatus === 'accepted') {
          setStatus('accepted');
          setCardUniqueId(data.card_unique_id || data.accepted_card_id);
          // Stop polling once we have a final state
          if (pollingId) clearInterval(pollingId);
          return;
        }
        if (newStatus === 'declined') {
          setStatus('declined');
          if (pollingId) clearInterval(pollingId);
          return;
        }
        if (newStatus === 'expired') {
          setStatus('expired');
          if (pollingId) clearInterval(pollingId);
          return;
        }
        // Still pending
        setStatus('pending');
      } catch (err) {
        console.error('Status check error:', err);
      }
    };

    // Initial check
    checkStatus().then(() => {
      // Start polling every 3 seconds only if still pending
      pollingId = setInterval(() => {
        checkStatus();
      }, 3000);
    });

    // Also try realtime as a bonus (may not work due to RLS, but polling is the fallback)
    try {
      channel = supabase
        .channel(`stamp_req_${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'stamp_requests',
            filter: `id=eq.${requestId}`,
          },
          (payload) => {
            const newStatus = payload.new?.status;
            if (newStatus === 'accepted' || newStatus === 'declined' || newStatus === 'expired') {
              if (pollingId) clearInterval(pollingId);
              checkStatus();
            }
          }
        )
        .subscribe();
    } catch {
      // Realtime may fail — polling handles it
    }

    // Timeout after 15 minutes
    timeoutId = setTimeout(() => {
      setStatus('expired');
      if (pollingId) clearInterval(pollingId);
    }, 15 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (pollingId) clearInterval(pollingId);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [requestId]);

  // Redirect to card when accepted
  useEffect(() => {
    if (status === 'accepted' && cardUniqueId && slug) {
      const timer = setTimeout(() => {
        navigate(`/${slug}/${cardUniqueId}`, { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, cardUniqueId, slug, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2rem] border border-black/[0.08] bg-white p-8 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] text-center">
          <Spinner className="h-10 w-10 mx-auto" color="border-[#1d1d1f]" />
          <p className="mt-4 text-sm font-medium text-[#1d1d1f]">Connecting...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2rem] border border-black/[0.08] bg-white p-8 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#1d1d1f]">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 h-12 w-full rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white hover:bg-black/85"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2rem] border border-black/[0.08] bg-white p-8 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-[#1d1d1f]">Request Approved!</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">Redirecting to your loyalty card...</p>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2rem] border border-black/[0.08] bg-white p-8 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#1d1d1f]">Request Declined</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">Your stamp request was not approved. Please ask staff for assistance.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 h-12 w-full rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white hover:bg-black/85"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2rem] border border-black/[0.08] bg-white p-8 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-[#1d1d1f]">Request Expired</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">Your request has expired. Please scan the QR code again.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 h-12 w-full rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white hover:bg-black/85"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Pending state
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2rem] border border-black/[0.08] bg-white p-8 shadow-[0_24px_64px_-38px_rgba(0,0,0,0.35)] text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[#f5f5f7] flex items-center justify-center">
          <Spinner className="h-7 w-7" color="border-[#1d1d1f]" />
        </div>
        <h1 className="text-xl font-bold text-[#1d1d1f]">Waiting for Approval</h1>
        <p className="mt-2 text-sm text-[#6e6e73]">
          Your stamp request has been sent. Please wait for the staff to approve it.
        </p>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[#efeff1]">
          <div className="h-full w-full origin-left animate-pulse rounded-full bg-[#1d1d1f]" />
        </div>
        <p className="mt-3 text-xs text-[#8f9197]">This page checks automatically every few seconds</p>
      </div>
    </div>
  );
};
