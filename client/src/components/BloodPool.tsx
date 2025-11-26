import React from 'react';

interface BloodPoolProps {
  amount: number;
}

const BloodPool: React.FC<BloodPoolProps> = ({ amount }) => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center bg-black/40 rounded-full border-2 border-red-900/50 shadow-inner">
      <div className="absolute inset-2 rounded-full bg-red-900 opacity-20 animate-pulse"></div>
      
      {amount > 0 && (
         <div className="absolute bottom-2 w-full flex justify-center space-x-[-8px]">
            {Array.from({length: Math.min(amount, 10)}).map((_, i) => (
                <div key={i} className="w-4 h-6 bg-red-600 rounded-sm border border-red-950 shadow-sm"></div>
            ))}
            {amount > 10 && <span className="ml-2 text-xs text-white self-end">+{amount - 10}</span>}
         </div>
      )}

      <div className="z-10 flex flex-col items-center">
        <span className="text-xs text-red-300 uppercase font-cinzel">Blood</span>
        <span className="text-3xl font-bold text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
            {amount}
        </span>
      </div>
    </div>
  );
};

export default BloodPool;