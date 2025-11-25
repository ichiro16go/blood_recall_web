import React, { useState, useEffect, useReducer, useCallback } from 'react';
import type { Card,  GameState, Player,Jinki,JinkiStats } from './types/type';
import { CardType,Phase } from './types/type';
import { MOCK_CARDS,  STARTING_DECK_SIZE, INITIAL_LIFE_COUNT, LIFE_THRESHOLD_AWAKEN, generateId,} from './stores/constants';
import CardComponent from './components/CardComponent';
import { ALL_JINKI_DATA } from './stores/jinkis';
import LifeArea from './components/LifeArea';
import JinkiCard from './components/JinkiCard';
import BloodPool from './components/BloodPool';
import TutorialModal from './components/TutorialModal';

// --- Helper Functions ---

//シャッフル
const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

//　神器のステータス取得
const getJinkiStatus = (jinki: Jinki): JinkiStats => {
  return jinki.isAwakened ? jinki.awakened : jinki.normal;
};

// プレイヤー設定
const createPlayer = (id: string, name: string, isCpu: boolean,jinki:Jinki): Player => {
  const startingDeck = Array.from({ length: STARTING_DECK_SIZE }).map((_, i) => {
    const template = i < 6 ? MOCK_CARDS[0] : MOCK_CARDS[1]; // 6 Attacks, 4 Blood
    return { ...template, id: generateId() };
  });

  return {
    id,
    name,
    isCpu,
    life: Array.from({ length: INITIAL_LIFE_COUNT }).map(() => generateId()), // Mock IDs for life cards
    bloodPool: [],
    hand: [],
    field: [],
    discard: startingDeck, // Start in discard for logic simplicity (draw happens in setup)
    jinki: { ...jinki ,isTapped: false, isAwakened: false},
    actionsTaken: 0,
    hasPassed: false,
    totalAttack: 0,
  };
};

// --- Game Logic Reducer ---

type Action = 
  | { type: 'INIT_GAME' }
  | { type: 'START_TURN' }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string }
  | { type: 'SELF_INFLICT'; playerId: string }
  | { type: 'BUY_CARD'; playerId: string; cardIndex: number }
  | { type: 'PASS_PHASE'; playerId: string }
  | { type: 'RESOLVE_BATTLE' }
  | { type: 'CLEANUP' }
  | { type: 'LOG'; message: string };

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    //ゲーム準備
    case 'INIT_GAME': {
      // 神器をランダムに選択
      const shuffledJinkis = shuffle(ALL_JINKI_DATA);
      const p1Jinki = shuffledJinkis[0];
      const p2Jinki = shuffledJinkis[1];
      const p1 = createPlayer('p1', 'Player', false,p1Jinki);
      const p2 = createPlayer('cpu', 'Rival', true,p2Jinki);
      
      // 初手ドロー
      [p1, p2].forEach(p => {
        const drawCount = getJinkiStatus(p.jinki).handSize;
        const drawn = p.discard.slice(0, drawCount);
        p.hand = drawn;
        p.discard = p.discard.slice(drawCount);
      });

      // 購買エリア初期化
      const marketDeck = Array.from({ length: 30 }).map(() => {
        const template = MOCK_CARDS[Math.floor(Math.random() * (MOCK_CARDS.length - 2)) + 2];
        return { ...template, id: generateId() };
      });
      const market = marketDeck.slice(0, 5);
      const remainingMarket = marketDeck.slice(5);

      return {
        phase: Phase.MAIN,
        turnCount: 1,
        players: [p1, p2],
        market,
        marketDeck: remainingMarket,
        log: ['Game Started. Main Phase.'],
        firstPlayerIndex: 0,
        activePlayerIndex: 0, // Player 1 starts
        winnerId: null,
      };
    }
    // メインフェイズ
    case 'PLAY_CARD': {
      const pIdx = state.players.findIndex(p => p.id === action.playerId);
      if (pIdx === -1) return state;
      const player = { ...state.players[pIdx] };
      const cardIndex = player.hand.findIndex(c => c.id === action.cardId);
      
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      player.hand = player.hand.filter(c => c.id !== action.cardId);
      player.field = [...player.field, card];

      // Effect Resolution (Mock: Draw if Blood type)
      if (card.type === CardType.BLOOD) {
        if (player.discard.length > 0) {
            const drawn = player.discard[0];
            player.discard = player.discard.slice(1);
            player.hand.push(drawn);
        }
      }

      const newPlayers = [...state.players];
      newPlayers[pIdx] = player;

      return {
        ...state,
        players: newPlayers,
        log: [...state.log, `${player.name} played ${card.name}.`],
      };
    }
    // 自傷
    case 'SELF_INFLICT': {
      const pIdx = state.players.findIndex(p => p.id === action.playerId);
      const player = { ...state.players[pIdx] };

      if (player.jinki.isTapped || player.life.length === 0) return state;

      const damage = getJinkiStatus(player.jinki).selfInfliction;
      const taken = Math.min(damage, player.life.length);
      
      // Move Life -> Blood Pool
      const movedLife = player.life.slice(0, taken);
      player.life = player.life.slice(taken);
      player.bloodPool = [...player.bloodPool, ...movedLife];
      
      player.jinki = { ...player.jinki, isTapped: true };

      const newPlayers = [...state.players];
      newPlayers[pIdx] = player;

      return {
        ...state,
        players: newPlayers,
        log: [...state.log, `${player.name} self-inflicted ${taken} damage for Blood.`],
      };
    }
    // 購買フェイズ
    case 'BUY_CARD': {
      const pIdx = state.players.findIndex(p => p.id === action.playerId);
      const player = { ...state.players[pIdx] };
      
      if (player.actionsTaken >= getJinkiStatus(player.jinki).bloodSuccession) return state;

      const cardToBuy = state.market[action.cardIndex];
      if (!cardToBuy || player.bloodPool.length < cardToBuy.cost) return state;

      // Pay Cost
      player.bloodPool = player.bloodPool.slice(0, player.bloodPool.length - cardToBuy.cost);
      
      // Add to Field (Recall rule: Goes to field immediately)
      player.field = [...player.field, cardToBuy];
      player.actionsTaken += 1;

      const newPlayers = [...state.players];
      newPlayers[pIdx] = player;

      // Refill Market
      const newMarket = [...state.market];
      const newMarketDeck = [...state.marketDeck];
      
      newMarket.splice(action.cardIndex, 1);
      if (newMarketDeck.length > 0) {
        newMarket.push(newMarketDeck[0]);
        newMarketDeck.shift();
      }

      return {
        ...state,
        players: newPlayers,
        market: newMarket,
        marketDeck: newMarketDeck,
        log: [...state.log, `${player.name} bought ${cardToBuy.name}.`],
      };
    }
//    パスフェイズ
    case 'PASS_PHASE': {
        const pIdx = state.players.findIndex(p => p.id === action.playerId);
        const newPlayers = [...state.players];
        newPlayers[pIdx] = { ...newPlayers[pIdx], hasPassed: true };

        // Logic: If both passed, go to Battle. Else switch active.
        const otherIdx = (pIdx + 1) % 2;
        const otherPlayer = newPlayers[otherIdx];

        if (otherPlayer.hasPassed) {
            return {
                ...state,
                players: newPlayers,
                phase: Phase.BATTLE,
                log: [...state.log, `${newPlayers[pIdx].name} passed. Entering Blood Battle.`],
            };
        } else {
             return {
                ...state,
                players: newPlayers,
                activePlayerIndex: otherIdx,
                log: [...state.log, `${newPlayers[pIdx].name} passed. Turn switches.`],
            };
        }
    }
    // バトルフェイズの解決
    case 'RESOLVE_BATTLE': {
        let newPlayers = state.players.map(p => {
            // Calc Attack
            let atk = p.field.reduce((sum, c) => sum + c.attack, 0);
            // Mock logic: Crimson Shield Bonus
            if (p.life.length <= 10 && p.field.some(c => c.name === 'Crimson Shield')) {
                atk += 2;
            }
            return { ...p, totalAttack: atk };
        });

        const p1 = newPlayers[0];
        const p2 = newPlayers[1];
        const diff = Math.abs(p1.totalAttack - p2.totalAttack);
        let logMsg = `Battle! P1: ${p1.totalAttack} vs P2: ${p2.totalAttack}. `;

        let winnerIdx = -1;
        if (p1.totalAttack > p2.totalAttack) {
            // P2 takes damage
            const taken = Math.min(diff, p2.life.length);
            const moved = p2.life.slice(0, taken);
            p2.life = p2.life.slice(taken);
            p2.bloodPool = [...p2.bloodPool, ...moved];
            logMsg += `Player 2 takes ${taken} damage.`;
            winnerIdx = 0;
        } else if (p2.totalAttack > p1.totalAttack) {
            const taken = Math.min(diff, p1.life.length);
            const moved = p1.life.slice(0, taken);
            p1.life = p1.life.slice(taken);
            p1.bloodPool = [...p1.bloodPool, ...moved];
            logMsg += `Player 1 takes ${taken} damage.`;
            winnerIdx = 1;
        } else {
            logMsg += `Draw. No damage.`;
            // If draw, first player priority usually, but let's keep it null for simplicity
        }

        // 神器の覚醒処理
        newPlayers = newPlayers.map(p => {
            if (!p.jinki.isAwakened && p.life.length <= LIFE_THRESHOLD_AWAKEN) {
                return {
                    ...p,
                    jinki: { ...p.jinki, isAwakened: true }
                };
            }
            return p;
        });

        // Check Game Over
        let winnerId = null;
        if (newPlayers[0].life.length === 0) winnerId = newPlayers[1].id;
        else if (newPlayers[1].life.length === 0) winnerId = newPlayers[0].id;

        return {
            ...state,
            players: newPlayers,
            phase: winnerId ? Phase.GAME_OVER : Phase.CLEANUP,
            winnerId,
            log: [...state.log, logMsg],
            firstPlayerIndex: winnerIdx !== -1 ? winnerIdx : state.firstPlayerIndex // Winner gets initiative
        };
    }
    // クリーンアップフェイズ(ターン終了フェイズ)
    case 'CLEANUP': {
        const newPlayers = state.players.map(p => {
            // Field -> Discard
            const newDiscard = [...p.discard, ...p.field];
            let newHand = [...p.hand];
            
            // Refill Hand Logic (Simplified: Discard hand, draw fresh like mentioned in rules "Hand Size")
            // "Use all cards or discard them"
            newDiscard.push(...newHand);
            newHand = [];

            // Reshuffle if needed (basic check)
            let deckSource = newDiscard; // In this simple engine, discard IS the deck source for next turn essentially since we don't track strict deck array separate
            const drawCount = getJinkiStatus(p.jinki).handSize;
            
            // To simulate drawing from a deck:
            const shuffled = shuffle(deckSource);
            const drawn = shuffled.slice(0, drawCount);
            const remainingDiscard = shuffled.slice(drawCount);

            return {
                ...p,
                field: [],
                hand: drawn,
                discard: remainingDiscard,
                actionsTaken: 0,
                hasPassed: false,
                jinki: { ...p.jinki, isTapped: false }
            };
        });

        return {
            ...state,
            players: newPlayers,
            phase: Phase.MAIN,
            turnCount: state.turnCount + 1,
            activePlayerIndex: state.firstPlayerIndex,
            log: [...state.log, `Cleanup complete. Turn ${state.turnCount + 1} starts.`],
        };
    }

    default:
      return state;
  }
};

// --- Main Component ---

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, {} as GameState);
  const [cpuThinking, setCpuThinking] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // --- Scaling & Resize Logic ---
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch({ type: 'INIT_GAME' });
  }, []);

  // Scroll log to bottom
  const logRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.log]);

  // --- CPU Logic ---
  const activePlayer = state.players ? state.players[state.activePlayerIndex] : null;

  useEffect(() => {
    if (!activePlayer || !activePlayer.isCpu || state.phase !== Phase.MAIN || state.winnerId) return;

    if (cpuThinking) return;
    setCpuThinking(true);

    const think = async () => {
        // Delay for realism
        await new Promise(r => setTimeout(r, 1500));
//CPUの血継回数チェックもgetJinkiStatsを使用
        const currentCpuStats = getJinkiStatus(activePlayer.jinki);

        // 1. Self Inflict if untappe
        if (!activePlayer.jinki.isTapped) {
            dispatch({ type: 'SELF_INFLICT', playerId: activePlayer.id });
            setCpuThinking(false);
            return;
        }

        // 2. Play Assault cards
        const playbleCard = activePlayer.hand.find(c => c.type === CardType.ASSAULT);
        if (playbleCard) {
            dispatch({ type: 'PLAY_CARD', playerId: activePlayer.id, cardId: playbleCard.id });
            setCpuThinking(false);
            return;
        }

        // 3. Buy Card if actions avail and can afford
        if (activePlayer.actionsTaken < currentCpuStats.bloodSuccession) {
            const affordableIndex = state.market.findIndex(c => c.cost <= activePlayer.bloodPool.length);
            if (affordableIndex !== -1) {
                dispatch({ type: 'BUY_CARD', playerId: activePlayer.id, cardIndex: affordableIndex });
                setCpuThinking(false);
                return;
            }
        }

        // 4. Pass
        dispatch({ type: 'PASS_PHASE', playerId: activePlayer.id });
        setCpuThinking(false);
    };

    think();
  }, [activePlayer, state.phase, state.market, cpuThinking, state.winnerId]);


  // --- Auto Phase Progression ---
  useEffect(() => {
      if (state.phase === Phase.BATTLE) {
          const timer = setTimeout(() => {
              dispatch({ type: 'RESOLVE_BATTLE' });
          }, 2000);
          return () => clearTimeout(timer);
      }
      if (state.phase === Phase.CLEANUP) {
          const timer = setTimeout(() => {
              dispatch({ type: 'CLEANUP' });
          }, 2000);
          return () => clearTimeout(timer);
      }
  }, [state.phase]);


  if (!state.players) return <div className="bg-black h-screen text-white flex items-center justify-center">Loading Blood Recall...</div>;

  const human = state.players.find(p => !p.isCpu)!;
  const cpu = state.players.find(p => p.isCpu)!;
  const isHumanTurn = state.activePlayerIndex === state.players.findIndex(p => p.id === human.id) && state.phase === Phase.MAIN;

  // 画面サイズの調整
  const TARGET_HEIGHT = 1080;
  const aspectRatio = windowSize.width / windowSize.height;
  const targetWidth = Math.max(1920, Math.min(2400, TARGET_HEIGHT * aspectRatio));
  
  const scale = Math.min(
      windowSize.width / targetWidth,
      windowSize.height / TARGET_HEIGHT
  );

  const humanCurrentStats = getJinkiStatus(human.jinki);

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      
      <div 
        style={{ 
            width: targetWidth, 
            height: TARGET_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
        }}
        className="relative flex flex-col bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-gray-900 via-[#0f0f12] to-black shadow-2xl"
      >
      
      {/* --- Header / Status Bar --- */}
      <div className="flex justify-between items-center px-6 py-4 bg-black/60 border-b border-white/10 h-16 shrink-0 relative z-50">
        <h1 className="text-red-600 font-cinzel font-bold text-3xl tracking-widest drop-shadow-md">BLOOD RECALL</h1>
        
        <div className="flex gap-4 text-xl text-gray-300 font-mono">
            <span className={state.phase === Phase.MAIN ? 'text-white font-bold' : 'opacity-50'}>MAIN</span>
            <span>&gt;</span>
            <span className={state.phase === Phase.BATTLE ? 'text-red-500 font-bold animate-pulse' : 'opacity-50'}>BATTLE</span>
            <span>&gt;</span>
            <span className={state.phase === Phase.CLEANUP ? 'text-blue-400 font-bold' : 'opacity-50'}>CLEANUP</span>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsTutorialOpen(true)}
                className="px-4 py-1 border border-gray-600 rounded hover:bg-white/10 text-gray-300 text-sm"
            >
                HOW TO PLAY
            </button>
            <div className="text-sm text-gray-500 font-mono">Turn {state.turnCount}</div>
        </div>
      </div>

      {/* --- Game Area --- */}
      <div className="flex-grow relative flex flex-col lg:flex-row overflow-hidden">
        
        {/* --- Left: Game Log (Desktop) --- */}
        <div className="w-80 bg-black/40 border-r border-white/10 p-6 overflow-y-auto shrink-0 font-mono text-sm">
            <h3 className="text-gray-500 mb-4 border-b border-gray-700 pb-2">BATTLE LOG</h3>
            <div ref={logRef} className="space-y-2 h-full overflow-y-auto pb-20">
                {state.log.map((l, i) => (
                    <div key={i} className="text-gray-300 break-words leading-tight"><span className="text-red-900 mr-2">➤</span>{l}</div>
                ))}
            </div>
        </div>

        {/* --- Center: Board --- */}
        <div className="flex-grow flex flex-col relative">
            
            {/* CPU Area (Top) */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-red-950/20 to-transparent p-4">
                <div className="flex gap-12 items-center scale-90">
                    <div className="flex flex-col items-center">
                        <LifeArea lifeCount={cpu.life.length} playerId={cpu.id} isEnemy={true} />
                        <div className="mt-2 text-sm text-gray-400 font-mono">Hand: {cpu.hand.length} | Atk: {cpu.totalAttack}</div>
                         <div className="flex -space-x-12 mt-2 opacity-70">
                            {cpu.hand.map((c, i) => (
                                <div key={i} className="w-16 h-24 bg-red-950 border border-gray-600 rounded shadow-md"></div>
                            ))}
                        </div>
                    </div>

                    {/* CPU Field */}
                    <div className="w-96 h-40 border border-dashed border-white/10 rounded-xl bg-black/20 flex items-center justify-center flex-wrap gap-2 p-2 overflow-hidden shadow-inner">
                         {cpu.field.length === 0 && <span className="text-sm text-gray-600">Empty Field</span>}
                         {cpu.field.map((card) => (
                             <CardComponent key={card.id} card={card} size="sm" />
                         ))}
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <JinkiCard jinki={cpu.jinki} isEnemy={true} />
                        <BloodPool amount={cpu.bloodPool.length} />
                    </div>
                </div>
            </div>

            {/* Market / Center Strip */}
            <div className="h-64 bg-black/40 border-y border-white/10 flex items-center justify-center relative backdrop-blur-sm">
                <div className="absolute left-4 top-4 text-sm text-yellow-600 font-cinzel tracking-[0.2em] border-b border-yellow-600/30 pb-1">COVENANT AREA (MARKET)</div>
                <div className="flex gap-6 px-12 overflow-x-auto max-w-full items-center h-full scrollbar-hide pt-4">
                    {state.market.map((card, i) => {
                         const canBuy = isHumanTurn && human.bloodPool.length >= card.cost && human.actionsTaken < humanCurrentStats.bloodSuccession;
                         return (
                            <CardComponent 
                                key={card.id} 
                                card={card} 
                                isPlayable={canBuy}
                                className={canBuy ? 'hover:scale-110 cursor-pointer ring-4 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'opacity-60 grayscale brightness-75'}
                                onClick={() => {
                                    if (canBuy) {
                                        dispatch({ type: 'BUY_CARD', playerId: human.id, cardIndex: i });
                                    }
                                }}
                            />
                         );
                    })}
                     {state.market.length === 0 && <div className="text-gray-500 text-lg italic">Market Empty</div>}
                </div>
                
                {/* Central Status Overlay */}
                {state.phase === Phase.BATTLE && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
                        <div className="text-6xl font-cinzel font-bold text-red-500 animate-bounce tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                            BATTLE PHASE
                        </div>
                    </div>
                )}
                 {state.winnerId && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 flex-col backdrop-blur-md">
                        <div className="text-8xl font-cinzel font-bold text-yellow-500 mb-8 drop-shadow-[0_0_25px_rgba(234,179,8,0.8)]">
                            {state.winnerId === human.id ? 'VICTORY' : 'DEFEAT'}
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-12 py-4 bg-red-800 hover:bg-red-700 text-white font-cinzel font-bold text-xl rounded-lg shadow-xl border border-red-500 transition-all hover:scale-105"
                        >
                            PLAY AGAIN
                        </button>
                    </div>
                )}
            </div>

            {/* Player Area (Bottom) */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-t from-blue-950/20 to-transparent p-4 pb-8">
                 <div className="flex gap-12 items-end">
                    
                    {/* Avatar & Blood */}
                    <div className="flex flex-col items-center gap-4">
                        <BloodPool amount={human.bloodPool.length} />
                        <JinkiCard 
                            jinki={human.jinki} 
                            isEnemy={false} 
                            canSelfInflict={isHumanTurn}
                            onSelfInflict={() => dispatch({ type: 'SELF_INFLICT', playerId: human.id })}
                        />
                    </div>

                    {/* Field & Controls */}
                    <div className="flex flex-col gap-3 items-center">
                        <div className="w-[500px] h-40 border-2 border-dashed border-white/20 rounded-xl bg-black/30 flex items-center justify-center flex-wrap gap-2 p-3 overflow-hidden shadow-lg">
                            {human.field.length === 0 && <span className="text-gray-500 font-cinzel tracking-wider">PLAY CARDS HERE</span>}
                            {human.field.map((card) => (
                                <CardComponent key={card.id} card={card} size="sm" />
                            ))}
                        </div>

                        <div className="flex w-full justify-between items-center bg-gray-900/80 p-3 rounded-lg border border-gray-700">
                            <div className="text-sm text-gray-300 font-mono leading-relaxed">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400">Succession:</span>
                                    <span className="text-white font-bold">{human.actionsTaken}/{humanCurrentStats.bloodSuccession}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-400">Total Attack:</span>
                                    <span className="text-2xl text-red-500 font-bold">{human.field.reduce((a,c) => a+c.attack, 0)}</span>
                                </div>
                            </div>
                            
                            {isHumanTurn ? (
                                <button 
                                    onClick={() => dispatch({ type: 'PASS_PHASE', playerId: human.id })}
                                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-500 hover:border-white text-white font-bold rounded shadow-lg active:scale-95 transition-all tracking-wider"
                                >
                                    END MAIN PHASE
                                </button>
                            ) : (
                                <div className="text-yellow-500 text-lg animate-pulse font-bold tracking-widest px-4">
                                    {state.phase === Phase.MAIN ? 'OPPONENT THINKING...' : 'RESOLVING...'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Life & Hand */}
                    <div className="flex flex-col items-end gap-6">
                        <LifeArea lifeCount={human.life.length} playerId={human.id} isEnemy={false} />
                        
                        {/* Hand */}
                        <div className="relative h-48 w-96">
                            <div className="absolute bottom-[-20px] right-0 flex -space-x-16 hover:-space-x-4 transition-all duration-500 p-4">
                                {human.hand.map((card, i) => (
                                    <div key={card.id} className="transform hover:-translate-y-12 transition-transform duration-300 z-10 hover:z-50 cursor-pointer">
                                        <CardComponent 
                                            card={card} 
                                            isPlayable={isHumanTurn}
                                            onClick={() => isHumanTurn && dispatch({ type: 'PLAY_CARD', playerId: human.id, cardId: card.id })}
                                            className="shadow-2xl hover:shadow-red-500/30"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default App;