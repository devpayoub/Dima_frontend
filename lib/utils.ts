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

export function resolveHexAndOpacity(value?: string, defaultHex: string = '#000000'): { hex: string; opacity: number } {
  if (!value) return { hex: defaultHex, opacity: 100 };
  const hex = extractHex(value);
  if (!hex) return { hex: defaultHex, opacity: 100 };
  const intensity = extractIntensity(value);
  return { hex, opacity: intensity ?? 100 };
}

const PREMIUM_TIERS = ['premium', 'business', 'enterprise'];

export function isPremiumTier(tier?: string): boolean {
  if (!tier) return false;
  return PREMIUM_TIERS.includes(tier.toLowerCase());
}

export function normalizeHexColor(value: string): string {
  const normalized = value.replace('#', '').trim();
  if (normalized.length === 3) {
    return `#${normalized.split('').map((char) => `${char}${char}`).join('')}`;
  }
  if (normalized.length === 6) {
    return `#${normalized}`;
  }
  return '#ffffff';
}

export function mixHexColors(base: string, target: string, weight: number): string {
  const source = normalizeHexColor(base);
  const destination = normalizeHexColor(target);
  const ratio = Math.min(1, Math.max(0, weight));
  const parseChannel = (hex: string, start: number) => Number.parseInt(hex.slice(start, start + 2), 16);
  const blendChannel = (from: number, to: number) => Math.round(from + (to - from) * ratio);

  const r = blendChannel(parseChannel(source, 1), parseChannel(destination, 1));
  const g = blendChannel(parseChannel(source, 3), parseChannel(destination, 3));
  const b = blendChannel(parseChannel(source, 5), parseChannel(destination, 5));

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

export function getHexLuminance(value: string): number {
  const normalized = normalizeHexColor(value);
  const channels = [1, 3, 5].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  ));

  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}
