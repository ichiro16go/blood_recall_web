import React from 'react';
import type { Jinki } from '../types/type';

interface JinkiCardProps {
  jinki: Jinki;
  isEnemy: boolean;
  onSelfInflict?: () => void;
  canSelfInflict?: boolean;
}

const JinkiCard: React.FC<JinkiCardProps> = ({ jinki, isEnemy, onSelfInflict, canSelfInflict }) => {
  return (
    <div className={`
      relative w-32 h-48 rounded-xl border-4 transition-all duration-500 flex flex-col overflow-hidden shadow-2xl
      ${jinki.isAwakened ? 'border-red-500 bg-red-950' : 'border-gray-500 bg-gray-800'}
      ${jinki.isTapped ? 'opacity-60 grayscale' : ''}
      ${isEnemy ? 'rotate-180' : ''}
    `}>
        {/* Image Placeholder */}
        <div className="absolute inset-0 opacity-40">
            <img src="https://picsum.photos/200/300?grayscale" alt="Avatar" className="w-full h-full object-cover" />
        </div>

        {/* Tap Overlay */}
        {jinki.isTapped && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <span className="text-white font-cinzel font-bold rotate-45 border-2 border-white p-1">EXHAUSTED</span>
             </div>
        )}

        {/* Content */}
        <div className="relative z-20 p-2 flex flex-col h-full justify-between text-white drop-shadow-md">
            <div className="text-xs font-bold text-center uppercase tracking-widest bg-black/40 rounded p-1">
                {jinki.name}
            </div>

            <div className="space-y-1 text-[10px]">
                <div className="flex justify-between bg-black/30 px-1 rounded">
                    <span>Hand Size:</span>
                    <span className="font-mono text-yellow-400">{jinki.handSize}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-1 rounded">
                    <span>Self-Inflict:</span>
                    <span className="font-mono text-red-500">{jinki.selfInfliction}</span>
                </div>
                <div className="flex justify-between bg-black/30 px-1 rounded">
                    <span>Succession:</span>
                    <span className="font-mono text-blue-400">{jinki.bloodSuccession}</span>
                </div>
            </div>

            {!isEnemy && !jinki.isTapped && canSelfInflict && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onSelfInflict?.(); }}
                    className="w-full mt-1 py-1 bg-red-700 hover:bg-red-600 text-xs font-bold rounded border border-red-400 transition-colors"
                >
                    SELF INFLICT
                </button>
            )}
        </div>
    </div>
  );
};

export default JinkiCard;