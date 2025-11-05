import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { cardTemplates, rollCardRarity } from '../../data/cards';
import { ITEMS, createItemInstance } from '../../data/items';
import { Card } from '../Cards/Card';
import { PageTransition } from './PageTransition';
import { ShoppingCart, ArrowLeft, Coins, Trash2, Package, Heart, Zap, Users, TrendingUp, CreditCard } from 'lucide-react';

export const Shop = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();

  const [shopOffers, setShopOffers] = useState({ cards: [], items: [] });
  const [purchasedCardIndices, setPurchasedCardIndices] = useState([]);
  const [purchasedItemIndices, setPurchasedItemIndices] = useState([]);
  const cardPrice = 50;
  const cardRemovalRefund = 20;
  const rerollPrice = 50;

  // Permanent upgrade prices
  const healthUpgradePrice = 100;
  const energyUpgradePrice = 150;
  const handSizeUpgradePrice = 120;
  const drawAbilityPrice = 75;
  const discardAbilityPrice = 75;
  const bagSlotPrice = 100;
  const consumableSlotPrice = 100;
  const passiveSlotPrice = 150;

  const generateShopOffers = () => {
    // Generate shop offers
    const cardOffers = [];
    for (let i = 0; i < 3; i++) {
      const rarity = rollCardRarity({ common: 50, rare: 35, epic: 15 });
      const cardsOfRarity = cardTemplates.filter(c => c.rarity === rarity);
      if (cardsOfRarity.length > 0) {
        const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
        cardOffers.push(randomCard);
      }
    }

    const itemOffers = [];
    const shopItems = ITEMS.filter(item => item.price);
    for (let i = 0; i < 3; i++) {
      const randomItem = shopItems[Math.floor(Math.random() * shopItems.length)];
      if (randomItem) {
        itemOffers.push(createItemInstance(randomItem.id));
      }
    }

    setShopOffers({ cards: cardOffers, items: itemOffers });
    setPurchasedCardIndices([]);
    setPurchasedItemIndices([]);
  };

  useEffect(() => {
    generateShopOffers();
  }, []);

  const handleReroll = () => {
    if (gameState.gold < rerollPrice) {
      alert('Not enough gold to reroll!');
      return;
    }

    if (window.confirm(`Reroll shop for ${rerollPrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: rerollPrice });
      generateShopOffers();
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Rerolled shop for ${rerollPrice} gold!` });
    }
  };

  const handleBuyCard = (card, index) => {
    if (gameState.gold < cardPrice) {
      alert('Not enough gold!');
      return;
    }

    if (purchasedCardIndices.includes(index)) {
      alert('Already purchased this card!');
      return;
    }

    if (gameState.unlockedCards?.some(c => c.name === card.name)) {
      alert('You already own this card!');
      return;
    }

    dispatch({ type: 'SPEND_GOLD', amount: cardPrice });
    dispatch({ type: 'UNLOCK_CARD', card });
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Purchased ${card.name} for ${cardPrice} gold!` });
    setPurchasedCardIndices([...purchasedCardIndices, index]);
  };

  const handleRemoveCard = (card) => {
    if (gameState.unlockedCards.length <= 3) {
      alert('You must have at least 3 cards!');
      return;
    }

    if (window.confirm(`Remove ${card.name} from your collection for ${cardRemovalRefund} gold?`)) {
      dispatch({ type: 'REMOVE_UNLOCKED_CARD', cardName: card.name });
      dispatch({ type: 'ADD_GOLD', amount: cardRemovalRefund });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Removed ${card.name} for ${cardRemovalRefund} gold!` });
    }
  };

  const handleBuyItem = (item, index) => {
    if (gameState.gold < item.price) {
      alert('Not enough gold!');
      return;
    }

    if (purchasedItemIndices.includes(index)) {
      alert('Already purchased this item!');
      return;
    }

    const bag = gameState.inventory?.bag || [];
    if (!bag.some(slot => slot === null)) {
      alert('Your bag is full!');
      return;
    }

    dispatch({ type: 'SPEND_GOLD', amount: item.price });
    dispatch({ type: 'ADD_ITEM_TO_BAG', item });
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Purchased ${item.name} for ${item.price} gold!` });
    setPurchasedItemIndices([...purchasedItemIndices, index]);
  };

  const handleSellItem = (item) => {
    const sellPrice = Math.floor(item.price * 0.5);
    
    if (window.confirm(`Sell ${item.name} for ${sellPrice} gold?`)) {
      dispatch({ type: 'REMOVE_ITEM_FROM_BAG', instanceId: item.instanceId });
      dispatch({ type: 'ADD_GOLD', amount: sellPrice });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Sold ${item.name} for ${sellPrice} gold!` });
    }
  };

  // Permanent Upgrades
  const handleBuyHealthUpgrade = () => {
    if (gameState.gold < healthUpgradePrice) {
      alert('Not enough gold!');
      return;
    }

    const purchased = gameState.healthUpgradesPurchased || 0;
    if (purchased >= 5) {
      alert('Maximum health upgrades reached!');
      return;
    }

    if (window.confirm(`Upgrade Max Health by 10 for ${healthUpgradePrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: healthUpgradePrice });
      dispatch({ type: 'UPGRADE_HEALTH', amount: 10 });
      dispatch({ type: 'TRACK_UPGRADE', upgradeType: 'health' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Max Health increased by 10!` });
    }
  };

  const handleBuyEnergyUpgrade = () => {
    if (gameState.gold < energyUpgradePrice) {
      alert('Not enough gold!');
      return;
    }

    const purchased = gameState.energyUpgradesPurchased || 0;
    if (purchased >= 5) {
      alert('Maximum energy upgrades reached!');
      return;
    }

    if (window.confirm(`Upgrade Max Energy by 1 for ${energyUpgradePrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: energyUpgradePrice });
      dispatch({ type: 'UPGRADE_MAX_ENERGY', amount: 1 });
      dispatch({ type: 'TRACK_UPGRADE', upgradeType: 'energy' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Max Energy increased by 1!` });
    }
  };

  const handleBuyHandSizeUpgrade = () => {
    if (gameState.gold < handSizeUpgradePrice) {
      alert('Not enough gold!');
      return;
    }

    const purchased = gameState.handSizeUpgradesPurchased || 0;
    if (purchased >= 5) {
      alert('Maximum hand size upgrades reached!');
      return;
    }

    if (window.confirm(`Upgrade Hand Size by 1 for ${handSizeUpgradePrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: handSizeUpgradePrice });
      dispatch({ type: 'UPGRADE_HAND_SIZE', amount: 1 });
      dispatch({ type: 'TRACK_UPGRADE', upgradeType: 'handSize' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Hand Size increased by 1!` });
    }
  };

  // Boss Abilities
  const handleBuyDrawAbility = () => {
    if (gameState.gold < drawAbilityPrice) {
      alert('Not enough gold!');
      return;
    }

    if (window.confirm(`Unlock Draw Card ability for ${drawAbilityPrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: drawAbilityPrice });
      dispatch({ type: 'PURCHASE_DRAW_ABILITY' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Unlocked Draw Card ability!` });
    }
  };

  const handleBuyDiscardAbility = () => {
    if (gameState.gold < discardAbilityPrice) {
      alert('Not enough gold!');
      return;
    }

    if (window.confirm(`Unlock Discard for Energy ability for ${discardAbilityPrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: discardAbilityPrice });
      dispatch({ type: 'PURCHASE_DISCARD_ABILITY' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Unlocked Discard for Energy ability!` });
    }
  };

  // Inventory Upgrades
  const handleBuyBagSlot = () => {
    if (gameState.gold < bagSlotPrice) {
      alert('Not enough gold!');
      return;
    }

    const currentBagSize = gameState.inventory?.bag?.length || 6;
    if (currentBagSize >= 12) {
      alert('Maximum bag size reached!');
      return;
    }

    if (window.confirm(`Add +1 Bag Slot for ${bagSlotPrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: bagSlotPrice });
      dispatch({ type: 'EXPAND_BAG_SIZE' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Bag size increased!` });
    }
  };

  const handleBuyConsumableSlot = () => {
    if (gameState.gold < consumableSlotPrice) {
      alert('Not enough gold!');
      return;
    }

    const currentConsumableSize = gameState.inventory?.toolBelt?.consumables?.length || 4;
    if (currentConsumableSize >= 8) {
      alert('Maximum consumable slots reached!');
      return;
    }

    if (window.confirm(`Add +1 Consumable Slot for ${consumableSlotPrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: consumableSlotPrice });
      dispatch({ type: 'EXPAND_CONSUMABLE_SIZE' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Consumable slots increased!` });
    }
  };

  const handleBuyPassiveSlot = () => {
    if (gameState.gold < passiveSlotPrice) {
      alert('Not enough gold!');
      return;
    }

    const currentPassiveSize = gameState.inventory?.toolBelt?.passives?.length || 3;
    if (currentPassiveSize >= 6) {
      alert('Maximum passive slots reached!');
      return;
    }

    if (window.confirm(`Add +1 Passive Slot for ${passiveSlotPrice} gold?`)) {
      dispatch({ type: 'SPEND_GOLD', amount: passiveSlotPrice });
      dispatch({ type: 'EXPAND_PASSIVE_SIZE' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Passive slots increased!` });
    }
  };

  const handleLeaveShop = () => {
    navigate('/map');
  };

  const playerItems = gameState.inventory?.bag?.filter(item => item !== null) || [];
  const bossesDefeated = gameState.bossesDefeated || 0;
  const inventoryUnlocked = gameState.inventoryUpgradeUnlocked || false;

  // Current inventory sizes
  const currentBagSize = gameState.inventory?.bag?.length || 6;
  const currentConsumableSize = gameState.inventory?.toolBelt?.consumables?.length || 4;
  const currentPassiveSize = gameState.inventory?.toolBelt?.passives?.length || 3;

  // Track upgrade purchases
  const healthUpgradesPurchased = gameState.healthUpgradesPurchased || 0;
  const energyUpgradesPurchased = gameState.energyUpgradesPurchased || 0;
  const handSizeUpgradesPurchased = gameState.handSizeUpgradesPurchased || 0;
  const maxUpgrades = 5;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-12 h-12 text-amber-600" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Card & Item Shop
                  </h1>
                  <p className="text-gray-600">Buy cards, items, upgrades, and unlock abilities</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Reroll Button */}
                <button
                  onClick={handleReroll}
                  disabled={gameState.gold < rerollPrice}
                  className={`
                    ${gameState.gold >= rerollPrice ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}
                    text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg
                    flex items-center gap-2
                  `}
                >
                  <TrendingUp className="w-5 h-5" />
                  Reroll ({rerollPrice} <Coins className="w-4 h-4 inline" />)
                </button>

                {/* Gold Display */}
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 rounded-lg border-4 border-yellow-300 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-900" />
                    <span className="text-3xl font-bold text-yellow-900">{gameState.gold}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* BUY CARDS Section */}
            <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
                🎴 Buy Cards
                <span className="text-sm font-normal text-gray-600">({cardPrice} gold each)</span>
              </h2>

              <div className="flex flex-col gap-6 items-center">
                {shopOffers.cards.map((card, index) => {
                  const alreadyOwned = gameState.unlockedCards?.some(c => c.name === card.name);
                  const alreadyPurchased = purchasedCardIndices.includes(index);
                  const canAfford = gameState.gold >= cardPrice;

                  return (
                    <div key={index} className="relative">
                      <Card
                        card={card}
                        onClick={() => !alreadyOwned && !alreadyPurchased && canAfford && handleBuyCard(card, index)}
                        disabled={!canAfford || alreadyOwned || alreadyPurchased}
                        compact={true}
                        draggable={false}
                        showCost={false}
                      />

                      {alreadyPurchased && !alreadyOwned && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gray-600 text-white px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 shadow-lg border-2 border-white">
                            ✓ Purchased
                          </div>
                        </div>
                      )}

                      {!alreadyOwned && !alreadyPurchased && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className={`
                            ${canAfford ? 'bg-green-600' : 'bg-red-600'}
                            text-white px-4 py-2 rounded-full font-bold text-lg
                            flex items-center gap-2 shadow-lg border-2 border-white
                          `}>
                            <Coins className="w-5 h-5" />
                            {cardPrice}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUY ITEMS Section */}
            <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
                <Package className="w-6 h-6 text-purple-600" />
                Buy Items
              </h2>

              <div className="space-y-4">
                {shopOffers.items.map((item, index) => {
                  const alreadyPurchased = purchasedItemIndices.includes(index);
                  const canAfford = gameState.gold >= item.price;

                  return (
                    <button
                      key={index}
                      onClick={() => !alreadyPurchased && canAfford && handleBuyItem(item, index)}
                      disabled={!canAfford || alreadyPurchased}
                      className={`
                        w-full bg-gradient-to-r from-purple-500 to-indigo-500
                        p-4 rounded-xl border-4 border-purple-300
                        ${(canAfford && !alreadyPurchased) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                        transition-all shadow-lg flex items-center gap-4
                      `}
                    >
                      <div className="text-5xl">{item.emoji}</div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-bold text-lg">{item.name}</div>
                        <div className="text-purple-100 text-sm">{item.description}</div>
                      </div>
                      <div className={`
                        ${alreadyPurchased ? 'bg-gray-600' : (canAfford ? 'bg-green-500' : 'bg-red-500')}
                        px-4 py-2 rounded-full text-white font-bold
                        flex items-center gap-1
                      `}>
                        {alreadyPurchased ? (
                          <>✓ Purchased</>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            {item.price}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PERMANENT UPGRADES Section */}
          <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl mb-6">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              Permanent Upgrades
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Max Health Upgrade */}
              <button
                onClick={handleBuyHealthUpgrade}
                disabled={gameState.gold < healthUpgradePrice || healthUpgradesPurchased >= maxUpgrades}
                className={`
                  bg-gradient-to-br from-red-500 to-pink-500
                  p-6 rounded-xl border-4 border-red-300
                  ${(gameState.gold >= healthUpgradePrice && healthUpgradesPurchased < maxUpgrades) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  transition-all shadow-lg relative
                `}
              >
                <Heart className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-white font-bold text-xl mb-1">+10 Max HP</div>
                <div className="text-red-100 text-sm mb-3">Permanent health increase</div>
                <div className="text-white text-xs mb-2">({healthUpgradesPurchased}/{maxUpgrades} purchased)</div>
                {healthUpgradesPurchased >= maxUpgrades ? (
                  <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold">
                    ✓ Maxed Out
                  </div>
                ) : (
                  <div className={`
                    ${gameState.gold >= healthUpgradePrice ? 'bg-green-600' : 'bg-gray-600'}
                    px-4 py-2 rounded-full text-white font-bold inline-flex items-center gap-1
                  `}>
                    <Coins className="w-4 h-4" />
                    {healthUpgradePrice}
                  </div>
                )}
              </button>

              {/* Max Energy Upgrade */}
              <button
                onClick={handleBuyEnergyUpgrade}
                disabled={gameState.gold < energyUpgradePrice || energyUpgradesPurchased >= maxUpgrades}
                className={`
                  bg-gradient-to-br from-blue-500 to-cyan-500
                  p-6 rounded-xl border-4 border-blue-300
                  ${(gameState.gold >= energyUpgradePrice && energyUpgradesPurchased < maxUpgrades) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  transition-all shadow-lg relative
                `}
              >
                <Zap className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-white font-bold text-xl mb-1">+1 Max Energy</div>
                <div className="text-blue-100 text-sm mb-3">More energy per turn</div>
                <div className="text-white text-xs mb-2">({energyUpgradesPurchased}/{maxUpgrades} purchased)</div>
                {energyUpgradesPurchased >= maxUpgrades ? (
                  <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold">
                    ✓ Maxed Out
                  </div>
                ) : (
                  <div className={`
                    ${gameState.gold >= energyUpgradePrice ? 'bg-green-600' : 'bg-gray-600'}
                    px-4 py-2 rounded-full text-white font-bold inline-flex items-center gap-1
                  `}>
                    <Coins className="w-4 h-4" />
                    {energyUpgradePrice}
                  </div>
                )}
              </button>

              {/* Hand Size Upgrade */}
              <button
                onClick={handleBuyHandSizeUpgrade}
                disabled={gameState.gold < handSizeUpgradePrice || handSizeUpgradesPurchased >= maxUpgrades}
                className={`
                  bg-gradient-to-br from-purple-500 to-indigo-500
                  p-6 rounded-xl border-4 border-purple-300
                  ${(gameState.gold >= handSizeUpgradePrice && handSizeUpgradesPurchased < maxUpgrades) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  transition-all shadow-lg relative
                `}
              >
                <Users className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-white font-bold text-xl mb-1">+1 Hand Size</div>
                <div className="text-purple-100 text-sm mb-3">Hold more cards</div>
                <div className="text-white text-xs mb-2">({handSizeUpgradesPurchased}/{maxUpgrades} purchased)</div>
                {handSizeUpgradesPurchased >= maxUpgrades ? (
                  <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold">
                    ✓ Maxed Out
                  </div>
                ) : (
                  <div className={`
                    ${gameState.gold >= handSizeUpgradePrice ? 'bg-green-600' : 'bg-gray-600'}
                    px-4 py-2 rounded-full text-white font-bold inline-flex items-center gap-1
                  `}>
                    <Coins className="w-4 h-4" />
                    {handSizeUpgradePrice}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* BOSS ABILITIES Section */}
          <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl mb-6">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
              👑 Boss Abilities
              <span className="text-sm font-normal text-gray-600">(Unlocked by defeating bosses)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Draw Card Ability */}
              <div className={`
                bg-gradient-to-br from-green-500 to-emerald-500
                p-6 rounded-xl border-4 border-green-300
                ${bossesDefeated >= 1 ? '' : 'opacity-50'}
                transition-all shadow-lg relative
              `}>
                {bossesDefeated < 1 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center">
                    <div className="text-white font-bold text-lg">🔒 Defeat Boss 1</div>
                  </div>
                )}
                
                <div className="text-4xl text-center mb-2">🎴</div>
                <div className="text-white font-bold text-xl mb-1 text-center">Draw Card Ability</div>
                <div className="text-green-100 text-sm mb-3 text-center">Draw 1 card for 3 energy</div>
                
                {gameState.hasDrawAbility ? (
                  <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold text-center">
                    ✓ Unlocked
                  </div>
                ) : bossesDefeated >= 1 ? (
                  <button
                    onClick={handleBuyDrawAbility}
                    disabled={gameState.gold < drawAbilityPrice}
                    className={`
                      w-full ${gameState.gold >= drawAbilityPrice ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600'}
                      px-4 py-2 rounded-full text-white font-bold
                      flex items-center justify-center gap-1
                    `}
                  >
                    <Coins className="w-4 h-4" />
                    {drawAbilityPrice}
                  </button>
                ) : null}
              </div>

              {/* Discard Ability */}
              <div className={`
                bg-gradient-to-br from-orange-500 to-red-500
                p-6 rounded-xl border-4 border-orange-300
                ${bossesDefeated >= 2 ? '' : 'opacity-50'}
                transition-all shadow-lg relative
              `}>
                {bossesDefeated < 2 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center">
                    <div className="text-white font-bold text-lg">🔒 Defeat Boss 2</div>
                  </div>
                )}
                
                <div className="text-4xl text-center mb-2">🗑️</div>
                <div className="text-white font-bold text-xl mb-1 text-center">Discard Ability</div>
                <div className="text-orange-100 text-sm mb-3 text-center">Discard for 1 energy</div>
                
                {gameState.hasDiscardAbility ? (
                  <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold text-center">
                    ✓ Unlocked
                  </div>
                ) : bossesDefeated >= 2 ? (
                  <button
                    onClick={handleBuyDiscardAbility}
                    disabled={gameState.gold < discardAbilityPrice}
                    className={`
                      w-full ${gameState.gold >= discardAbilityPrice ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600'}
                      px-4 py-2 rounded-full text-white font-bold
                      flex items-center justify-center gap-1
                    `}
                  >
                    <Coins className="w-4 h-4" />
                    {discardAbilityPrice}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* INVENTORY UPGRADES Section */}
          {inventoryUnlocked && (
            <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl mb-6">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
                <Package className="w-8 h-8 text-indigo-600" />
                Inventory Upgrades
                <span className="text-sm font-normal text-gray-600">(Unlocked at Floor 15)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bag Slot Upgrade */}
                <button
                  onClick={handleBuyBagSlot}
                  disabled={gameState.gold < bagSlotPrice || currentBagSize >= 12}
                  className={`
                    bg-gradient-to-br from-amber-500 to-orange-500
                    p-6 rounded-xl border-4 border-amber-300
                    ${(gameState.gold >= bagSlotPrice && currentBagSize < 12) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                    transition-all shadow-lg relative
                  `}
                >
                  <Package className="w-12 h-12 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-xl mb-1">+1 Bag Slot</div>
                  <div className="text-amber-100 text-sm mb-3">Carry more items</div>
                  <div className="text-white text-xs mb-2">Current: {currentBagSize}/12 slots</div>
                  {currentBagSize >= 12 ? (
                    <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold">
                      ✓ Maxed Out
                    </div>
                  ) : (
                    <div className={`
                      ${gameState.gold >= bagSlotPrice ? 'bg-green-600' : 'bg-gray-600'}
                      px-4 py-2 rounded-full text-white font-bold inline-flex items-center gap-1
                    `}>
                      <Coins className="w-4 h-4" />
                      {bagSlotPrice}
                    </div>
                  )}
                </button>

                {/* Consumable Slot Upgrade */}
                <button
                  onClick={handleBuyConsumableSlot}
                  disabled={gameState.gold < consumableSlotPrice || currentConsumableSize >= 8}
                  className={`
                    bg-gradient-to-br from-green-500 to-emerald-500
                    p-6 rounded-xl border-4 border-green-300
                    ${(gameState.gold >= consumableSlotPrice && currentConsumableSize < 8) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                    transition-all shadow-lg relative
                  `}
                >
                  <Heart className="w-12 h-12 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-xl mb-1">+1 Consumable Slot</div>
                  <div className="text-green-100 text-sm mb-3">Use more consumables</div>
                  <div className="text-white text-xs mb-2">Current: {currentConsumableSize}/8 slots</div>
                  {currentConsumableSize >= 8 ? (
                    <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold">
                      ✓ Maxed Out
                    </div>
                  ) : (
                    <div className={`
                      ${gameState.gold >= consumableSlotPrice ? 'bg-green-600' : 'bg-gray-600'}
                      px-4 py-2 rounded-full text-white font-bold inline-flex items-center gap-1
                    `}>
                      <Coins className="w-4 h-4" />
                      {consumableSlotPrice}
                    </div>
                  )}
                </button>

                {/* Passive Slot Upgrade */}
                <button
                  onClick={handleBuyPassiveSlot}
                  disabled={gameState.gold < passiveSlotPrice || currentPassiveSize >= 6}
                  className={`
                    bg-gradient-to-br from-purple-500 to-indigo-500
                    p-6 rounded-xl border-4 border-purple-300
                    ${(gameState.gold >= passiveSlotPrice && currentPassiveSize < 6) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                    transition-all shadow-lg relative
                  `}
                >
                  <Zap className="w-12 h-12 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-xl mb-1">+1 Passive Slot</div>
                  <div className="text-purple-100 text-sm mb-3">Equip more passives</div>
                  <div className="text-white text-xs mb-2">Current: {currentPassiveSize}/6 slots</div>
                  {currentPassiveSize >= 6 ? (
                    <div className="bg-gray-700 px-4 py-2 rounded-full text-white font-bold">
                      ✓ Maxed Out
                    </div>
                  ) : (
                    <div className={`
                      ${gameState.gold >= passiveSlotPrice ? 'bg-green-600' : 'bg-gray-600'}
                      px-4 py-2 rounded-full text-white font-bold inline-flex items-center gap-1
                    `}>
                      <Coins className="w-4 h-4" />
                      {passiveSlotPrice}
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* REMOVE CARDS Section */}
            <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600" />
                Remove Cards
                <span className="text-sm font-normal text-gray-600">({cardRemovalRefund} gold each)</span>
              </h2>

              {gameState.unlockedCards && gameState.unlockedCards.length > 3 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gameState.unlockedCards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => handleRemoveCard(card)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-lg border-2 border-red-300 hover:scale-105 transition-all shadow-lg flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-white" />
                        <div className="text-left">
                          <div className="text-white font-bold">{card.name}</div>
                          <div className="text-red-100 text-sm">{card.description}</div>
                        </div>
                      </div>
                      <div className="bg-green-500 px-3 py-1 rounded-full text-white font-bold text-sm flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        +{cardRemovalRefund}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You need at least 3 cards!</p>
                </div>
              )}
            </div>

            {/* SELL ITEMS Section */}
            <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
                <Coins className="w-6 h-6 text-green-600" />
                Sell Items
                <span className="text-sm font-normal text-gray-600">(50% refund)</span>
              </h2>

              {playerItems.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {playerItems.map((item, index) => {
                    const sellPrice = Math.floor(item.price * 0.5);

                    return (
                      <button
                        key={index}
                        onClick={() => handleSellItem(item)}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-lg border-2 border-green-300 hover:scale-105 transition-all shadow-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{item.emoji}</div>
                          <div className="text-left">
                            <div className="text-white font-bold">{item.name}</div>
                            <div className="text-green-100 text-sm">{item.description}</div>
                          </div>
                        </div>
                        <div className="bg-yellow-500 px-3 py-1 rounded-full text-black font-bold text-sm flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          +{sellPrice}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Your inventory is empty!</p>
                </div>
              )}
            </div>
          </div>

          {/* Leave Button */}
          <div className="text-center">
            <button
              onClick={handleLeaveShop}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-6 h-6" />
              Leave Shop
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};