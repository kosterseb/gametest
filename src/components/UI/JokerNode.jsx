import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { HelpCircle, Sparkles, Package } from 'lucide-react';
import { getRandomItemReward, createItemInstance } from '../../data/items';

// Placeholder joker effects - simple, non-run-defining buffs
const jokerEffects = [
  { 
    name: "Energy Surge", 
    description: "Gain +1 energy for the next battle",
    effect: (dispatch) => {
      dispatch({ type: 'GAIN_ENERGY', amount: 1 });
    }
  },
  { 
    name: "Card Bonus", 
    description: "Start next battle with +1 card",
    effect: (dispatch) => {
      dispatch({ type: 'JOKER_BONUS', bonus: 'extraCard' });
    }
  },
  { 
    name: "Quick Heal", 
    description: "Restore 15 HP",
    effect: (dispatch) => {
      dispatch({ type: 'HEAL_PLAYER', amount: 15 });
    }
  },
  { 
    name: "Minor Setback", 
    description: "Lose 10 HP (bad luck!)",
    effect: (dispatch) => {
      dispatch({ type: 'DAMAGE_PLAYER', amount: 10 });
    }
  }
];

export const JokerNode = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [itemReward, setItemReward] = useState(null);
  const [hasItemDrop, setHasItemDrop] = useState(false);

  useEffect(() => {
    // Randomly select an effect when component mounts
    const randomEffect = jokerEffects[Math.floor(Math.random() * jokerEffects.length)];
    setSelectedEffect(randomEffect);

    // 50% chance for item drop
    const itemDropRoll = Math.random();
    console.log('Joker Node - Item drop roll:', itemDropRoll, '(need ≤0.5 for item)');
    
    if (itemDropRoll <= 0.5) {
      const item = getRandomItemReward();
      const itemInstance = createItemInstance(item.id);
      setItemReward(itemInstance);
      setHasItemDrop(true);
      console.log('✓ Joker Node dropped item:', itemInstance.name, `(${itemInstance.rarity})`);
    } else {
      console.log('✗ Joker Node did not drop item');
    }
  }, []);

  const handleReveal = () => {
    setIsRevealed(true);
    if (selectedEffect) {
      selectedEffect.effect(dispatch);
    }

    // If item dropped, add to pending rewards
    if (hasItemDrop && itemReward) {
      dispatch({ type: 'SET_ITEM_REWARD', items: [itemReward] });
      console.log('Joker item reward set! shouldShowItemReward should now be true');
    }
  };

  const handleContinue = () => {
    // Check if there's an item reward to claim
    if (hasItemDrop && gameState.shouldShowItemReward) {
      console.log('→ Navigating to /reward (item drop)');
      navigate('/reward');
    } else {
      console.log('→ Navigating to /map (no item drop)');
      navigate('/map');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl text-center max-w-md">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold mb-4">Mystery Node</h1>
          
          {!isRevealed ? (
            <>
              <p className="text-gray-600 mb-6">
                Something mysterious awaits... will fortune favor you?
              </p>
              <button
                onClick={handleReveal}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
              >
                <Sparkles className="w-6 h-6" />
                <span>Reveal</span>
              </button>
            </>
          ) : (
            <>
              {/* Joker Effect Result */}
              <div className={`mb-6 p-4 rounded-lg ${selectedEffect?.name === 'Minor Setback' ? 'bg-red-100' : 'bg-green-100'}`}>
                <h2 className="text-2xl font-bold mb-2">{selectedEffect?.name}</h2>
                <p className="text-gray-700">{selectedEffect?.description}</p>
              </div>

              {/* Item Drop Notification */}
              {hasItemDrop && itemReward && (
                <div className="mb-6 bg-purple-100 border-2 border-purple-400 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Package className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-purple-800">Item Found!</h3>
                  </div>
                  <div className="text-5xl mb-2">{itemReward.emoji}</div>
                  <div className="font-bold text-lg text-purple-800">{itemReward.name}</div>
                  <div className="text-sm text-purple-700">{itemReward.description}</div>
                  <div className="mt-2 text-xs bg-purple-500 text-white px-3 py-1 rounded-full inline-block font-bold">
                    {itemReward.type === 'consumable' ? 'CONSUMABLE' : 'PASSIVE'} • {itemReward.rarity.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-green-700 transition-all transform hover:scale-105"
              >
                {hasItemDrop ? 'Claim Item' : 'Continue'}
              </button>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};