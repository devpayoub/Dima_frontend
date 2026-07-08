export function formatTimestamp(t: string | number) {
  return new Date(t).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

export function formatAction(type: string) {
  switch (type) {
    case 'stamp_add': return 'Stamp Added';
    case 'stamp_remove': return 'Stamp Removed';
    case 'redeem': return 'Reward Redeemed';
    case 'issued': return 'Card Issued';
    default: return type;
  }
}

export function getTransactionMeta(type: string) {
  switch (type) {
    case 'stamp_add': return { label: 'Stamp', color: 'bg-emerald-100 text-emerald-700', icon: 'Plus' as const };
    case 'stamp_remove': return { label: 'Remove', color: 'bg-rose-100 text-rose-700', icon: 'Minus' as const };
    case 'redeem': return { label: 'Redeemed', color: 'bg-amber-100 text-amber-700', icon: 'Gift' as const };
    case 'issued': return { label: 'Issued', color: 'bg-blue-100 text-blue-700', icon: 'CreditCard' as const };
    default: return { label: type, color: 'bg-gray-100 text-gray-700', icon: 'Circle' as const };
  }
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
