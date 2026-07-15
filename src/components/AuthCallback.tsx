import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { UserState } from '../types';

interface AuthCallbackProps {
  onSuccess: (user: UserState) => void;
  onFailure: () => void;
}

export default function AuthCallback({ onSuccess, onFailure }: AuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Check if there is a 'code' in the search parameters (standard PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        // 2. Fetch the active session to verify they are logged in
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          throw new Error('No active authenticated session was established.');
        }

        const user = session.user;

        // 3. Let's wait a moment and query the user's profile to see if the trigger completed
        let profile = null;
        let attempts = 5;
        
        while (attempts > 0) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            profile = data;
            break;
          }

          // Wait 800ms before retrying
          await new Promise((resolve) => setTimeout(resolve, 800));
          attempts--;
        }

        // 4. If profile was not found (or in mock/fallback environments), let's ensure one exists
        if (!profile) {
          const avatarSeed = 'SEED_' + Math.floor(Math.random() * 10000);
          const name = user.user_metadata?.name || 'Investor Node';
          const phone = user.user_metadata?.phone || null;
          const address = user.user_metadata?.address || null;
          
          let assignedRole = 'user';
          if (['kordacharityfoundation@gmail.com', 'admin@muskinvestment.com'].includes(user.email || '')) {
            assignedRole = 'admin';
          }

          // Attempt to insert the profile if missing
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name,
              email: user.email,
              phone,
              address,
              role: assignedRole,
              status: 'Active',
              avatar_seed: avatarSeed
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error auto-creating profile during callback:', insertError);
          } else {
            profile = newProfile;
          }
        } else {
          // If profile exists, make sure address is updated from metadata if it wasn't saved by the DB trigger
          const address = user.user_metadata?.address;
          if (address && !profile.address) {
            await supabase
              .from('profiles')
              .update({ address })
              .eq('id', user.id);
            profile.address = address;
          }
        }

        setStatus('success');

        // Elegant short delay to let the success state render before continuing
        setTimeout(() => {
          // Construct UserState object
          const mappedUser: UserState = {
            id: user.id,
            isLoggedIn: true,
            name: profile?.name || user.user_metadata?.name || 'Investor Node',
            email: user.email || '',
            phone: profile?.phone || user.user_metadata?.phone || '',
            address: profile?.address || user.user_metadata?.address || '',
            status: profile?.status || 'Active',
            role: profile?.role || 'user',
            avatarSeed: profile?.avatar_seed || 'default'
          };

          // Clean parameters from the address bar
          try {
            window.history.replaceState({}, '', '/');
          } catch (e) {
            console.error(e);
          }

          onSuccess(mappedUser);
        }, 1500);

      } catch (err: any) {
        console.error('Callback processing exception:', err);
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected verification error occurred.');
      }
    };

    handleCallback();
  }, [onSuccess, onFailure]);

  return (
    <div id="auth-callback-root" className="min-h-screen bg-[#030310] text-white flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden relative">
      {/* Dynamic top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 fixed top-0 left-0 right-0 z-50" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.02),transparent_70%)] pointer-events-none" />
      
      <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-8 z-10 bg-[#06040c]/80 border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        {status === 'loading' && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping duration-1000" />
              <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-pulse" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600/10 to-blue-600/10 blur-xl" />
              
              <div className="relative w-12 h-12 rounded-xl bg-[#080721] border border-purple-500/30 flex items-center justify-center shadow-lg">
                <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-lg font-display font-bold tracking-wider text-gray-200 uppercase">
                Synchronizing Ledger Node
              </h1>
              <p className="text-xs font-mono text-purple-400 tracking-widest uppercase animate-pulse">
                Authorizing Security Session...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 flex flex-col items-center animate-fade-in">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-green-500/10 border border-green-500/20 animate-pulse" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-600/10 to-emerald-600/10 blur-xl" />
              
              <div className="relative w-12 h-12 rounded-xl bg-[#080721] border border-green-500/30 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-lg font-display font-bold tracking-wider text-green-400 uppercase">
                Verification Confirmed
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                Security clearance level 1 established. Syncing database node and opening investment gateway...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/10 border border-red-500/20" />
              
              <div className="relative w-12 h-12 rounded-xl bg-[#080721] border border-red-500/30 flex items-center justify-center shadow-lg">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-lg font-display font-bold tracking-wider text-red-500 uppercase">
                Verification Failed
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                {errorMessage || 'The authorization token has expired or is invalid.'}
              </p>
            </div>

            <div className="w-full pt-4">
              <button
                onClick={onFailure}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
