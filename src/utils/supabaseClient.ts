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
              if (!res.ok) {
                const text = await res.text();
                let parsedErr = '';
                try {
                  const parsed = JSON.parse(text);
                  parsedErr = parsed.error;
                } catch {}
                return { data: { user: null, session: null }, error: { message: parsedErr || text || `HTTP error! Status: ${res.status}` } };
              }
              let result: any = {};
              try {
                result = await res.json();
              } catch {
                return { data: { user: null, session: null }, error: { message: 'Invalid server response format.' } };
              }
              localStorage.setItem('musk_mock_session', JSON.stringify(result));
              return { data: { user: result.user, session: result }, error: null };
            } catch (err: any) {
              return { data: { user: null, session: null }, error: { message: err.message || 'Login failed.' } };
            }
          };
        }
        if (prop === 'signUp') {
          return async (params: any) => {
            try {
              const name = params.options?.data?.name || 'New Investor';
              const phone = params.options?.data?.phone || '';
              const address = params.options?.data?.address || '';
              
              const res = await fetch('/api/register-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: params.email,
                  password: params.password,
                  name,
                  phone,
                  address,
                }),
              });
              if (!res.ok) {
                const text = await res.text();
                let parsedErr = '';
                try {
                  const parsed = JSON.parse(text);
                  parsedErr = parsed.error;
                } catch {}
                return { data: { user: null, session: null }, error: { message: parsedErr || text || `HTTP error! Status: ${res.status}` } };
              }
              let result: any = {};
              try {
                result = await res.json();
              } catch {
                return { data: { user: null, session: null }, error: { message: 'Invalid server response format.' } };
              }
              
              // In mock environment, simulate immediate sign-in (email confirmation bypassed/disabled)
              const fakeSession = {
                access_token: 'mock-token-' + Date.now(),
                user: {
                  id: result.userId,
                  email: params.email,
                  user_metadata: params.options?.data || {}
                }
              };
              localStorage.setItem('musk_mock_session', JSON.stringify(fakeSession));
              return { data: { user: fakeSession.user, session: fakeSession }, error: null };
            } catch (err: any) {
              return { data: { user: null, session: null }, error: { message: err.message || 'Registration failed.' } };
            }
          };
        }
        if (prop === 'exchangeCodeForSession') {
          return async (code: string) => {
            return { data: { session: null }, error: null };
          };
        }
        if (prop === 'signOut') {
          return async () => {
            localStorage.removeItem('musk_mock_session');
            return { error: null };
          };
        }
        if (prop === 'from') {
          return (tableName: string) => {
            const queryBuilder: any = {
              isSingleFilter: null,
              select: function() { return proxyBuilder; },
              eq: function(colName: string, colValue: any) {
                this.isSingleFilter = { colName, colValue };
                return proxyBuilder;
              },
              single: async function() {
                if (tableName === 'profiles' && this.isSingleFilter) {
                  const raw = localStorage.getItem('musk_mock_session');
                  if (raw) {
                    try {
                      const parsed = JSON.parse(raw);
                      if (parsed.profile && parsed.profile.id === this.isSingleFilter.colValue) {
                        return { data: parsed.profile, error: null };
                      }
                    } catch {}
                  }
                }
                return { data: null, error: { message: 'Not found.' } };
              },
              insert: function() { return proxyBuilder; },
              update: function() { return proxyBuilder; },
              delete: function() { return proxyBuilder; },
              neq: function() { return proxyBuilder; },
              then: function(resolve: any) { resolve({ data: [], error: null }); }
            };

            const proxyBuilder = new Proxy(queryBuilder, {
              get(target, key) {
                if (key in target) {
                  const val = target[key];
                  if (typeof val === 'function') {
                    return val.bind(target);
                  }
                  return val;
                }
                // Return a chainable dummy method that returns the proxy itself
                return () => proxyBuilder;
              }
            });
            return proxyBuilder;
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

export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();
