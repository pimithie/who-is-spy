import React, { useState, useEffect } from 'react';
import { generateWordPair } from '../services/geminiService';
import { GameState, PlayerRole, WordPair } from '../types';
import { generatePlayerUrl } from '../utils/urlUtils';
import { Button } from './Button';

export const HostView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    settings: { totalPlayers: 6, spyCount: 1 },
    currentWords: null,
    players: [],
    gameId: '',
    status: 'setup',
  });

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSandbox, setIsSandbox] = useState<boolean>(false);

  // Generate a random ID for the session on mount and check environment
  useEffect(() => {
    setGameState(prev => ({ ...prev, gameId: Math.random().toString(36).substring(7) }));
    
    // Check if running in a blob (preview) environment
    if (window.location.protocol === 'blob:') {
      setIsSandbox(true);
    }
  }, []);

  const handlePlayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, totalPlayers: count }
    }));
  };

  const handleSpyCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, spyCount: count }
    }));
  };

  const startGame = async () => {
    setErrorMsg('');
    setGameState(prev => ({ ...prev, status: 'loading' }));

    try {
      // 1. Get Words
      const words = await generateWordPair();
      
      // 2. Assign Roles
      const { totalPlayers, spyCount } = gameState.settings;
      
      // Create array of roles
      const roles: boolean[] = Array(totalPlayers).fill(false); // false = civilian
      let assignedSpies = 0;
      while (assignedSpies < spyCount) {
        const randomIndex = Math.floor(Math.random() * totalPlayers);
        if (!roles[randomIndex]) {
          roles[randomIndex] = true; // true = spy
          assignedSpies++;
        }
      }

      // 3. Create Player Objects
      const players: PlayerRole[] = roles.map((isSpy, index) => ({
        id: index + 1,
        isSpy,
        word: isSpy ? words.spyWord : words.civilianWord
      }));

      // 4. Update State
      setGameState(prev => ({
        ...prev,
        currentWords: words,
        players,
        gameId: Math.random().toString(36).substring(7), // New game ID ensures old links invalid
        status: 'ready'
      }));

    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate game. Please try again.");
      setGameState(prev => ({ ...prev, status: 'setup' }));
    }
  };

  const resetGame = () => {
    setGameState(prev => ({ ...prev, status: 'setup', players: [], currentWords: null }));
  };

  const copyLink = (url: string, id: number) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Open link in new tab (workaround for sandbox testing)
  const openLocalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
          Who is the Spy?
        </h1>
        <p className="text-slate-400">AI-Powered Word Generator & Distributor</p>
      </header>
      
      {isSandbox && (
        <div className="mb-8 p-4 bg-amber-900/40 border border-amber-600/50 rounded-xl text-amber-200 text-sm md:text-base flex items-start gap-3 max-w-3xl mx-auto">
           <span className="text-2xl">⚠️</span>
           <div>
             <p className="font-bold mb-1">预览模式警告 (Preview Mode Detected)</p>
             <p>当前应用运行在临时沙盒环境（Blob URL）中。外部设备（如手机）<b>无法扫描</b>下方的二维码。</p>
             <p className="mt-2 text-amber-100/70">解决方法：请在当前电脑上点击“复制链接”或直接在浏览器新标签页中打开测试。如需多人游戏，请将代码部署到 Vercel/Netlify 等静态托管服务。</p>
           </div>
        </div>
      )}

      {gameState.status === 'setup' && (
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-xl backdrop-blur-sm max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Game Setup</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Total Players: <span className="text-indigo-400 font-bold">{gameState.settings.totalPlayers}</span>
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={gameState.settings.totalPlayers}
                onChange={handlePlayerCountChange}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Spies: <span className="text-rose-400 font-bold">{gameState.settings.spyCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max={Math.floor(gameState.settings.totalPlayers / 3)} // Rule of thumb: max 1/3 are spies
                value={gameState.settings.spyCount}
                onChange={handleSpyCountChange}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1</span>
                <span>{Math.floor(gameState.settings.totalPlayers / 3)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-900/20 border border-rose-800 rounded text-rose-300 text-sm">
                {errorMsg}
              </div>
            )}

            <Button onClick={startGame} className="w-full py-4 text-lg">
              Generate New Game
            </Button>
          </div>
        </div>
      )}

      {gameState.status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-300 animate-pulse">Consulting the AI for mysterious words...</p>
        </div>
      )}

      {gameState.status === 'ready' && gameState.currentWords && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-4 z-10 shadow-xl shadow-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white">Session Active</h2>
              <p className="text-slate-400 text-sm">Scan a code below to join. Do not share your code!</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
               {/* Host Spoiler View */}
               <details className="relative group">
                <summary className="list-none cursor-pointer bg-slate-700 text-slate-300 px-4 py-2 rounded hover:bg-slate-600 border border-slate-600">
                  Reveal Host Answer Key
                </summary>
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 p-4 rounded shadow-2xl z-20">
                    <p className="text-sm text-slate-400 mb-1">Civilian Word:</p>
                    <p className="text-lg font-bold text-indigo-400 mb-3">{gameState.currentWords.civilianWord}</p>
                    <p className="text-sm text-slate-400 mb-1">Spy Word:</p>
                    <p className="text-lg font-bold text-rose-400">{gameState.currentWords.spyWord}</p>
                </div>
              </details>

              <Button onClick={startGame} variant="primary">
                New Round (Different Words)
              </Button>
              <Button onClick={resetGame} variant="secondary">
                Change Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
            {gameState.players.map((player) => {
              const url = generatePlayerUrl(player.word, player.id, gameState.gameId);
              // Use qrserver API for QR codes, increased size, Medium Error Correction (ecc=M)
              const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&ecc=M&data=${encodeURIComponent(url)}&bgcolor=1e293b&color=e2e8f0&margin=10`;

              return (
                <div key={player.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center hover:border-indigo-500/50 transition-colors">
                  <div className="text-indigo-300 font-bold mb-3">Player {player.id}</div>
                  <div className={`bg-slate-900 p-2 rounded-lg mb-3 w-full aspect-square flex items-center justify-center overflow-hidden ${isSandbox ? 'opacity-50 grayscale' : ''}`}>
                    <img 
                      src={qrSrc} 
                      alt={`QR for Player ${player.id}`} 
                      className="w-full h-full object-contain" 
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {/* Sandbox Mode: Show Open Button */}
                    {isSandbox ? (
                         <button 
                            onClick={() => openLocalLink(url)}
                            className="text-xs text-amber-400 hover:text-amber-300 underline py-1 text-center font-bold"
                        >
                            Open Test Link
                        </button>
                    ) : (
                        <button 
                            onClick={() => copyLink(url, player.id)}
                            className="text-xs text-slate-400 hover:text-indigo-400 underline py-1 text-center"
                        >
                            {copiedId === player.id ? 'Copied!' : 'Copy Link'}
                        </button>
                    )}
                    
                    {/* Read-only textarea for manual copying if needed */}
                    <input 
                      readOnly 
                      value={url}
                      className="bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-500 font-mono w-full focus:outline-none focus:border-indigo-500"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
