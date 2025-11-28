import React, { useState, useEffect } from 'react';
import { b64_to_utf8 } from '../utils/urlUtils';
import { Button } from './Button';

export const PlayerView: React.FC = () => {
  const [word, setWord] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Parse query params manually since we aren't using a complex router setup
    const hash = window.location.hash; // #/player?w=...
    const queryString = hash.split('?')[1];
    if (!queryString) {
      setError("Invalid game link.");
      return;
    }

    const urlParams = new URLSearchParams(queryString);
    const w = urlParams.get('w');
    const id = urlParams.get('id');

    if (w && id) {
      try {
        setWord(b64_to_utf8(w));
        setPlayerId(id);
      } catch (e) {
        setError("Failed to decode secret word.");
      }
    } else {
      setError("Missing game parameters.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-rose-900/20 border border-rose-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-rose-500 mb-2">Error</h2>
          <p className="text-rose-200">{error}</p>
          <Button className="mt-4" onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-10 -left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 -right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-sm mb-4">
                Player {playerId}
            </span>
            <h1 className="text-3xl font-bold text-white">Your Secret Identity</h1>
            <p className="text-slate-400 mt-2">Protect your screen from others!</p>
        </div>

        <div className="relative group perspective-1000">
            <div 
                className={`relative w-full aspect-[4/5] transition-all duration-700 preserve-3d cursor-pointer ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}
                onClick={() => setIsRevealed(!isRevealed)}
            >
                {/* Card Back (Hidden State) */}
                <div className="absolute inset-0 backface-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-white/10 p-8 text-center hover:scale-[1.02] transition-transform">
                        <div className="text-6xl mb-4">🕵️</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Tap to Reveal</h3>
                        <p className="text-indigo-200 text-sm">Make sure no one is watching</p>
                    </div>
                </div>

                {/* Card Front (Revealed State) */}
                <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)]">
                    <div className="w-full h-full bg-slate-800 rounded-2xl shadow-2xl flex flex-col items-center justify-center border-2 border-indigo-500 p-8 text-center">
                        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-6">Your Word Is</p>
                        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 break-words w-full">
                            {word}
                        </h2>
                        <p className="text-slate-500 text-sm mt-8">Tap to hide again</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-10 text-center">
            {isRevealed ? (
                <p className="text-rose-400 animate-pulse font-medium">⚠️ Game in progress. Don't speak your word!</p>
            ) : (
                <Button onClick={() => setIsRevealed(true)} className="w-full">
                    Reveal Word
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};
