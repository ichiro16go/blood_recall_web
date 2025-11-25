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

export interface JinkiStats {
  handSize: number;       // 手札枚数
  selfInfliction: number; // 自傷ダメージ
  bloodSuccession: number;// 血継回数
  passiveEffect: string;  // 自傷時効果のテキスト
}

export interface Jinki {
  name: string;
  era: number;
  
  // ステータスを分離して管理
  normal: JinkiStats;   // 覚醒前
  awakened: JinkiStats; // 覚醒後

  isAwakened: boolean;
  isTapped: boolean;
  recalls: [SpecialMove, SpecialMove];
}

//special moveのコスト
export interface SpecialCost {
  baseAmount: number;        // 基本コスト（例：10）
  hasVariableCost: boolean;  // Xが含まれるか
  variableSource?: 'BLOOD_SPENT' | 'HAND_DISCARD'; // Xの参照元（例：支払った血の枚数）
  description: string;       // UI表示用（例："10+X"）
}
// special moveの定義
export interface SpecialMove{
  id: string;
  name: string;
  description: string;       // 効果テキスト
  trigger: Phase; // いつ発動できるか
  
  cost: SpecialCost;          // コスト情報 //継続効果か
  baseAttackBonus: number;   // 固定攻撃力（例：シラガネなら0、クトネシリカなら8）
  isAttackVariable: boolean; // 攻撃力がコストXによって変動するか
  
  // ロジック紐付け用（アプリ実装時に重要）
  effectType: 'DRAW' | 'MILL' | 'RECOVER' | 'BUFF' | 'RETURN_TO_HAND' | 'OTHER';
  effectValue?: number;
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