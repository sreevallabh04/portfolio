import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * `createClient` throws synchronously when the URL/key are missing. Because this
 * module is imported at the top level of the chatbot, the memories page and the
 * admin page, that throw used to take the whole app down with a white screen
 * whenever the environment was not configured (local clones, preview builds, a
 * mistyped variable name in the host dashboard).
 *
 * When the credentials are absent we hand back a stub that mimics the small
 * slice of the API this project actually uses and resolves to "no data" instead.
 * Callers already handle the empty/error path, so the UI degrades to "chat is
 * offline" rather than disappearing.
 */
const notConfigured = () => new Error('Supabase is not configured');

const createStubClient = () => {
  const failing = async () => ({ data: null, error: notConfigured() });

  const queryBuilder = () => {
    // Reads resolve empty so list views render their own empty state. Writes
    // resolve with an error: the previous stub resolved `error: null` for
    // everything, which made an offline publish look like it had succeeded and
    // silently discarded the post.
    let isWrite = false;

    const builder = {
      select: () => builder,
      insert: () => {
        isWrite = true;
        return builder;
      },
      update: () => {
        isWrite = true;
        return builder;
      },
      upsert: () => {
        isWrite = true;
        return builder;
      },
      delete: () => {
        isWrite = true;
        return builder;
      },
      eq: () => builder,
      neq: () => builder,
      in: () => builder,
      ilike: () => builder,
      or: () => builder,
      match: () => builder,
      range: () => builder,
      order: () => builder,
      limit: () => builder,
      single: failing,
      maybeSingle: failing,
      then: (resolve, reject) =>
        Promise.resolve(
          isWrite
            ? { data: null, error: notConfigured(), count: 0 }
            : { data: [], error: null, count: 0 }
        ).then(resolve, reject),
    };
    return builder;
  };

  const channel = () => {
    const stub = { on: () => stub, subscribe: () => stub, unsubscribe: () => {} };
    return stub;
  };

  return {
    from: queryBuilder,
    channel,
    removeChannel: () => {},
    rpc: failing,
    // Without an `auth` object, the first supabase.auth.getSession() in an
    // unconfigured build throws a TypeError and takes the whole app down —
    // exactly the white screen this stub exists to prevent.
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: notConfigured(),
      }),
      signInWithOtp: async () => ({ data: { session: null, user: null }, error: notConfigured() }),
      signOut: async () => ({ error: null }),
      // Callers destructure `data.subscription`, so that shape must exist.
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        upload: failing,
        remove: failing,
        list: async () => ({ data: [], error: null }),
      }),
    },
  };
};

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Chat, memories and admin features will run in offline mode. See .env.example.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createStubClient();
