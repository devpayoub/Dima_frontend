import React from 'react';

type AlertVariant = 'error' | 'success';

const styles: Record<AlertVariant, string> = {
  error: 'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700',
  success: 'rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700',
};

export function Alert({ variant = 'error', children }: { variant?: AlertVariant; children: React.ReactNode }) {
  if (!children) return null;
  return <div className={styles[variant]}>{children}</div>;
}
