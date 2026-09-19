import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Real authentication for /admin, replacing the client-side password check.
 *
 * The old gate compared `VITE_ADMIN_PASSWORD` in the browser. Vite inlines
 * every VITE_* value into the shipped bundle, so that string was readable in
 * devtools, and — more importantly — it only hid UI. Every query ran under the
 * public anon key, so the data was reachable from the REST API whether or not
 * anyone ever loaded the page.
 *
 * This uses Supabase Auth instead. The session is a real JWT, it persists
 * across refreshes (so a half-written post survives reloading), and the
 * database enforces who may write via row-level security keyed on the signed-in
 * email. The UI gate below is now just convenience; the actual control is in
 * supabase/migrations/001_posts.sql.
 */
export const useAdminAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data?.session ?? null);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });

    return () => {
      active = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError('');
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured for this build.');
      return false;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      return false;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    loading,
    error,
    signIn,
    signOut,
  };
};
