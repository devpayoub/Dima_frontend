import type { User } from '../../types';
import * as apiAuth from '../api/auth';
import * as apiProfile from '../api/profile';
import * as apiStaff from '../api/staff';

export type ProfileFetchResult = {
  user: User | null;
  error: string | null;
  code?: string | null;
};

export async function fetchProfileDetailed(_userId: string): Promise<ProfileFetchResult> {
  try {
    const res = await apiAuth.me();
    return { user: res.profile, error: null, code: null };
  } catch (err: any) {
    return { user: null, error: err.message, code: null };
  }
}

export async function fetchProfile(_userId: string): Promise<User | null> {
  try {
    const res = await apiAuth.me();
    // If we're requesting a different user, check if it's the owner profile returned
    return res.profile.id === _userId ? res.profile : (res.ownerProfile || res.profile);
  } catch {
    return null;
  }
}

export async function fetchProfileBySlug(slug: string): Promise<User | null> {
  try {
    return await apiProfile.bySlug(slug);
  } catch {
    return null;
  }
}

export async function fetchStaffAccounts(_ownerId: string): Promise<User[]> {
  try {
    return await apiStaff.list();
  } catch {
    return [];
  }
}

export async function updateProfile(
  _userId: string,
  updates: { business_name?: string; email?: string; slug?: string; status?: string; access?: string; tier?: string; tier_expires_at?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const apiUpdates: any = {};
    if (updates.business_name !== undefined) apiUpdates.businessName = updates.business_name;
    if (updates.email !== undefined) apiUpdates.email = updates.email;
    if (updates.slug !== undefined) apiUpdates.slug = updates.slug;

    // Handle access update for staff accounts (if any) via staff API
    if (updates.access !== undefined) {
      return await apiStaff.setAccess(_userId, updates.access as 'active' | 'disabled');
    }

    return await apiProfile.updateProfile(apiUpdates);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    return await apiProfile.checkSlug(slug);
  } catch {
    return false;
  }
}
