import { useAuth } from '@/app/providers/AuthProvider';

export function usePrimaryPath() {
  const { currentUser } = useAuth();
  const isStaff = currentUser?.role === 'staff';
  const primaryPath = currentUser ? (isStaff ? '/issued-cards' : '/dashboard') : '/signup';
  const primaryLabel = currentUser ? 'Open dashboard' : 'Create account';
  return { primaryPath, primaryLabel, currentUser };
}
