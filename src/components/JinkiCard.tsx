import React from 'react';
import type { Jinki, JinkiStats } from '../types/type';
import { Phase } from '../types/type';

interface JinkiCardProps {
  jinki: Jinki;
  isEnemy: boolean;
  onSelfInflict?: () => void;
  canSelfInflict?: boolean;
  bloodPoolAmount?: number;
  onUseRecall?:(reacallId: string) => void;
}

const JinkiCard: React.FC<JinkiCardProps> = ({ jinki, isEnemy, onSelfInflict, canSelfInflict, bloodPoolAmount = 0 , onUseRecall}) => {
    const currentStats:JinkiStats = jinki.isAwakened ? jinki.awakened : jinki.normal;
  return (
    <div className="flex items-end gap-4"> {/* 横並びにするための新しい親コンテナ */}

      {/* 1. Jinkiカード本体 */}
      <div className={`
        relative w-32 h-48 rounded-xl border-4 transition-all duration-300 flex flex-col overflow-hidden shadow-2xl
        ${jinki.isAwakened ? 'border-red-500 bg-red-950' : 'border-gray-500 bg-gray-800'}
        ${jinki.isTapped ? 'opacity-60 grayscale' : ''}
        ${isEnemy ? 'rotate-180' : ''}
      `}>
          <div className="absolute inset-0 opacity-40">
              <img src="https://picsum.photos/200/300?grayscale" alt="Avatar" className="w-full h-full object-cover rounded-md" />
          </div>
          {jinki.isTapped && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <span className="text-white font-cinzel font-bold rotate-45 border-2 border-white p-1">EXHAUSTED</span>
              </div>
          )}
          <div className="relative z-20 p-2 flex flex-col h-full justify-between text-white drop-shadow-md">
            <div className="text-xs font-bold text-center uppercase tracking-widest bg-black/40 rounded p-1">
                {jinki.name}
            </div>
            <div className="space-y-1 text-[10px]">
                <div className="flex justify-between bg-black/30 px-1 rounded">
                    <span>Hand:</span>
                    <span className="font-mono text-yellow-400">{currentStats.handSize}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-1 rounded">
                    <span>Inflict:</span>
                    <span className="font-mono text-red-500">{currentStats.selfInfliction}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-1 rounded">
                    <span>Succession:</span>
                    <span className="font-mono text-blue-400">{currentStats.bloodSuccession}</span>
                </div>
            </div>
            <div className="text-center text-yellow-300 text-[9px] font-semibold italic bg-black/40 rounded py-1 px-2">
              {currentStats.passiveEffect}
            </div>
            {!isEnemy && !jinki.isTapped && canSelfInflict && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onSelfInflict?.(); }}
                    className="w-full mt-1 py-1 bg-red-700 hover:bg-red-600 text-xs font-bold rounded border border-red-400"
                >
                    SELF INFLICT
                </button>
            )}
          </div>
      </div>
      
      {/* 2. Recall表示エリア (カードの枠外に配置) */}
      {!isEnemy && (
        <div className="flex flex-col gap-2 pb-1"> {/* Recall同士は縦に並べる */}
          {jinki.recalls.map((recall) => {
            const canUse = canSelfInflict && !jinki.isTapped && recall.trigger === Phase.MAIN && bloodPoolAmount >= recall.cost.baseAmount;
            
            return (
              <div key={recall.id} className={`p-2 rounded-lg border w-40 ${canUse ? 'border-yellow-500/70 bg-gray-800' : 'border-gray-700/50 bg-black/30 opacity-70'}`}>
                <p className="text-white font-semibold text-sm text-center">{recall.name}</p>
                <p className="text-gray-400 text-[10px] mt-1 text-center font-mono">Cost: {recall.cost.description}</p>
                
                <button
                  onClick={() => onUseRecall?.(recall.id)}
                  disabled={!canUse}
                  className="w-full text-xs mt-2 py-1 rounded font-bold transition-colors text-white
                            bg-yellow-800 hover:bg-yellow-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
                            border border-yellow-900"
                >
                  ACTIVATE
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JinkiCard;