import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TIER_LIMITS, User } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { fetchProfile, fetchProfileDetailed, fetchStaffAccounts, updateProfile as dbUpdateProfile } from "../lib/db/profiles";
import { normalizeSlug } from "../lib/slug";
import { buildAppUrl, DEMO_WORKSPACE_ENABLED } from "../lib/siteConfig";
import * as apiAuth from "../lib/api/auth";
import * as apiStaff from "../lib/api/staff";
import * as apiProfile from "../lib/api/profile";

type AuthUserLike = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type AuthResult = { ok: true; user?: User; message?: string } | { ok: false; error: string };
type RepairResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  currentUser: User | null;
  currentOwner: User | null;
  isOwner: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
  loading: boolean;
  staffAccounts: User[];
  login: (email: string, password: string) => Promise<AuthResult>;
  loginStaff: (email: string, pin: string, orgId: string) => Promise<AuthResult>;
  signup: (payload: { businessName: string; email: string; password: string; slug: string }) => Promise<AuthResult>;
  loginDemo: () => Promise<void>;
  createStaff: (payload: { name: string; email: string; pin: string }) => Promise<AuthResult>;
  updateStaffPin: (staffId: string, pin: string) => Promise<AuthResult>;
  setStaffAccess: (staffId: string, access: "active" | "disabled") => Promise<AuthResult>;
  deleteStaff: (staffId: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<AuthResult>;
  isSlugAvailable: (slug: string) => Promise<boolean>;
  updateProfileInfo: (payload: { businessName?: string; email?: string; slug?: string }) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const CONFIG_ERROR_MESSAGE = "Service is temporarily unavailable. Please try again later.";
const AUTH_REQUEST_ERROR = "We couldn't complete your request right now. Please try again.";
const SIGNIN_ERROR_MESSAGE = "Unable to sign in right now. Please try again.";
const SIGNUP_ERROR_MESSAGE = "Unable to create your account right now. Please try again.";
const SIGNUP_EMAIL_EXISTS_MESSAGE = "An account with this email already exists. Please log in instead.";
const ACCOUNT_SETUP_ERROR = "We couldn't finish setting up your account. Please try again.";
const PROFILE_UPDATE_ERROR = "Unable to update your profile right now. Please try again.";
const PASSWORD_UPDATE_ERROR = "Unable to update your password right now. Please try again.";
const PASSWORD_RESET_ERROR = "Unable to send a reset link right now. Please try again.";
const STAFF_ACTION_ERROR = "Unable to complete this staff action right now. Please try again.";
const ACCOUNT_ACTION_ERROR = "Unable to complete this account action right now. Please try again.";

const isDuplicateSignupError = (message: string | undefined) => {
  const normalized = (message || "").trim().toLowerCase();
  return normalized.includes("already registered") || normalized.includes("already exists");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOwner, setCurrentOwner] = useState<User | null>(null);
  const [staffAccounts, setStaffAccounts] = useState<User[]>([]);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfileWithRetry = useCallback(async (userId: string, attempts = 5, delayMs = 200): Promise<User | null> => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
      if (attempt < attempts - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), delayMs);
        });
      }
    }
    return null;
  }, []);

  const waitForAuthUser = useCallback(async (userId: string, attempts = 12, delayMs = 150): Promise<boolean> => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const { data } = await supabase.auth.getUser();
      if (data.user?.id === userId) return true;
      if (attempt < attempts - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), delayMs);
        });
      }
    }
    return false;
  }, []);

  const createMissingProfile = useCallback(async (authUser: AuthUserLike): Promise<RepairResult> => {
    const metadata = authUser.user_metadata ?? {};
    const metadataRole = typeof metadata.role === "string" ? metadata.role : "owner";
    const role: "owner" | "staff" = metadataRole === "staff" ? "staff" : "owner";
    const ownerId = typeof metadata.owner_id === "string" ? metadata.owner_id : null;
    const rawBusinessName = typeof metadata.business_name === "string" ? metadata.business_name.trim() : "";
    const fallbackName = authUser.email?.split("@")[0]?.trim() || "New Business";
    const businessName = rawBusinessName || fallbackName;
    const slugRaw = typeof metadata.slug === "string" ? metadata.slug : "";
    const slug = role === "owner" ? normalizeSlug(slugRaw) || null : null;

    const payload = {
      id: authUser.id,
      business_name: businessName,
      email: (authUser.email || "").trim().toLowerCase(),
      slug,
      role,
      owner_id: role === "staff" ? ownerId : null,
      status: "unverified",
      access: "active",
      tier: "free",
    };

    let { error } = await supabase.from("profiles").insert(payload);

    // If slug conflicts, retry once without slug so login can proceed.
    if (error && error.message.toLowerCase().includes("profiles_slug_key")) {
      const retry = await supabase.from("profiles").insert({ ...payload, slug: null });
      error = retry.error;
    }

    if (!error) return { ok: true };

    // If another process created it first, treat as success.
    if (error.message.toLowerCase().includes("duplicate key value")) {
      return { ok: true };
    }
    return { ok: false, error: ACCOUNT_SETUP_ERROR };
  }, []);

  const loadFullSession = useCallback(async (userId: string, authUser?: AuthUserLike) => {
    await waitForAuthUser(userId);
    setIsEmailVerified(Boolean(authUser?.email_confirmed_at));
    let profile = await fetchProfileWithRetry(userId);
    if (!profile && authUser) {
      const repaired = await createMissingProfile(authUser);
      if (repaired.ok) {
        profile = await fetchProfileWithRetry(userId, 3, 150);
      }
    }
    if (!profile) {
      setCurrentUser(null);
      setCurrentOwner(null);
      setStaffAccounts([]);
      setIsEmailVerified(false);
      return;
    }

    setCurrentUser(profile);

    if (profile.role === "owner") {
      setCurrentOwner(profile);
      setStaffAccounts(await fetchStaffAccounts(profile.id));
    } else if (profile.ownerId) {
      const owner = await fetchProfile(profile.ownerId);
      setCurrentOwner(owner);
      if (owner) setStaffAccounts(await fetchStaffAccounts(owner.id));
    }
  }, [createMissingProfile, fetchProfileWithRetry, waitForAuthUser]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCurrentUser(null);
      setCurrentOwner(null);
      setStaffAccounts([]);
      setIsEmailVerified(false);
      setLoading(false);
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await loadFullSession(session.user.id, session.user);
        }
      } catch {
        // ignore — loading will still be cleared
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        setLoading(true);
        window.setTimeout(() => {
          void (async () => {
            try {
              await loadFullSession(session.user.id, session.user);
            } catch {
              // ignore
            } finally {
              if (mounted) setLoading(false);
            }
          })();
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setCurrentOwner(null);
        setStaffAccounts([]);
        setIsEmailVerified(false);
        setLoading(false);
      } else if (event === "INITIAL_SESSION") {
        // Already handled by init()
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadFullSession]);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !currentUser) return;
    const { data } = await supabase.auth.getUser();
    await loadFullSession(currentUser.id, data.user ?? undefined);
  }, [currentUser, loadFullSession]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    try {
      const res = await apiAuth.login(email, password);
      if (res.session) {
        const { error } = await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
        if (error) return { ok: false, error: "Unable to sign in. Please try again." };
      }

      await waitForAuthUser(res.user?.id || "");
      const profile = await fetchProfileWithRetry(res.user?.id || "");
      if (!profile) return { ok: false, error: "Unable to retrieve your profile." };
      return { ok: true, user: profile };
    } catch (err: any) {
      return { ok: false, error: err.message || SIGNIN_ERROR_MESSAGE };
    }
  }, [fetchProfileWithRetry, waitForAuthUser]);

  const loginStaff = useCallback(async (email: string, pin: string, orgId: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    try {
      const res = await apiAuth.loginStaff(email, pin, orgId);
      if (res.session) {
        const { error } = await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
        if (error) return { ok: false, error: "Email or PIN is incorrect." };
      }

      await waitForAuthUser(res.user?.id || "");
      const profile = await fetchProfileWithRetry(res.user?.id || "");
      if (!profile) return { ok: false, error: "Unable to retrieve staff profile." };
      return { ok: true, user: profile };
    } catch (err: any) {
      return { ok: false, error: err.message || SIGNIN_ERROR_MESSAGE };
    }
  }, [fetchProfileWithRetry, waitForAuthUser]);

  const signup = useCallback(async (payload: {
    businessName: string; email: string; password: string; slug: string;
  }): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    try {
      const res = await apiAuth.signup(payload);
      if (res.session) {
        await supabase.auth.setSession({
          access_token: res.session.access_token,
          refresh_token: res.session.refresh_token,
        });
      } else if (res.message) {
        return { ok: true, message: res.message };
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || SIGNUP_ERROR_MESSAGE };
    }
  }, []);

  const loginDemo = useCallback(async () => {
    if (!DEMO_WORKSPACE_ENABLED) {
      throw new Error("Demo workspace is currently unavailable.");
    }
    if (!isSupabaseConfigured) return;
    const demoEmail = "demo@stampee.co";
    const demoPassword = "demo1234";
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });
    if (error) {
      await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            business_name: "Demo Donut Co.",
            slug: "demo-donut",
            role: "owner",
          },
        },
      });
    }
  }, []);

  const createStaff = useCallback(async (payload: { name: string; email: string; pin: string }): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (!currentOwner || currentUser?.role !== "owner") {
      return { ok: false, error: "Only owners can manage staff." };
    }
    if (!/^\d{4,6}$/.test(payload.pin)) {
      return { ok: false, error: "PIN should be 4-6 digits." };
    }
    const staffLimit = TIER_LIMITS[currentOwner.tier].staff;
    if (staffAccounts.length >= staffLimit) {
      return {
        ok: false,
        error: `Free beta access allows only ${staffLimit} staff account${staffLimit === 1 ? "" : "s"}. Contact hello@stampee.co if you need higher limits.`,
      };
    }

    try {
      await apiStaff.create({
        email: payload.email.trim().toLowerCase(),
        pin: payload.pin,
        name: payload.name.trim(),
      });
      setStaffAccounts(await fetchStaffAccounts(currentOwner.id));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || STAFF_ACTION_ERROR };
    }
  }, [currentOwner, currentUser, staffAccounts]);

  const updateStaffPin = useCallback(async (staffId: string, pin: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (!currentOwner || currentUser?.role !== "owner") {
      return { ok: false, error: "Only owners can manage staff." };
    }
    if (!/^\d{4,6}$/.test(pin)) {
      return { ok: false, error: "PIN should be 4-6 digits." };
    }
    try {
      await apiStaff.updatePin(staffId, pin);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || STAFF_ACTION_ERROR };
    }
  }, [currentOwner, currentUser]);

  const setStaffAccess = useCallback(async (staffId: string, access: "active" | "disabled"): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (!currentOwner || currentUser?.role !== "owner") {
      return { ok: false, error: "Only owners can manage staff." };
    }
    try {
      await apiStaff.setAccess(staffId, access);
      setStaffAccounts(await fetchStaffAccounts(currentOwner.id));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || STAFF_ACTION_ERROR };
    }
  }, [currentOwner, currentUser]);

  const deleteStaff = useCallback(async (staffId: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (!currentOwner || currentUser?.role !== "owner") {
      return { ok: false, error: "Only owners can manage staff." };
    }
    try {
      await apiStaff.remove(staffId);
      setStaffAccounts(await fetchStaffAccounts(currentOwner.id));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || STAFF_ACTION_ERROR };
    }
  }, [currentOwner, currentUser]);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (!currentOwner || currentUser?.role !== "owner") {
      return { ok: false, error: "Only owners can delete the account." };
    }
    try {
      await apiAuth.logout(); // deletes backend session
      await supabase.auth.signOut();
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || ACCOUNT_ACTION_ERROR };
    }
  }, [currentOwner, currentUser]);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      await apiAuth.logout();
    } catch {
      // ignore, sign out locally anyway
    }
    await supabase.auth.signOut();
  }, []);

  const resendVerificationEmail = useCallback(async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    try {
      const res = await apiAuth.resendVerification(buildAppUrl("/login"));
      return { ok: true, message: res.message || "Verification email sent. Check your inbox and spam folder." };
    } catch (err: any) {
      return { ok: false, error: err.message || "Unable to resend verification email right now. Please try again." };
    }
  }, []);

  const isSlugAvailable = useCallback(async (slug: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error(CONFIG_ERROR_MESSAGE);
    }
    return apiProfile.checkSlug(slug);
  }, []);

  const updateProfileInfo = useCallback(async (payload: {
    businessName?: string; email?: string; slug?: string;
  }): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (!currentUser) return { ok: false, error: AUTH_REQUEST_ERROR };

    try {
      const updates: any = {};
      if (payload.businessName?.trim()) updates.businessName = payload.businessName.trim();
      if (payload.email?.trim()) updates.email = payload.email.trim().toLowerCase();
      if (payload.slug?.trim()) updates.slug = payload.slug.trim().toLowerCase();

      await apiProfile.updateProfile(updates);
      await refreshProfile();
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || PROFILE_UPDATE_ERROR };
    }
  }, [currentUser, refreshProfile]);

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    if (newPassword.length < 6) {
      return { ok: false, error: "New password must be at least 6 characters." };
    }
    try {
      await apiAuth.updatePassword(newPassword);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || PASSWORD_UPDATE_ERROR };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    try {
      await apiAuth.resetPassword(email.trim().toLowerCase(), buildAppUrl("/login"));
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || PASSWORD_RESET_ERROR };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      currentOwner,
      isOwner: currentUser?.role === "owner",
      isStaff: currentUser?.role === "staff",
      isEmailVerified,
      loading,
      staffAccounts,
      login,
      loginStaff,
      signup,
      loginDemo,
      createStaff,
      updateStaffPin,
      setStaffAccess,
      deleteStaff,
      deleteAccount,
      logout,
      resendVerificationEmail,
      isSlugAvailable,
      updateProfileInfo,
      updatePassword,
      resetPassword,
      refreshProfile,
    }),
    [
      currentUser, currentOwner, isEmailVerified, loading, staffAccounts,
      login, loginStaff, signup, loginDemo, createStaff,
      updateStaffPin, setStaffAccess, deleteStaff, deleteAccount, logout,
      resendVerificationEmail, isSlugAvailable, updateProfileInfo,
      updatePassword, resetPassword, refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
