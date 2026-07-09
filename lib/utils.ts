import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractHex(value: string): string | null {
  const hexMatch = value.match(/#([0-9a-fA-F]{3,8})\b/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) return `#${hex}`;
    if (hex.length === 8) return `#${hex.slice(0, 6)}`;
  }
  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `#${[r, g, b].map(x => Number(x).toString(16).padStart(2, '0')).join('')}`;
  }
  return null;
}

export function extractIntensity(value?: string): number | null {
  if (!value) return null;
  const alphaMatch = value.match(/rgba?\([^,]+,\s*([\d.]+)\)/);
  if (alphaMatch) return Math.round(parseFloat(alphaMatch[1]) * 100);
  return null;
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveHexAndOpacity(value?: string): { hex: string; opacity: number } | null {
  if (!value) return null;
  const hex = extractHex(value);
  if (!hex) return null;
  const intensity = extractIntensity(value);
  return { hex, opacity: intensity ?? 100 };
}

const PREMIUM_TIERS = ['premium', 'business', 'enterprise'];

export function isPremiumTier(tier?: string): boolean {
  if (!tier) return false;
  return PREMIUM_TIERS.includes(tier.toLowerCase());
}
