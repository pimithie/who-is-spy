export interface WordPair {
  civilianWord: string;
  spyWord: string;
}

export interface GameSettings {
  totalPlayers: number;
  spyCount: number;
}

export interface PlayerRole {
  id: number;
  word: string;
  isSpy: boolean;
}

export interface GameState {
  settings: GameSettings;
  currentWords: WordPair | null;
  players: PlayerRole[];
  gameId: string; // Unique ID to ensure QR codes are for the current session
  status: 'setup' | 'ready' | 'loading' | 'error';
}

export interface GeminiWordResponse {
  civilianWord: string;
  spyWord: string;
}
