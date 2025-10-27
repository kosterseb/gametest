import React, { useState, useEffect } from 'react';
import { Trophy, Heart, Zap, Plus, Coins, Hand, Trash2, Package } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { getRandomItemReward, createItemInstance } from '../../data/items';

const BOSS_REWARDS = [
  {
    id: 'boss_health',
    name: 'Greater Vitality',
    description: '+30 Max Health',
    icon: Heart,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    effect: (dispatch) => {
      dispatch({ type: 'UPGRADE_HEALTH', amount: 30 });
    }
  },
  {
    id: 'boss_energy',
    name: 'Energy Mastery',
    description: '+3 Max Energy',
    icon: Zap,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    effect: (dispatch) => {
      dispatch({ type: 'UPGRADE_MAX_ENERGY', amount: 3 });
    }
  },
  {
    id: 'boss_hand',
    name: 'Strategic Mind',
    description: '+1 Hand Size',
    icon: Plus,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    effect: (dispatch) => {
      dispatch({ type: 'UPGRADE_HAND_SIZE', amount: 1 });
    }
  },
  {
    id: 'boss_gold',
    name: 'Treasure Hoard',
    description: '+50 Gold',
    icon: Coins,
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-700',
    effect: (dispatch) => {
      dispatch({ type: 'ADD_GOLD', amount: 50 });
    }
  },
  {
    id: 'boss_heal',
    name: 'Full Restoration',
    description: 'Full Heal',
    icon: Heart,
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white bg-opacity-95 p-8 rounded-xl">
            <div className="text-center mb-8">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-pulse" />
              <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
                BOSS DEFEATED!
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Choose your stat upgrade
              </p>
            </div>

            {showAbilityUnlock && unlockedAbility && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-xl text-center max-w-md transform scale-100 animate-pulse border-4 border-yellow-400">
                  <div className="flex justify-center mb-4">
                    <unlockedAbility.icon className="w-20 h-20 text-yellow-300" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    🎉 NEW ABILITY UNLOCKED! 🎉
                  </h2>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-3">
                    {unlockedAbility.name}
                  </h3>
                  <p className="text-lg text-white opacity-90">
                    {unlockedAbility.description}
                  </p>
                  <div className="mt-6 text-sm text-yellow-200">
                    Visit the shop to purchase this powerful ability!
                  </div>
                </div>
              </div>
            )}

            {/* Stat Rewards Section */}
            {!selectedReward ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">⚡ Choose a Stat Upgrade</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rewardOptions.map((reward) => {
                    const Icon = reward.icon;
                    
                    return (
                      <button
                        key={reward.id}
                        onClick={() => handleSelectStatReward(reward)}
                        className={`
                          ${reward.color} ${reward.hoverColor}
                          text-white p-8 rounded-lg border-4 border-yellow-400
                          transition-all duration-200 transform hover:scale-105
                          cursor-pointer shadow-2xl
                        `}
                      >
                        <div className="flex justify-center mb-4">
                          <Icon className="w-16 h-16" />
                        </div>

                        <h3 className="text-2xl font-bold mb-3">{reward.name}</h3>
                        <p className="text-lg opacity-90">{reward.description}</p>

                        <div className="mt-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block">
                          FREE
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ✓ {selectedReward.name} Claimed!
                </div>
                <p className="text-gray-600">
                  {showAbilityUnlock ? 'New ability unlocked!' : 'Proceeding to item selection...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};