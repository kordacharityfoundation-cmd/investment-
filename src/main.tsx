import {StrictMode, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSync, startBackgroundSync } from './utils/sync';

function Main() {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    initSync().then(() => {
      setSynced(true);
      // Start background poll synchronization every 10 seconds to keep tabs/devices in sync
      startBackgroundSync(10000);
    });
  }, []);

  if (!synced) {
    return (
      <div className="min-h-screen bg-[#02020d] text-white flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden">
        {/* Starfield ambient backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.02),transparent_70%)] pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-8 z-10">
          {/* Futuristic Glowing Orbital Logo */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping duration-1000"></div>
            <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-pulse"></div>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600/10 to-blue-600/10 blur-xl"></div>
            
            <div className="relative w-12 h-12 rounded-xl bg-[#080721] border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <span className="font-display font-black text-xl tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                M
              </span>
            </div>
          </div>
          
          {/* Loading details */}
          <div className="space-y-3">
            <h1 className="text-md font-display font-bold tracking-wider text-gray-200">
              ESTABLISHING ENCRYPTED CONNECTION
            </h1>
            <p className="text-[10px] font-mono text-purple-400 tracking-widest uppercase">
              Synchronizing Ledger Nodes...
            </p>
          </div>
          
          {/* Custom Loading Bar Container */}
          <div className="w-56 h-[3px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-purple-500 to-blue-500 rounded-full animate-loading-bar" style={{ width: '100%', transform: 'translateX(-100%)' }}></div>
          </div>

          {/* Secure details */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-mono text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SSL 256-BIT ENCRYPTION ACTIVE
          </div>
        </div>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);
