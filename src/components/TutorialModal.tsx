import React from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gray-900 border-2 border-red-900 text-gray-200 max-w-4xl w-full h-[80vh] overflow-y-auto rounded-xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕ CLOSE
        </button>
        
        <div className="p-8 font-sans space-y-6">
          <h2 className="text-3xl font-cinzel text-red-500 border-b border-red-900/50 pb-2">HOW TO PLAY: BLOOD RECALL</h2>
          
          <section>
            <h3 className="text-xl font-bold text-white mb-2">1. The Goal</h3>
            <p className="text-sm opacity-80">Reduce your opponent's life to 0. Your life is represented by 20 Blood Cards.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">2. Resource System: Pain is Power</h3>
            <p className="text-sm opacity-80 mb-2">You do not gain mana automatically. You must <span className="text-red-400 font-bold">SELF INFLICT</span> damage to generate Blood.</p>
            <ul className="list-disc list-inside text-sm opacity-80 space-y-1 ml-2">
              <li>Click "SELF INFLICT" on your Avatar (Jinki) to take damage and gain Blood.</li>
              <li>Blood is used to buy cards from the Market (Recall).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">3. Phase Structure</h3>
            <div className="space-y-3">
              <div>
                <span className="text-white font-bold block">MAIN PHASE</span>
                <span className="text-xs opacity-70">Play cards from your hand, Self Inflict for blood, and Buy (Recall) new cards from the market. Bought cards go <span className="text-yellow-400">directly to the field</span> and can attack this turn!</span>
              </div>
              <div>
                <span className="text-red-400 font-bold block">BATTLE PHASE (Kessen)</span>
                <span className="text-xs opacity-70">Compare Total Attack power. The player with lower attack takes damage equal to the difference.</span>
              </div>
              <div>
                <span className="text-blue-400 font-bold block">CLEANUP PHASE</span>
                <span className="text-xs opacity-70">All cards on field are discarded. Hand is discarded and redrawn.</span>
              </div>
            </div>
          </section>

          <section>
             <h3 className="text-xl font-bold text-white mb-2">4. Life Stacks</h3>
             <p className="text-sm opacity-80">
                Your life is divided into two stacks. The top row (Armor) takes damage first. 
                Once you drop below 10 life, you enter <span className="text-red-500 font-bold">Awakened State</span>, gaining powerful buffs.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
