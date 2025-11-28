import React, { useState, useEffect } from 'react';
import { HostView } from './components/HostView';
import { PlayerView } from './components/PlayerView';

// Simple Hash Router Implementation to avoid external dependencies like react-router-dom for this specific constraint
// and to ensure it works nicely with standard static hosting.

const App: React.FC = () => {
  const [route, setRoute] = useState<string>('host');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/player')) {
        setRoute('player');
      } else {
        setRoute('host');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      {route === 'host' ? <HostView /> : <PlayerView />}
    </div>
  );
};

export default App;
