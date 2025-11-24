export enum CardType {
  ASSAULT = 'ASSAULT', // Basic Attack
  BLOOD = 'BLOOD', // Resource/Utility
  RECALL = 'RECALL', // Market Cards
  CALAMITY = 'CALAMITY' // Boss cards (future use)
}

export enum Phase {
  SETUP = 'SETUP',
  MAIN = 'MAIN',
  BATTLE = 'BATTLE',
  CLEANUP = 'CLEANUP',
  GAME_OVER = 'GAME_OVER'
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  attack: number;
  cost: number; // Blood cost
  description: string;
  level: number;
  image?: string;
}

export interface Jinki {
  name: string;
  handSize: number;
  era: number; // Initiative (Lower goes first)
  selfInfliction: number; // Damage taken to generate blood
  bloodSuccession: number; // Max buys/upgrades per turn
  isAwakened: boolean;
  isTapped: boolean; // Has used self-infliction this turn
}

export interface Player {
  id: string;
  name: string;
  isCpu: boolean;
  life: string[]; // Array of Card IDs representing life (Blood Cards)
  bloodPool: string[]; // Array of Card IDs in the "Wallet"
  hand: Card[];
  field: Card[];
  discard: Card[];
  jinki: Jinki;
  actionsTaken: number; // Track blood succession usage
  hasPassed: boolean;
  totalAttack: number; // Calculated in battle phase
}

export interface GameState {
  phase: Phase;
  turnCount: number;
  players: Player[];
  market: Card[]; // Covenant Area
  marketDeck: Card[];
  log: string[];
  firstPlayerIndex: number;
  activePlayerIndex: number;
  winnerId: string | null;
}