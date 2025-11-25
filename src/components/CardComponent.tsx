import React from 'react';
import type { Card } from '../types/type';
import { CardType } from '../types/type';
import { useTranslation } from 'react-i18next';

interface CardProps {
  card: Card;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, isPlayable = false, size = 'md', className = '' }) => {
  const { t } = useTranslation(); 
  
  const sizeClasses = {
    sm: 'w-16 h-24 text-[0.6rem]',
    md: 'w-24 h-36 text-xs',
    lg: 'w-32 h-48 text-sm'
  };

  const typeColors = {
    [CardType.ASSAULT]: 'border-red-600 bg-red-950/30',
    [CardType.BLOOD]: 'border-purple-600 bg-purple-950/30',
    [CardType.RECALL]: 'border-yellow-600 bg-yellow-950/30',
    [CardType.CALAMITY]: 'border-gray-600 bg-gray-900'
  };

  return (
    <div 
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative flex flex-col p-2 border-2 rounded-lg shadow-lg transition-transform duration-200 select-none
        ${sizeClasses[size]}
        ${typeColors[card.type]}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-red-500/50' : ''}
        ${className}
      `}
    >
      {/* Cost Badge */}
      {card.cost > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-700 rounded-full flex items-center justify-center border border-white text-white font-bold text-xs shadow-md">
          {card.cost}
        </div>
      )}

      {/* Attack Badge */}
      {card.attack > 0 && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-red-500 text-red-400 font-bold text-xs shadow-md">
          {card.attack}
        </div>
      )}

      <div className="font-cinzel font-bold text-gray-200 truncate border-b border-white/10 pb-1 mb-1">
        {card.name}
      </div>
      
      <div className="flex-grow flex items-center justify-center my-1">
        <div className="text-center opacity-60 italic text-[0.65rem] leading-tight">
            {card.description}
        </div>
      </div>

      <div className="text-[0.6rem] text-gray-400 uppercase tracking-wider text-center mt-auto">
        {card.type}
      </div>
    </div>
  );
};

export default CardComponent;