import React, { useState, useEffect, useReducer, } from 'react';
import type {  GameState, Player } from './types/type';
import { CardType, Phase } from './types/type';
import { MOCK_CARDS, INITIAL_JINKI, STARTING_DECK_SIZE, INITIAL_LIFE_COUNT, LIFE_THRESHOLD_AWAKEN, generateId, AWAKENED_JINKI_MODIFIERS } from './stores/constants';
import CardComponent from './components/CardComponent';
import LifeArea from './components/LifeArea';
import JinkiCard from './components/JinkiCard';
import BloodPool from './components/BloodPool';


const shuffle = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);

const createPlayer = (id: string, name: string, isCpu: boolean): Player => {
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
    jinki: { ...INITIAL_JINKI },
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
    case 'INIT_GAME': {
      const p1 = createPlayer('p1', 'Player', false);
      const p2 = createPlayer('cpu', 'Rival', true);
      
      // Draw initial hands
      [p1, p2].forEach(p => {
        const drawCount = p.jinki.handSize;
        const drawn = p.discard.slice(0, drawCount);
        p.hand = drawn;
        p.discard = p.discard.slice(drawCount);
      });

      // Init Market
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

    case 'SELF_INFLICT': {
      const pIdx = state.players.findIndex(p => p.id === action.playerId);
      const player = { ...state.players[pIdx] };

      if (player.jinki.isTapped || player.life.length === 0) return state;

      const damage = player.jinki.selfInfliction;
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

    case 'BUY_CARD': {
      const pIdx = state.players.findIndex(p => p.id === action.playerId);
      const player = { ...state.players[pIdx] };
      
      if (player.actionsTaken >= player.jinki.bloodSuccession) return state;

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

        // Check Awakening
        newPlayers = newPlayers.map(p => {
            if (!p.jinki.isAwakened && p.life.length <= LIFE_THRESHOLD_AWAKEN) {
                return {
                    ...p,
                    jinki: { ...p.jinki, ...AWAKENED_JINKI_MODIFIERS, isAwakened: true }
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
            const deckSource = newDiscard; // In this simple engine, discard IS the deck source for next turn essentially since we don't track strict deck array separate
            const drawCount = p.jinki.handSize;
            
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

    const think = async () => {
        // Mark CPU as thinking inside the async callback to avoid synchronous setState in effect
        setCpuThinking(true);

        // Delay for realism
        await new Promise(r => setTimeout(r, 1500));

        // 1. Self Inflict if untapped
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
        if (activePlayer.actionsTaken < activePlayer.jinki.bloodSuccession) {
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

  return (
    <div className="flex flex-col h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0f0f12] to-black overflow-hidden">
      
      {/* --- Header / Status Bar --- */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/60 border-b border-white/10 h-12 shrink-0">
        <h1 className="text-red-600 font-cinzel font-bold text-xl tracking-widest">BLOOD RECALL</h1>
        <div className="flex gap-4 text-sm text-gray-300 font-mono">
            <span className={state.phase === Phase.MAIN ? 'text-white font-bold' : 'opacity-50'}>MAIN</span>
            <span>&gt;</span>
            <span className={state.phase === Phase.BATTLE ? 'text-red-500 font-bold animate-pulse' : 'opacity-50'}>BATTLE</span>
            <span>&gt;</span>
            <span className={state.phase === Phase.CLEANUP ? 'text-blue-400 font-bold' : 'opacity-50'}>CLEANUP</span>
        </div>
        <div className="text-xs text-gray-500">Turn {state.turnCount}</div>
      </div>

      {/* --- Game Area --- */}
      <div className="flex-grow relative flex flex-col lg:flex-row overflow-hidden">
        
        {/* --- Left: Game Log (Desktop) --- */}
        <div className="hidden lg:block w-64 bg-black/40 border-r border-white/10 p-4 overflow-y-auto shrink-0 font-mono text-xs">
            <h3 className="text-gray-500 mb-2 border-b border-gray-700">BATTLE LOG</h3>
            <div ref={logRef} className="space-y-1 h-full overflow-y-auto pb-20">
                {state.log.map((l, i) => (
                    <div key={i} className="text-gray-300 break-words"><span className="text-red-900 mr-1">➤</span>{l}</div>
                ))}
            </div>
        </div>

        {/* --- Center: Board --- */}
        <div className="flex-grow flex flex-col relative">
            
            {/* CPU Area (Top) */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-red-950/20 to-transparent p-2">
                <div className="flex gap-8 items-center">
                    <div className="flex flex-col items-center">
                        <LifeArea lifeCount={cpu.life.length} playerId={cpu.id} isEnemy={true} />
                        <div className="mt-2 text-xs text-gray-400">Hand: {cpu.hand.length} | Atk: {cpu.totalAttack}</div>
                        {/* CPU Hand (Hidden) */}
                         <div className="flex -space-x-12 mt-1 opacity-70">
                            {cpu.hand.map((_, i) => (
                                <div key={i} className="w-12 h-16 bg-red-950 border border-gray-600 rounded"></div>
                            ))}
                        </div>
                    </div>

                    {/* CPU Field */}
                    <div className="w-64 h-32 border border-dashed border-white/10 rounded bg-black/20 flex items-center justify-center flex-wrap gap-2 p-2 overflow-hidden">
                         {cpu.field.length === 0 && <span className="text-xs text-gray-600">Empty Field</span>}
                         {cpu.field.map((card) => (
                             <CardComponent key={card.id} card={card} size="sm" />
                         ))}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <JinkiCard jinki={cpu.jinki} isEnemy={true} />
                        <BloodPool amount={cpu.bloodPool.length} />
                    </div>
                </div>
            </div>

            {/* Market / Center Strip */}
            <div className="h-48 bg-black/30 border-y border-white/10 flex items-center justify-center relative">
                <div className="absolute left-2 top-2 text-xs text-yellow-600 font-cinzel tracking-widest">COVENANT AREA (MARKET)</div>
                <div className="flex gap-3 px-4 overflow-x-auto max-w-full items-center h-full scrollbar-hide">
                    {state.market.map((card, i) => (
                        <CardComponent 
                            key={card.id} 
                            card={card} 
                            className={isHumanTurn && human.bloodPool.length >= card.cost && human.actionsTaken < human.jinki.bloodSuccession ? 'hover:scale-110 cursor-pointer ring-2 ring-yellow-500' : 'opacity-70'}
                            onClick={() => {
                                if (isHumanTurn && human.bloodPool.length >= card.cost) {
                                    dispatch({ type: 'BUY_CARD', playerId: human.id, cardIndex: i });
                                }
                            }}
                        />
                    ))}
                     {state.market.length === 0 && <div className="text-gray-500 text-sm italic">Market Empty</div>}
                </div>
                
                {/* Central Status Overlay */}
                {state.phase === Phase.BATTLE && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="text-4xl font-cinzel font-bold text-red-500 animate-bounce">
                            BATTLE PHASE
                        </div>
                    </div>
                )}
                 {state.winnerId && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 flex-col">
                        <div className="text-5xl font-cinzel font-bold text-yellow-500 mb-4">
                            {state.winnerId === human.id ? 'VICTORY' : 'DEFEAT'}
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Player Area (Bottom) */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-t from-blue-950/20 to-transparent p-2 pb-4">
                 <div className="flex gap-8 items-end">
                    
                    {/* Avatar & Blood */}
                    <div className="flex flex-col items-center gap-2">
                        <BloodPool amount={human.bloodPool.length} />
                        <JinkiCard 
                            jinki={human.jinki} 
                            isEnemy={false} 
                            canSelfInflict={isHumanTurn}
                            onSelfInflict={() => dispatch({ type: 'SELF_INFLICT', playerId: human.id })}
                        />
                    </div>

                    {/* Field & Controls */}
                    <div className="flex flex-col gap-2">
                        <div className="w-96 h-32 border border-dashed border-white/10 rounded bg-black/20 flex items-center justify-center flex-wrap gap-2 p-2 overflow-hidden">
                            {human.field.length === 0 && <span className="text-xs text-gray-600">Play cards here</span>}
                            {human.field.map((card) => (
                                <CardComponent key={card.id} card={card} size="sm" />
                            ))}
                        </div>

                        <div className="flex justify-between items-center bg-black/50 p-2 rounded">
                            <div className="text-xs text-gray-400">
                                Actions: {human.actionsTaken}/{human.jinki.bloodSuccession} <br/>
                                Total Attack: <span className="text-red-400 font-bold">{human.field.reduce((a,c) => a+c.attack, 0)}</span>
                            </div>
                            
                            {isHumanTurn ? (
                                <button 
                                    onClick={() => dispatch({ type: 'PASS_PHASE', playerId: human.id })}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white font-bold rounded text-sm shadow-lg active:translate-y-1"
                                >
                                    END MAIN PHASE
                                </button>
                            ) : (
                                <div className="text-yellow-500 text-sm animate-pulse font-bold">
                                    {state.phase === Phase.MAIN ? 'OPPONENT THINKING...' : 'RESOLVING...'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Life & Hand */}
                    <div className="flex flex-col items-end gap-4">
                        <LifeArea lifeCount={human.life.length} playerId={human.id} isEnemy={false} />
                        
                        {/* Hand */}
                        <div className="relative h-32 w-64">
                             <div className="absolute bottom-0 right-0 flex -space-x-12 hover:-space-x-4 transition-all duration-300 p-2">
                                {human.hand.map((card) => (
                                    <div key={card.id} className="transform hover:-translate-y-6 transition-transform z-10 hover:z-50">
                                        <CardComponent 
                                            card={card} 
                                            isPlayable={isHumanTurn}
                                            onClick={() => isHumanTurn && dispatch({ type: 'PLAY_CARD', playerId: human.id, cardId: card.id })}
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
      
      {/* Mobile Portrait Warning */}
      <div className="lg:hidden fixed inset-0 pointer-events-none flex items-center justify-center z-[100] opacity-0">
        {/* Ideally we'd show a rotate message here via media query, but relying on responsiveness for now */}
      </div>
    </div>
  );
};

export default App;