import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { HelpCircle, Sparkles, Package } from 'lucide-react';
import { getRandomItemReward, createItemInstance } from '../../data/items';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';

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
      <div className="min-h-screen nb-bg-cyan flex items-center justify-center p-8">
        <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 text-center max-w-md">
          <div className="nb-bg-cyan nb-border-xl nb-shadow-lg p-6 mb-6 inline-block">
            <HelpCircle className="w-16 h-16 mx-auto text-black" />
          </div>
          <NBHeading level={1} className="text-black mb-6">MYSTERY NODE</NBHeading>

          {!isRevealed ? (
            <>
              <div className="nb-bg-purple nb-border-lg nb-shadow px-6 py-3 mb-6 inline-block">
                <p className="text-black font-bold text-sm uppercase">
                  Something mysterious awaits... will fortune favor you?
                </p>
              </div>
              <NBButton
                onClick={handleReveal}
                variant="purple"
                size="xl"
                className="flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-6 h-6" />
                <span>REVEAL</span>
              </NBButton>
            </>
          ) : (
            <>
              {/* Joker Effect Result */}
              <div className={`mb-6 nb-border-xl nb-shadow-lg p-6 ${selectedEffect?.name === 'Minor Setback' ? 'nb-bg-red' : 'nb-bg-green'}`}>
                <NBHeading level={2} className="text-black mb-3">{selectedEffect?.name}</NBHeading>
                <p className="text-black font-bold uppercase">{selectedEffect?.description}</p>
              </div>

              {/* Item Drop Notification */}
              {hasItemDrop && itemReward && (
                <div className="mb-6 nb-bg-purple nb-border-xl nb-shadow-lg p-6 animate-pulse">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Package className="w-6 h-6 text-black" />
                    <NBHeading level={3} className="text-black">ITEM FOUND!</NBHeading>
                  </div>
                  <div className="text-5xl mb-3">{itemReward.emoji}</div>
                  <div className="font-black text-lg text-black uppercase mb-2">{itemReward.name}</div>
                  <div className="text-sm text-black font-bold mb-3">{itemReward.description}</div>
                  <NBBadge color="yellow" className="px-3 py-1">
                    {itemReward.type === 'consumable' ? 'CONSUMABLE' : 'PASSIVE'} • {itemReward.rarity.toUpperCase()}
                  </NBBadge>
                </div>
              )}

              {/* Continue Button */}
              <NBButton
                onClick={handleContinue}
                variant="success"
                size="xl"
              >
                {hasItemDrop ? 'CLAIM ITEM' : 'CONTINUE'}
              </NBButton>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};