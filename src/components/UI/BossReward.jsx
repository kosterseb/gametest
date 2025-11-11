import React, { useState, useEffect } from 'react';
import { Trophy, Heart, Zap, Plus, Coins, Hand, Trash2, Package } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { getRandomItemReward, createItemInstance } from '../../data/items';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';

const BOSS_REWARDS = [
  {
    id: 'boss_health',
    name: 'Greater Vitality',
    description: '+30 Max Health',
    icon: Heart,
    color: 'nb-bg-red',
    effect: (dispatch) => {
      dispatch({ type: 'UPGRADE_HEALTH', amount: 30 });
    }
  },
  {
    id: 'boss_energy',
    name: 'Energy Mastery',
    description: '+3 Max Energy',
    icon: Zap,
    color: 'nb-bg-blue',
    effect: (dispatch) => {
      dispatch({ type: 'UPGRADE_MAX_ENERGY', amount: 3 });
    }
  },
  {
    id: 'boss_hand',
    name: 'Strategic Mind',
    description: '+1 Hand Size',
    icon: Plus,
    color: 'nb-bg-purple',
    effect: (dispatch) => {
      dispatch({ type: 'UPGRADE_HAND_SIZE', amount: 1 });
    }
  },
  {
    id: 'boss_gold',
    name: 'Treasure Hoard',
    description: '+50 Gold',
    icon: Coins,
    color: 'nb-bg-yellow',
    effect: (dispatch) => {
      dispatch({ type: 'ADD_GOLD', amount: 50 });
    }
  },
  {
    id: 'boss_heal',
    name: 'Full Restoration',
    description: 'Full Heal',
    icon: Heart,
    color: 'nb-bg-green',
    effect: (dispatch, gameState) => {
      dispatch({ type: 'HEAL_PLAYER', amount: gameState.maxPlayerHealth });
    }
  }
];

export const BossReward = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [rewardOptions, setRewardOptions] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showAbilityUnlock, setShowAbilityUnlock] = useState(false);
  const [unlockedAbility, setUnlockedAbility] = useState(null);

  useEffect(() => {
    // Stat rewards (choose 1 of 3)
    const shuffled = [...BOSS_REWARDS].sort(() => Math.random() - 0.5);
    setRewardOptions(shuffled.slice(0, 3));

    // Generate 3 items and add to pending rewards
    const items = [];
    for (let i = 0; i < 3; i++) {
      const item = getRandomItemReward();
      const itemInstance = createItemInstance(item.id);
      items.push(itemInstance);
    }
    
    // Set item rewards to be shown in UnifiedRewardScreen
    dispatch({ type: 'SET_ITEM_REWARD', items });
    console.log('Boss dropped 3 item choices (will show in UnifiedRewardScreen):', items.map(i => `${i.name} (${i.rarity})`));
  }, [dispatch]);

  const handleSelectStatReward = (reward) => {
    if (!selectedReward) {
      setSelectedReward(reward);
      
      reward.effect(dispatch, gameState);
      
      dispatch({ 
        type: 'ADD_BATTLE_LOG', 
        message: `Claimed: ${reward.name}!` 
      });

      const currentFloor = gameState.currentFloor;
      
      console.log('Boss defeated! Current floor:', currentFloor);
      
      // Floor 5 boss (Act 1) - currentFloor is now 6
      if (currentFloor === 6 && !gameState.drawAbilityUnlocked) {
        console.log('Unlocking Draw Mastery!');
        setTimeout(() => {
          dispatch({ type: 'UNLOCK_DRAW_SHOP' });
          setUnlockedAbility({
            name: 'Draw Mastery',
            icon: Hand,
            description: 'Draw a card ability now available in shops!'
          });
          setShowAbilityUnlock(true);
        }, 500);
        
        setTimeout(() => {
          setShowAbilityUnlock(false);
          navigateToNextScreen();
        }, 4000);
        return;
      }
      
      // Floor 10 boss (Act 2) - currentFloor is now 11
      if (currentFloor === 11 && !gameState.discardAbilityUnlocked) {
        console.log('Unlocking Discard Tactics!');
        setTimeout(() => {
          dispatch({ type: 'UNLOCK_DISCARD_SHOP' });
          setUnlockedAbility({
            name: 'Discard Tactics',
            icon: Trash2,
            description: 'Discard for energy ability now available in shops!'
          });
          setShowAbilityUnlock(true);
        }, 500);
        
        setTimeout(() => {
          setShowAbilityUnlock(false);
          navigateToNextScreen();
        }, 4000);
        return;
      }

      // Floor 15 boss (Act 3) - currentFloor is now 16
      if (currentFloor === 16 && !gameState.inventoryUpgradeUnlocked) {
        console.log('Unlocking Inventory Upgrades!');
        setTimeout(() => {
          dispatch({ type: 'UNLOCK_INVENTORY_SHOP' });
          setUnlockedAbility({
            name: 'Inventory Upgrades',
            icon: Package,
            description: 'Bag, consumable, and passive upgrades now available in shops!'
          });
          setShowAbilityUnlock(true);
        }, 500);
        
        setTimeout(() => {
          setShowAbilityUnlock(false);
          navigateToNextScreen();
        }, 4000);
        return;
      }

      // Normal flow
      setTimeout(() => {
        navigateToNextScreen();
      }, 1500);
    }
  };

  const navigateToNextScreen = () => {
    console.log('BossReward - Navigating to UnifiedRewardScreen...');
    console.log('BossReward - shouldShowCardReward:', gameState.shouldShowCardReward);
    console.log('BossReward - shouldShowItemReward:', gameState.shouldShowItemReward);
    
    // Always navigate to reward screen (handles both cards and items)
    navigate('/reward');
  };

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-purple flex items-center justify-center p-8">
        <div className="max-w-6xl mx-auto">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="nb-bg-yellow nb-border-xl nb-shadow-lg p-8 mb-6 inline-block animate-pulse">
                <Trophy className="w-20 h-20 text-black mx-auto" />
              </div>
              <NBHeading level={1} className="text-black mb-6">
                BOSS DEFEATED!
              </NBHeading>
              <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-3 inline-block">
                <p className="text-black font-bold text-sm uppercase">
                  Choose your stat upgrade
                </p>
              </div>
            </div>

            {showAbilityUnlock && unlockedAbility && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-8">
                <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-8 text-center max-w-md animate-pulse">
                  <div className="flex justify-center mb-6">
                    <unlockedAbility.icon className="w-20 h-20 text-black" />
                  </div>
                  <NBHeading level={2} className="text-black mb-6">
                    🎉 NEW ABILITY UNLOCKED! 🎉
                  </NBHeading>
                  <NBHeading level={3} className="text-black mb-4">
                    {unlockedAbility.name}
                  </NBHeading>
                  <p className="text-lg text-black font-bold mb-6">
                    {unlockedAbility.description}
                  </p>
                  <div className="nb-bg-yellow nb-border-lg nb-shadow px-4 py-2 inline-block">
                    <p className="text-sm text-black font-bold uppercase">
                      Visit the shop to purchase this powerful ability!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stat Rewards Section */}
            {!selectedReward ? (
              <div className="mb-8">
                <div className="text-center mb-6">
                  <NBHeading level={2} className="text-black">⚡ CHOOSE A STAT UPGRADE</NBHeading>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rewardOptions.map((reward) => {
                    const Icon = reward.icon;

                    return (
                      <button
                        key={reward.id}
                        onClick={() => handleSelectStatReward(reward)}
                        className={`
                          ${reward.color}
                          nb-border-xl nb-shadow-lg nb-hover
                          p-8 cursor-pointer transition-all duration-200
                        `}
                      >
                        <div className="flex justify-center mb-4">
                          <Icon className="w-16 h-16 text-black" />
                        </div>

                        <h3 className="text-2xl font-black text-black mb-3 uppercase">{reward.name}</h3>
                        <p className="text-lg text-black font-bold">{reward.description}</p>

                        <div className="mt-4">
                          <NBBadge color="green" className="px-4 py-2 text-sm">
                            FREE
                          </NBBadge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="nb-bg-green nb-border-xl nb-shadow-lg p-6 mb-4 inline-block">
                  <NBHeading level={3} className="text-black">
                    ✓ {selectedReward.name} CLAIMED!
                  </NBHeading>
                </div>
                <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-3 inline-block">
                  <p className="text-black font-bold text-sm uppercase">
                    {showAbilityUnlock ? 'New ability unlocked!' : 'Proceeding to item selection...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};