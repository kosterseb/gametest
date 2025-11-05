import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { getCardRewardOptions } from '../../data/cards';
import { ITEM_RARITY_CONFIG } from '../../data/items';
import { PageTransition } from './PageTransition';
import { Card } from '../Cards/Card';
import { Trophy, Package, AlertCircle, Check, X } from 'lucide-react';

export const UnifiedRewardScreen = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  
  // Card rewards
  const [cardOptions, setCardOptions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [hasChosenCard, setHasChosenCard] = useState(false);
  
  // Item rewards
  const [itemRewards, setItemRewards] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimedItems, setClaimedItems] = useState([]);
  const [showBagFullWarning, setShowBagFullWarning] = useState(false);
  const [isBossItemReward, setIsBossItemReward] = useState(false);
  
  const hasCardRewards = gameState.shouldShowCardReward;
  const hasItemRewards = gameState.shouldShowItemReward && (gameState.pendingItemRewards?.length || 0) > 0;

  // Initialize rewards
  useEffect(() => {
    if (hasCardRewards) {
      const rarityWeights = gameState.cardRewardRarity || { common: 60, rare: 30, epic: 10 };
      const options = getCardRewardOptions(3, rarityWeights);
      setCardOptions(options);
    }
    
    if (hasItemRewards) {
      setItemRewards(gameState.pendingItemRewards || []);

      if ((gameState.pendingItemRewards?.length || 0) === 3 && gameState.currentEnemyData?.isBoss) {
        setIsBossItemReward(true);
      } else {
        setIsBossItemReward(false);
      }
    }
  }, [hasCardRewards, hasItemRewards, gameState.cardRewardRarity, gameState.pendingItemRewards, gameState.currentEnemyData]);

  const checkBagSpace = () => {
    const bag = gameState.inventory?.bag || [];
    return bag.some(slot => slot === null);
  };

  const handleSelectCard = (card) => {
    if (hasChosenCard) return;
    
    setSelectedCard(card);
    setHasChosenCard(true);
    
    dispatch({ type: 'UNLOCK_CARD', card });
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Unlocked new card: ${card.name}!` });
  };

  const handleSkipCards = () => {
    if (hasChosenCard) return;
    setHasChosenCard(true);
    dispatch({ type: 'ADD_BATTLE_LOG', message: 'Skipped card rewards.' });
  };

  const handleSelectBossItem = (item) => {
    if (selectedItem) return;
    setSelectedItem(item);
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Selected item: ${item.name}!` });
  };

  const handleClaimBossItem = () => {
    if (!selectedItem) return;
    
    if (!checkBagSpace()) {
      setShowBagFullWarning(true);
      return;
    }
    
    dispatch({ type: 'ADD_ITEM_TO_BAG', item: selectedItem });
    setClaimedItems([selectedItem.instanceId]);
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Claimed item: ${selectedItem.name}!` });
  };

  const handleClaimItem = (item) => {
    if (claimedItems.includes(item.instanceId)) return;
    
    if (!checkBagSpace()) {
      setShowBagFullWarning(true);
      return;
    }
    
    dispatch({ type: 'ADD_ITEM_TO_BAG', item });
    setClaimedItems([...claimedItems, item.instanceId]);
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Claimed item: ${item.name}!` });
  };

  const handleManageInventory = () => {
    dispatch({ type: 'OPEN_MENU', tab: 'inventory' });
  };

  const handleContinue = () => {
    if (isBossItemReward) {
      if (!claimedItems.includes(selectedItem?.instanceId)) {
        alert('Please claim your selected item before continuing!');
        return;
      }
    } else {
      const allItemsClaimed = itemRewards.every(item => claimedItems.includes(item.instanceId));
      if (hasItemRewards && !allItemsClaimed) {
        alert('Please claim all items before continuing!');
        return;
      }
    }
    
    if (hasCardRewards) {
      dispatch({ type: 'CLEAR_CARD_REWARD' });
    }
    if (hasItemRewards) {
      dispatch({ type: 'CLEAR_ITEM_REWARD' });
    }
    
    navigate('/map');
  };

  const canContinue = () => {
    const cardsDone = !hasCardRewards || hasChosenCard;
    
    let itemsDone = false;
    if (isBossItemReward) {
      itemsDone = !hasItemRewards || (selectedItem && claimedItems.includes(selectedItem.instanceId));
    } else {
      itemsDone = !hasItemRewards || itemRewards.every(item => claimedItems.includes(item.instanceId));
    }
    
    return cardsDone && itemsDone;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Victory Rewards!
              </h1>
              <p className="text-lg text-gray-600">
                {hasCardRewards && hasItemRewards 
                  ? isBossItemReward 
                    ? 'Choose a card and select an item!'
                    : 'Choose a card and claim your items!'
                  : hasCardRewards 
                  ? 'Choose one card to add to your collection'
                  : isBossItemReward
                  ? 'Choose one item to claim!'
                  : 'Claim your item rewards!'}
              </p>
            </div>

            {/* Bag Full Warning */}
            {showBagFullWarning && (
              <div className="mb-6 bg-orange-100 border-2 border-orange-500 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-orange-800">Bag is Full!</h4>
                    <p className="text-sm text-orange-700">
                      Make room in your inventory to claim items.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManageInventory}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all w-full"
                >
                  Manage Inventory
                </button>
              </div>
            )}

            {/* CARD REWARDS Section */}
            {hasCardRewards && !hasChosenCard && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">🎴 Choose a Card</h2>
                <div className="flex justify-center gap-6 mb-4 flex-wrap">
                  {cardOptions.map((card, index) => {
                    const alreadyOwned = gameState.unlockedCards?.some(c => c.name === card.name);

                    return (
                      <div key={index} className="relative">
                        <Card
                          card={card}
                          onClick={() => !alreadyOwned && handleSelectCard(card)}
                          disabled={alreadyOwned}
                          compact={true}
                          draggable={false}
                          showCost={false}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Skip Cards Button */}
                <div className="text-center">
                  <button
                    onClick={handleSkipCards}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <X className="w-5 h-5" />
                    Skip Card Rewards
                  </button>
                </div>
              </div>
            )}

            {/* Card Chosen Confirmation */}
            {hasCardRewards && hasChosenCard && selectedCard && (
              <div className="mb-8 bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-green-800 mb-1">
                  Card Added: {selectedCard.name}
                </h3>
                <p className="text-sm text-green-700">Check your deck in the menu!</p>
              </div>
            )}

            {/* BOSS ITEM REWARDS */}
            {hasItemRewards && isBossItemReward && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Package className="w-8 h-8 text-purple-600" />
                  Choose One Item
                </h2>
                
                {!selectedItem && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {itemRewards.map((item) => {
                      const rarityConfig = ITEM_RARITY_CONFIG[item.rarity];
                      return (
                        <button
                          key={item.instanceId}
                          onClick={() => handleSelectBossItem(item)}
                          className={`
                            ${rarityConfig.bgColor} ${rarityConfig.borderColor}
                            cursor-pointer transform hover:scale-105
                            border-4 p-6 rounded-xl transition-all duration-300
                            ${rarityConfig.glowColor} shadow-xl
                          `}
                        >
                          <div className={`absolute top-2 left-2 ${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 px-3 py-1 rounded-full text-xs font-bold ${rarityConfig.color}`}>
                            {rarityConfig.name}
                          </div>
                          <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full font-bold text-white ${item.type === 'consumable' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                            {item.type === 'consumable' ? 'CONSUMABLE' : 'PASSIVE'}
                          </div>
                          <div className="text-center">
                            <div className="text-6xl mb-3">{item.emoji}</div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-700">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedItem && !claimedItems.includes(selectedItem.instanceId) && (
                  <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-purple-800 mb-4 text-center">Selected Item:</h3>
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <div className="text-6xl">{selectedItem.emoji}</div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-gray-800">{selectedItem.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{selectedItem.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleClaimBossItem}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all"
                    >
                      Claim Item
                    </button>
                  </div>
                )}

                {selectedItem && claimedItems.includes(selectedItem.instanceId) && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                    <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-800">Item Claimed: {selectedItem.name}</h3>
                  </div>
                )}
              </div>
            )}

            {/* REGULAR ITEM REWARDS */}
            {hasItemRewards && !isBossItemReward && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Package className="w-8 h-8 text-purple-600" />
                  Claim Your Items
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemRewards.map((item) => {
                    const rarityConfig = ITEM_RARITY_CONFIG[item.rarity];
                    const isClaimed = claimedItems.includes(item.instanceId);

                    return (
                      <button
                        key={item.instanceId}
                        onClick={() => !isClaimed && handleClaimItem(item)}
                        disabled={isClaimed}
                        className={`
                          ${rarityConfig.bgColor} ${rarityConfig.borderColor}
                          ${isClaimed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transform hover:scale-105'}
                          border-4 p-6 rounded-xl transition-all duration-300 ${rarityConfig.glowColor} shadow-xl relative
                        `}
                      >
                        {isClaimed && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" /> CLAIMED
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-6xl mb-3">{item.emoji}</div>
                          <h3 className="text-xl font-bold mb-2 text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                          {!isClaimed && (
                            <div className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
                              CLICK TO CLAIM
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue Button */}
            {canContinue() && (
              <div className="text-center">
                <button
                  onClick={handleContinue}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
                >
                  Continue to Map
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};