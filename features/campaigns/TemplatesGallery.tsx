import React, { useState, useRef, useEffect } from 'react';
import { Template } from '@/types';
import { templates } from '@/data/templates';
import { LoyaltyCard } from '@/features/campaigns/components/LoyaltyCard';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["All", "Food & Drink", "Beauty & Wellness", "Services", "Retail"];

const TEMPLATE_CATEGORIES: Record<string, string> = {
  "Boba": "Food & Drink",
  "Brew": "Food & Drink",
  "Mug": "Food & Drink",
  "Cake": "Food & Drink",
  "Matcha": "Food & Drink",
  "Wine": "Food & Drink",
  "Spa": "Beauty & Wellness",
  "Lotion": "Beauty & Wellness",
  "Polish": "Beauty & Wellness",
  "Comb": "Beauty & Wellness",
  "Scissors": "Services",
  "Key": "Services",
  "Tag": "Retail",
  "Bag": "Retail",
  "Box": "Retail",
};

const getCategory = (id: string) => TEMPLATE_CATEGORIES[id] ?? "Services";

const NO_SCROLL_WRAPPER = `after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-12 after:bg-gradient-to-l after:from-[#f5f5f7]`;

export const TemplatesGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollLeft > 10) setShowScrollHint(false);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const filtered: Template[] = selectedCategory === "All"
    ? templates
    : templates.filter((t) => getCategory(t.id) === selectedCategory);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#6e6e73]">Gallery</p>
            <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-black leading-[0.96] tracking-[-0.03em] text-[#1d1d1f]">
              Choose a starting card
            </h1>
            <p className="mt-2 text-sm text-[#6e6e73]">
              Browse templates and pick the one that fits your brand.
            </p>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="hidden h-11 rounded-full border-black/[0.1] px-6 text-sm sm:inline-flex"
          >
            Back
          </Button>
        </div>

        {/* Category pills */}
        <div className="relative mb-8">
          <div
            ref={scrollRef}
            className={`no-scrollbar flex gap-2 overflow-x-auto pb-2 ${showScrollHint ? NO_SCROLL_WRAPPER : ""}`}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium tracking-tight transition-all ${
                  selectedCategory === cat
                    ? "border-[#1d1d1f] bg-[#1d1d1f] text-white shadow-sm"
                    : "border-black/[0.08] bg-white text-[#6e6e73] hover:border-black/20 hover:text-[#1d1d1f]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {showScrollHint && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-[#6e6e73]">
              <LayoutGrid className="h-4 w-4 animate-pulse" />
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/editor/${t.id}`)}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5">
                <LoyaltyCard template={t} disableInteractivity size="gallery" />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-[#1d1d1f]">{t.name}</p>
              <p className="text-center text-xs text-[#6e6e73]">{getCategory(t.id)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
