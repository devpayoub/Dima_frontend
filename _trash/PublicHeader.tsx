import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';

export function PublicHeader() {
  const { currentUser } = useAuth();
  const isStaff = currentUser?.role === 'staff';
  const primaryPath = currentUser ? (isStaff ? '/issued-cards' : '/dashboard') : '/signup';
  const primaryLabel = currentUser ? 'Open dashboard' : 'Create account';

  return (
    <header className="fixed top-0 z-30 w-full border-b border-black/[0.06] bg-white/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center">
          <img src="/stampee.svg" alt="Stampee" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to={primaryPath}
            className="rounded-full bg-[#1d1d1f] px-5 py-2 text-sm font-semibold text-white hover:bg-black/85 transition-colors"
          >
            {primaryLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
