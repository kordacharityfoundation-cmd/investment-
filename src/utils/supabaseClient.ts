import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'WARNING: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing from environment variables. Running with secure chainable fallback.'
  );
}

const createMockSupabase = () => {
  const makeChain = (): any => {
    const chain: any = () => makeChain();
    
    chain.then = (resolve: any) => {
      resolve({ data: [], error: null });
    };
    
    chain.catch = () => {};
    chain.finally = (cb: any) => typeof cb === 'function' && cb();

    return new Proxy(chain, {
      get(target, prop) {
        if (prop in target) {
          return target[prop as keyof typeof target];
        }
        if (prop === 'then') {
          return (resolve: any) => resolve({ data: [], error: null });
        }
        if (prop === 'onAuthStateChange') {
          return () => ({
            data: {
              subscription: {
                unsubscribe: () => {}
              }
            }
          });
        }
        if (prop === 'getSession') {
          return async () => ({ data: { session: null }, error: null });
        }
        if (prop === 'signUp' || prop === 'signInWithPassword') {
          return async () => ({ data: { user: null, session: null }, error: { message: "Supabase is not configured yet." } });
        }
        if (prop === 'signOut') {
          return async () => ({ error: null });
        }
        return makeChain();
      }
    });
  };

  return makeChain();
};

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();

