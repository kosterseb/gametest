import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { getCardRewardOptions } from '../../data/cards';
import { ITEM_RARITY_CONFIG } from '../../data/items';
import { PageTransition } from './PageTransition';
import { Card } from '../Cards/Card';
import { Trophy, Package, AlertCircle, Check, X, Coins, Star } from 'lucide-react';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';
import { ActCompletionPopup } from './ActCompletionPopup';

// Count-up animation component
const CountUp = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = percentage * (2 - percentage);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuad);

      setCount(currentCount);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export const UnifiedRewardScreen = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();

  // Animation state
  const [showRewards, setShowRewards] = useState(false);

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
  const [showActCompletion, setShowActCompletion] = useState(false);

  const hasCardRewards = gameState.shouldShowCardReward;
  const hasItemRewards = gameState.shouldShowItemReward && (gameState.pendingItemRewards?.length || 0) > 0;
  const isBossVictory = gameState.currentEnemyData?.isBoss;

  // Get last battle rewards
  const lastBattleGold = gameState.lastBattleRewards?.gold || 0;
  const lastBattleExp = gameState.lastBattleRewards?.exp || 0;

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRewards(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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

    // If boss was defeated, show act completion popup (don't interrupt with tutorials)
    if (isBossVictory) {
      setShowActCompletion(true);
      return;
    }

    // ONLY show tutorials after regular battles (not boss fights)
    // Check if we should show tutorial for notifications
    const hasAnyNotifications =
      gameState.menuNotifications.deck ||
      gameState.menuNotifications.inventory ||
      gameState.menuNotifications.talents ||
      gameState.menuNotifications.stats;

    // If player just leveled up and hasn't seen level up tutorial
    const justLeveledUp = gameState.menuNotifications.stats || gameState.menuNotifications.talents;
    if (justLeveledUp && !gameState.levelUpTutorialShown) {
      console.log('📚 Triggering level up tutorial dialogue');
      navigate('/dialogue', { scene: 'stijn_level_up_encouragement' });
      return;
    }

    // If player got any notification and hasn't seen notification tutorial
    if (hasAnyNotifications && !gameState.notificationTutorialShown) {
      console.log('📚 Triggering notification tutorial dialogue');
      navigate('/dialogue', { scene: 'stijn_notification_tutorial' });
      return;
    }

    // Check for floor-specific dialogues (only in Act 1)
    if (gameState.currentAct === 1) {
      const currentFloor = gameState.currentFloor;

      // Floor 2 encouragement dialogue
      if (currentFloor === 2 && !gameState.floor2DialogueShown) {
        console.log('💬 Triggering floor 2 dialogue');
        navigate('/dialogue', { scene: 'stijn_floor_2_encouragement' });
        return;
      }

      // Floor 3 surprise dialogue (when surprise node appears)
      if (currentFloor === 3 && !gameState.floor3DialogueShown) {
        console.log('💬 Triggering floor 3 surprise dialogue');
        navigate('/dialogue', { scene: 'stijn_floor_3_surprise' });
        return;
      }
    }

    // Regular battle complete - return to map
    dispatch({ type: 'SHOW_BATTLE_RECAP' });
    navigate('/map');
  };

  const handleActContinue = () => {
    // Complete the boss floor and move to next act
    dispatch({ type: 'COMPLETE_BOSS_FLOOR' });
    setShowActCompletion(false);
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
      <div className="min-h-screen nb-bg-purple p-8 flex items-center justify-center">
          <div className={`max-w-6xl mx-auto w-full relative z-10 transition-all duration-700 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Gold & Experience Display */}
          <div className={`grid grid-cols-2 gap-6 mb-8 transition-all duration-500 delay-200 ${showRewards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Gold Reward */}
            <div className="nb-bg-yellow nb-border-xl nb-shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative z-10 text-center">
                <Coins className="w-16 h-16 text-black mx-auto mb-3 drop-shadow-lg" />
                <div className="text-black font-black text-sm uppercase mb-2">Gold Earned</div>
                <div className="text-6xl font-black text-black drop-shadow-lg">
                  {showRewards && <CountUp end={lastBattleGold} duration={2000} />}
                </div>
              </div>
            </div>

            {/* Experience Reward */}
            <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative z-10 text-center">
                <Star className="w-16 h-16 text-black mx-auto mb-3 drop-shadow-lg" />
                <div className="text-black font-black text-sm uppercase mb-2">Experience</div>
                <div className="text-6xl font-black text-black drop-shadow-lg">
                  {showRewards && <CountUp end={lastBattleExp} duration={2000} suffix=" XP" />}
                </div>
              </div>
            </div>
          </div>

          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="nb-bg-yellow nb-border-xl nb-shadow-lg p-6 mb-6 inline-block animate-pulse">
                <Trophy className="w-16 h-16 text-black mx-auto" />
              </div>
              <NBHeading level={1} className="text-black mb-4">
                VICTORY REWARDS!
              </NBHeading>
              <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-3 inline-block">
                <p className="text-black font-bold text-sm uppercase">
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
            </div>

            {/* Bag Full Warning */}
            {showBagFullWarning && (
              <div className="mb-6 nb-bg-orange nb-border-xl nb-shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-black flex-shrink-0" />
                  <div>
                    <NBHeading level={3} className="text-black mb-2">BAG IS FULL!</NBHeading>
                    <p className="text-sm text-black font-bold uppercase">
                      Make room in your inventory to claim items.
                    </p>
                  </div>
                </div>
                <NBButton
                  onClick={handleManageInventory}
                  variant="white"
                  size="lg"
                  className="w-full"
                >
                  MANAGE INVENTORY
                </NBButton>
              </div>
            )}

            {/* CARD REWARDS Section */}
            {hasCardRewards && !hasChosenCard && (
              <div className="mb-8">
                <div className="text-center mb-6">
                  <NBHeading level={2} className="text-black">🎴 CHOOSE A CARD</NBHeading>
                </div>
                <div className="flex justify-center gap-6 mb-6 flex-wrap">
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
                  <NBButton
                    onClick={handleSkipCards}
                    variant="white"
                    size="md"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <X className="w-5 h-5" />
                    <span>SKIP CARD REWARDS</span>
                  </NBButton>
                </div>
              </div>
            )}

            {/* Card Chosen Confirmation */}
            {hasCardRewards && hasChosenCard && selectedCard && (
              <div className="mb-8 nb-bg-green nb-border-xl nb-shadow-lg p-6 text-center">
                <Check className="w-12 h-12 text-black mx-auto mb-3" />
                <NBHeading level={3} className="text-black mb-2">
                  CARD ADDED: {selectedCard.name}
                </NBHeading>
                <p className="text-sm text-black font-bold uppercase">Check your deck in the menu!</p>
              </div>
            )}

            {/* BOSS ITEM REWARDS */}
            {hasItemRewards && isBossItemReward && (
              <div className="mb-8">
                <div className="text-center mb-6 flex items-center justify-center gap-3">
                  <Package className="w-8 h-8 text-black" />
                  <NBHeading level={2} className="text-black">CHOOSE ONE ITEM</NBHeading>
                </div>

                {!selectedItem && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {itemRewards.map((item) => {
                      const rarityConfig = ITEM_RARITY_CONFIG[item.rarity];
                      return (
                        <button
                          key={item.instanceId}
                          onClick={() => handleSelectBossItem(item)}
                          className={`
                            ${rarityConfig.bgColor}
                            nb-border-xl nb-shadow-lg nb-hover
                            cursor-pointer
                            p-6 transition-all duration-300 relative
                          `}
                        >
                          <div className={`absolute top-2 left-2 ${rarityConfig.bgColor} nb-border nb-shadow px-3 py-1 text-xs font-black uppercase text-black`}>
                            {rarityConfig.name}
                          </div>
                          <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 font-black uppercase nb-border nb-shadow ${item.type === 'consumable' ? 'nb-bg-blue' : 'nb-bg-purple'} text-black`}>
                            {item.type === 'consumable' ? 'CONSUMABLE' : 'PASSIVE'}
                          </div>
                          <div className="text-center">
                            <div className="text-6xl mb-3">{item.emoji}</div>
                            <h3 className="text-xl font-black mb-2 text-black uppercase">{item.name}</h3>
                            <p className="text-sm text-black font-bold">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedItem && !claimedItems.includes(selectedItem.instanceId) && (
                  <div className="nb-bg-purple nb-border-xl nb-shadow-lg p-6">
                    <NBHeading level={3} className="text-black mb-4 text-center">SELECTED ITEM:</NBHeading>
                    <div className="flex items-center justify-center gap-6 mb-6">
                      <div className="text-6xl">{selectedItem.emoji}</div>
                      <div className="text-left">
                        <div className="text-2xl font-black text-black uppercase">{selectedItem.name}</div>
                        <div className="text-sm text-black font-bold mb-2">{selectedItem.description}</div>
                      </div>
                    </div>
                    <NBButton
                      onClick={handleClaimBossItem}
                      variant="success"
                      size="lg"
                      className="w-full"
                    >
                      CLAIM ITEM
                    </NBButton>
                  </div>
                )}

                {selectedItem && claimedItems.includes(selectedItem.instanceId) && (
                  <div className="nb-bg-green nb-border-xl nb-shadow-lg p-6 text-center">
                    <Check className="w-12 h-12 text-black mx-auto mb-3" />
                    <NBHeading level={3} className="text-black">ITEM CLAIMED: {selectedItem.name}</NBHeading>
                  </div>
                )}
              </div>
            )}

            {/* REGULAR ITEM REWARDS */}
            {hasItemRewards && !isBossItemReward && (
              <div className="mb-8">
                <div className="text-center mb-6 flex items-center justify-center gap-3">
                  <Package className="w-8 h-8 text-black" />
                  <NBHeading level={2} className="text-black">CLAIM YOUR ITEMS</NBHeading>
                </div>
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
                          ${rarityConfig.bgColor}
                          ${isClaimed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer nb-hover'}
                          nb-border-xl nb-shadow-lg p-6 transition-all duration-300 relative
                        `}
                      >
                        {isClaimed && (
                          <div className="absolute top-2 right-2 nb-bg-green nb-border nb-shadow px-3 py-1 text-xs font-black text-black flex items-center gap-1 uppercase">
                            <Check className="w-4 h-4" /> CLAIMED
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-6xl mb-3">{item.emoji}</div>
                          <h3 className="text-xl font-black mb-2 text-black uppercase">{item.name}</h3>
                          <p className="text-sm text-black font-bold mb-2">{item.description}</p>
                          {!isClaimed && (
                            <div className="mt-3 nb-bg-green nb-border nb-shadow px-4 py-2 font-black text-black uppercase">
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
                <NBButton
                  onClick={handleContinue}
                  variant="success"
                  size="xl"
                >
                  CONTINUE TO MAP
                </NBButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Act Completion Popup */}
      {showActCompletion && (
        <ActCompletionPopup
          actNumber={gameState.currentAct}
          onContinue={handleActContinue}
        />
      )}
    </PageTransition>
  );
};