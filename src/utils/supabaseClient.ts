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
              const email = credentials.email?.trim().toLowerCase() || '';
              const password = credentials.password || '';

              // First, check local mock users stored in localStorage
              const existingUsersRaw = localStorage.getItem('musk_mock_users_local');
              const usersList = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
              const matchedUser = usersList.find((u: any) => u.email.toLowerCase() === email && u.password === password);

              if (matchedUser) {
                const fakeSession = {
                  access_token: 'mock-token-' + Date.now(),
                  user: {
                    id: matchedUser.id,
                    email: matchedUser.email,
                    user_metadata: {
                      name: matchedUser.name,
                      phone: matchedUser.phone,
                      address: matchedUser.address
                    }
                  },
                  profile: {
                    id: matchedUser.id,
                    name: matchedUser.name,
                    email: matchedUser.email,
                    phone: matchedUser.phone,
                    address: matchedUser.address,
                    role: matchedUser.role,
                    status: matchedUser.status,
                    avatar_seed: matchedUser.avatar_seed
                  }
                };
                localStorage.setItem('musk_mock_session', JSON.stringify(fakeSession));
                return { data: { user: fakeSession.user, session: fakeSession }, error: null };
              }

              // Otherwise, fall back to the login-user backend endpoint
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
              const email = params.email?.trim().toLowerCase() || '';
              const password = params.password || '';
              const name = params.options?.data?.name || 'New Investor';
              const phone = params.options?.data?.phone || '';
              const address = params.options?.data?.address || '';
              
              const mockUserId = 'mock-uid-' + Date.now();
              const avatarSeed = 'SEED_' + Math.floor(Math.random() * 10000);
              const assignedRole = ['kordacharityfoundation@gmail.com', 'admin@muskinvestment.com'].includes(email) ? 'admin' : 'user';

              const fakeSession = {
                access_token: 'mock-token-' + Date.now(),
                user: {
                  id: mockUserId,
                  email,
                  user_metadata: params.options?.data || {}
                },
                profile: {
                  id: mockUserId,
                  name,
                  email,
                  phone,
                  address,
                  role: assignedRole,
                  status: 'Active',
                  avatar_seed: avatarSeed
                }
              };
              
              localStorage.setItem('musk_mock_session', JSON.stringify(fakeSession));

              // Store this mock user to localStorage so signInWithPassword can query it later
              const existingUsersRaw = localStorage.getItem('musk_mock_users_local');
              const usersList = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
              
              if (usersList.some((u: any) => u.email.toLowerCase() === email)) {
                return { data: { user: null, session: null }, error: { message: 'An account with this email address already exists. Please login instead.' } };
              }

              usersList.push({
                id: mockUserId,
                email,
                password,
                name,
                phone,
                address,
                role: assignedRole,
                status: 'Active',
                avatar_seed: avatarSeed
              });
              localStorage.setItem('musk_mock_users_local', JSON.stringify(usersList));

              console.log('Mock registration simulated client-side for:', email);
              return { data: { user: fakeSession.user, session: fakeSession }, error: null };
            } catch (err: any) {
              console.error('Mock signUp exception:', err);
              return { data: { user: null, session: null }, error: { message: err.message || 'Mock registration failed.' } };
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
