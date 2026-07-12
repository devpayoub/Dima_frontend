import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Template, Customer, IssuedCard } from '@/types';
import { cn, hexToRgba, resolveHexAndOpacity, mixHexColors, getHexLuminance } from '@/lib/utils';
import { fromStoredTemplate } from '@/lib/templateSerialization';
import { isSupabaseConfigured } from '@/lib/supabase';
import { buildStaffScanEntryUrl } from '@/lib/links';
import * as apiPublic from '@/lib/api/public';
import { withSuspense } from '@/app/withSuspense';
import { SERVICE_UNAVAILABLE_MESSAGE } from '@/app/SeoManager';
import { LoyaltyCard } from '@/features/campaigns/components/LoyaltyCard';

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

export default PublicCardWrapper;
