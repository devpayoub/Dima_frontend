import React from 'react';
import type { LucideIcon } from 'lucide-react';

export function PublicHero({
  icon: Icon,
  label,
  title,
  bgClassName = 'bg-[#1d1d1f]',
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  bgClassName?: string;
}) {
  return (
    <section className={`${bgClassName} px-4 py-16 sm:px-6 lg:px-10 lg:py-20`}>
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-[48rem]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/88">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </div>
          <h1 className="mt-6 text-[clamp(2.8rem,5.4vw,5.4rem)] font-black leading-[0.92] tracking-[-0.05em] text-white">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
