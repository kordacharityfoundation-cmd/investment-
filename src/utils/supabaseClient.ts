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
          return (callback: any) => {
            const raw = localStorage.getItem('musk_mock_session');
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                callback('SIGNED_IN', parsed);
              } catch {}
            }
            return {
              data: {
                subscription: {
                  unsubscribe: () => {}
                }
              }
            };
          };
        }
        if (prop === 'getSession') {
          return async () => {
            const raw = localStorage.getItem('musk_mock_session');
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                return { data: { session: parsed }, error: null };
              } catch {}
            }
            return { data: { session: null }, error: null };
          };
        }
        if (prop === 'signInWithPassword') {
          return async (credentials: any) => {
            try {
              const res = await fetch('/api/login-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
              });
              const result = await res.json();
              if (!res.ok) {
                return { data: { user: null, session: null }, error: { message: result.error || 'Authentication failed.' } };
              }
              localStorage.setItem('musk_mock_session', JSON.stringify(result));
              return { data: { user: result.user, session: result }, error: null };
            } catch (err: any) {
              return { data: { user: null, session: null }, error: { message: err.message || 'Login failed.' } };
            }
          };
        }
        if (prop === 'signOut') {
          return async () => {
            localStorage.removeItem('musk_mock_session');
            return { error: null };
          };
        }
        if (prop === 'functions') {
          return {
            invoke: async (functionName: string, options?: any) => {
              if (functionName === 'register-user') {
                try {
                  const res = await fetch('/api/register-user', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(options?.body || {}),
                  });
                  const result = await res.json();
                  if (!res.ok) {
                    return { data: null, error: new Error(result.error || 'Registration failed.') };
                  }
                  return { data: result, error: null };
                } catch (err: any) {
                  return { data: null, error: err };
                }
              }
              return { data: null, error: new Error('Unknown edge function requested.') };
            }
          };
        }
        if (prop === 'from') {
          return (tableName: string) => {
            const queryBuilder: any = {
              isSingleFilter: null,
              select: () => queryBuilder,
              eq: (colName: string, colValue: any) => {
                queryBuilder.isSingleFilter = { colName, colValue };
                return queryBuilder;
              },
              single: async () => {
                if (tableName === 'profiles' && queryBuilder.isSingleFilter) {
                  const raw = localStorage.getItem('musk_mock_session');
                  if (raw) {
                    try {
                      const parsed = JSON.parse(raw);
                      if (parsed.profile && parsed.profile.id === queryBuilder.isSingleFilter.colValue) {
                        return { data: parsed.profile, error: null };
                      }
                    } catch {}
                  }
                }
                return { data: null, error: { message: 'Not found.' } };
              },
              insert: () => queryBuilder,
              update: () => queryBuilder,
              delete: () => queryBuilder,
              neq: () => queryBuilder,
              then: (resolve: any) => resolve({ data: [], error: null })
            };
            return queryBuilder;
          };
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

const buildRealClient = () => {
  const client = createClient(supabaseUrl, supabaseAnonKey);
  
  return new Proxy(client, {
    get(target, prop) {
      if (prop === 'functions') {
        return {
          invoke: async (functionName: string, options?: any) => {
            if (functionName === 'register-user') {
              try {
                const res = await fetch('/api/register-user', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(options?.body || {}),
                });
                const result = await res.json();
                if (!res.ok) {
                  return { data: null, error: new Error(result.error || 'Registration failed.') };
                }
                return { data: result, error: null };
              } catch (err: any) {
                return { data: null, error: err };
              }
            }
            return { data: null, error: new Error('Unknown edge function requested.') };
          }
        };
      }
      return target[prop as keyof typeof target];
    }
  });
};

export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? buildRealClient()
  : createMockSupabase();


