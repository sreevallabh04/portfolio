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
const createStubClient = () => {
  const result = async () => ({
    data: null,
    error: new Error('Supabase is not configured'),
  });

  const queryBuilder = () => {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      single: result,
      maybeSingle: result,
      then: (resolve, reject) =>
        Promise.resolve({ data: [], error: null, count: 0 }).then(resolve, reject),
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
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
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
