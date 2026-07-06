import { useRef, useState, useEffect } from 'react';
import { LoyaltyCard } from '../LoyaltyCard';
import { Template } from '../../types';

const BASE_WIDTH = 380;
const BASE_HEIGHT = 750;

export function ScaledCardPreview({ template, onClick, className = "" }: { template: Template; onClick?: () => void; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setScale(width / BASE_WIDTH);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;

  return (
    <div ref={containerRef} className={`relative w-full aspect-[380/750] rounded-[2.5rem] shadow-2xl border border-gray-100 bg-white group-hover:scale-[1.02] transition-all duration-300 overflow-hidden ring-1 ring-black/5 ${className}`} onClick={onClick}>
      <div className="origin-top-left absolute top-0 left-0 will-change-transform" style={{ width, height, transform: `scale(${scale})` }}>
        <LoyaltyCard template={template} mode="preview" />
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none z-10 rounded-[2.5rem]" />
    </div>
  );
}
