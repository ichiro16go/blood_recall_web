import React from 'react';

interface LifeAreaProps {
  lifeCount: number;
  playerId: string;
  isEnemy: boolean;
}

const LifeArea: React.FC<LifeAreaProps> = ({ lifeCount, isEnemy }) => {
  // Blood Recall Logic: 20 Life Total.
  // First 10 (Index 10-19) are Vertical Stack (Inner Life).
  // Last 10 (Index 0-9) are Horizontal Stack (Armor).
  // Damage removes from Horizontal first.
  
  // Visualize:
  // Top Row: Horizontal Stack (Left to Right) -> Represents 11-20 HP range essentially
  // Bottom Row: Vertical Stack (Stacked) -> Represents 1-10 HP range

  const horizontalCards = Math.max(0, lifeCount - 10); // The "Armor" (Upper 10)
  const verticalCards = Math.min(lifeCount, 10); // The "Core" (Lower 10)

  // Array generation for rendering
  const horizArray = Array.from({ length: horizontalCards });
  const vertArray = Array.from({ length: verticalCards });

  return (
    <div className={`flex flex-col items-start gap-2 p-2 rounded-lg bg-black/20 border border-white/5 ${isEnemy ? 'items-end' : ''}`}>
      <div className="text-xs text-red-400 font-cinzel mb-1">Life Area: {lifeCount}</div>
      
      {/* Horizontal Stack (Armor) - Drawn Lying Down or Side by Side */}
      <div className="flex -space-x-8 h-12 items-center pl-2">
        {horizArray.map((_, i) => (
            <div 
                key={`h-${i}`} 
                className="w-12 h-8 bg-red-900 border border-red-400 rounded shadow-sm transform hover:-translate-y-1 transition-transform"
                style={{ zIndex: i }}
                title="Horizontal Stack (Armor)"
            >
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/blood-splatter.png')] opacity-50"></div>
            </div>
        ))}
      </div>

      {/* Vertical Stack (Core Life) - Stacked vertically effectively, but visualized as a dense pile */}
      <div className="relative w-12 h-16 mt-2">
          {vertArray.map((_, i) => (
             <div 
                key={`v-${i}`}
                className="absolute bottom-0 left-0 w-10 h-14 bg-red-950 border border-red-600 rounded shadow-md"
                style={{ 
                    bottom: `${i * 2}px`, 
                    left: `${i * 1}px`,
                    zIndex: i 
                }}
                title="Vertical Stack (Core Life)"
             >
                <div className="w-full h-full flex items-center justify-center">
                   <span className="text-red-500/50 text-xs font-bold">†</span>
                </div>
             </div>
          ))}
          {verticalCards === 0 && <div className="text-xs text-gray-500">Dead</div>}
      </div>
    </div>
  );
};

export default LifeArea;