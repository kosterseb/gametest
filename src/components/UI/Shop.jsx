import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { ITEMS, createItemInstance } from '../../data/items';
import { PageTransition } from './PageTransition';
import { ShoppingCart, ArrowLeft, Coins, Trash2, Package, Heart, Zap, Users, TrendingUp } from 'lucide-react';
import { NBButton, NBHeading, NBBadge, useNBConfirm } from './NeoBrutalUI';
import { PackOpening } from './PackOpening';

export const Shop = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const { confirm, ConfirmDialog } = useNBConfirm();

  // Tab state
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'

  // Pack opening state
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [selectedPackType, setSelectedPackType] = useState(null);

  // Shop offers for items
  const [shopOffers, setShopOffers] = useState({ items: [] });
  const [purchasedItemIndices, setPurchasedItemIndices] = useState([]);

  // Prices
  const cardRemovalRefund = 20;
  const rerollPrice = 50;

  // Pack prices
  const packPrices = {
    bronze: 50,
    silver: 100,
    gold: 200,
    diamond: 400
  };

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
    const itemOffers = [];
    const shopItems = ITEMS.filter(item => item.price);
    for (let i = 0; i < 3; i++) {
      const randomItem = shopItems[Math.floor(Math.random() * shopItems.length)];
      if (randomItem) {
        itemOffers.push(createItemInstance(randomItem.id));
      }
    }

    setShopOffers({ items: itemOffers });
    setPurchasedItemIndices([]);
  };

  useEffect(() => {
    generateShopOffers();
  }, []);

  const handleReroll = async () => {
    if (gameState.gold < rerollPrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: 'You need more gold to reroll the shop!',
        confirmText: 'OK',
        cancelText: '',
        confirmColor: 'yellow'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Reroll Shop?',
      message: `Reroll the shop for ${rerollPrice} gold?`,
      confirmText: 'Reroll',
      cancelText: 'Cancel',
      confirmColor: 'yellow',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: rerollPrice });
      generateShopOffers();
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Rerolled shop for ${rerollPrice} gold!` });
    }
  };

  const handleBuyPack = async (packType) => {
    const price = packPrices[packType];

    if (gameState.gold < price) {
      await confirm({
        title: 'Not Enough Gold',
        message: 'You need more gold to buy this pack!',
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    dispatch({ type: 'SPEND_GOLD', amount: price });
    setSelectedPackType(packType);
    setShowPackOpening(true);
  };

  const handlePackOpeningComplete = () => {
    setShowPackOpening(false);
    setSelectedPackType(null);
  };

  const handleBuyItem = async (item, index) => {
    if (gameState.gold < item.price) {
      await confirm({
        title: 'Not Enough Gold',
        message: 'You need more gold to buy this item!',
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    if (purchasedItemIndices.includes(index)) {
      await confirm({
        title: 'Already Purchased',
        message: 'You already purchased this item!',
        confirmText: 'OK',
        confirmColor: 'yellow'
      });
      return;
    }

    const bag = gameState.inventory?.bag || [];
    if (!bag.some(slot => slot === null)) {
      await confirm({
        title: 'Bag Full',
        message: 'Your bag is full! Sell some items to make room.',
        confirmText: 'OK',
        confirmColor: 'orange'
      });
      return;
    }

    dispatch({ type: 'SPEND_GOLD', amount: item.price });
    dispatch({ type: 'ADD_ITEM_TO_BAG', item });
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Purchased ${item.name} for ${item.price} gold!` });
    setPurchasedItemIndices([...purchasedItemIndices, index]);
  };

  const handleRemoveCard = async (card) => {
    if (gameState.unlockedCards.length <= 3) {
      await confirm({
        title: 'Cannot Remove Card',
        message: 'You must have at least 3 cards in your collection!',
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Remove Card?',
      message: `Remove ${card.name} from your collection for ${cardRemovalRefund} gold?`,
      confirmText: 'Remove',
      cancelText: 'Keep',
      confirmColor: 'red',
      cancelColor: 'green'
    });

    if (confirmed) {
      dispatch({ type: 'REMOVE_UNLOCKED_CARD', cardName: card.name });
      dispatch({ type: 'ADD_GOLD', amount: cardRemovalRefund });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Removed ${card.name} for ${cardRemovalRefund} gold!` });
    }
  };

  const handleSellItem = async (item) => {
    const sellPrice = Math.floor(item.price * 0.5);

    const confirmed = await confirm({
      title: 'Sell Item?',
      message: `Sell ${item.name} for ${sellPrice} gold?`,
      confirmText: 'Sell',
      cancelText: 'Keep',
      confirmColor: 'yellow',
      cancelColor: 'green'
    });

    if (confirmed) {
      dispatch({ type: 'REMOVE_ITEM_FROM_BAG', instanceId: item.instanceId });
      dispatch({ type: 'ADD_GOLD', amount: sellPrice });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Sold ${item.name} for ${sellPrice} gold!` });
    }
  };

  // Permanent Upgrades (keeping existing logic)
  const handleBuyHealthUpgrade = async () => {
    if (gameState.gold < healthUpgradePrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${healthUpgradePrice} gold to upgrade health!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const purchased = gameState.healthUpgradesPurchased || 0;
    if (purchased >= 5) {
      await confirm({
        title: 'Max Upgrades Reached',
        message: 'You have reached the maximum health upgrades!',
        confirmText: 'OK',
        confirmColor: 'purple'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Upgrade Health?',
      message: `Upgrade Max Health by 10 for ${healthUpgradePrice} gold?`,
      confirmText: 'Upgrade',
      cancelText: 'Cancel',
      confirmColor: 'green',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: healthUpgradePrice });
      dispatch({ type: 'UPGRADE_HEALTH', amount: 10 });
      dispatch({ type: 'TRACK_UPGRADE', upgradeType: 'health' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Max Health increased by 10!` });
    }
  };

  const handleBuyEnergyUpgrade = async () => {
    if (gameState.gold < energyUpgradePrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${energyUpgradePrice} gold to upgrade energy!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const purchased = gameState.energyUpgradesPurchased || 0;
    if (purchased >= 5) {
      await confirm({
        title: 'Max Upgrades Reached',
        message: 'You have reached the maximum energy upgrades!',
        confirmText: 'OK',
        confirmColor: 'purple'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Upgrade Energy?',
      message: `Upgrade Max Energy by 1 for ${energyUpgradePrice} gold?`,
      confirmText: 'Upgrade',
      cancelText: 'Cancel',
      confirmColor: 'blue',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: energyUpgradePrice });
      dispatch({ type: 'UPGRADE_MAX_ENERGY', amount: 1 });
      dispatch({ type: 'TRACK_UPGRADE', upgradeType: 'energy' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Max Energy increased by 1!` });
    }
  };

  const handleBuyHandSizeUpgrade = async () => {
    if (gameState.gold < handSizeUpgradePrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${handSizeUpgradePrice} gold to upgrade hand size!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const purchased = gameState.handSizeUpgradesPurchased || 0;
    if (purchased >= 5) {
      await confirm({
        title: 'Max Upgrades Reached',
        message: 'You have reached the maximum hand size upgrades!',
        confirmText: 'OK',
        confirmColor: 'purple'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Upgrade Hand Size?',
      message: `Upgrade Hand Size by 1 for ${handSizeUpgradePrice} gold?`,
      confirmText: 'Upgrade',
      cancelText: 'Cancel',
      confirmColor: 'purple',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: handSizeUpgradePrice });
      dispatch({ type: 'UPGRADE_HAND_SIZE', amount: 1 });
      dispatch({ type: 'TRACK_UPGRADE', upgradeType: 'handSize' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Hand Size increased by 1!` });
    }
  };

  // Boss Abilities
  const handleBuyDrawAbility = async () => {
    if (gameState.gold < drawAbilityPrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${drawAbilityPrice} gold to unlock this ability!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Unlock Draw Ability?',
      message: `Unlock Draw Card ability for ${drawAbilityPrice} gold?`,
      confirmText: 'Unlock',
      cancelText: 'Cancel',
      confirmColor: 'cyan',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: drawAbilityPrice });
      dispatch({ type: 'PURCHASE_DRAW_ABILITY' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Unlocked Draw Card ability!` });
    }
  };

  const handleBuyDiscardAbility = async () => {
    if (gameState.gold < discardAbilityPrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${discardAbilityPrice} gold to unlock this ability!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Unlock Discard Ability?',
      message: `Unlock Discard for Energy ability for ${discardAbilityPrice} gold?`,
      confirmText: 'Unlock',
      cancelText: 'Cancel',
      confirmColor: 'cyan',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: discardAbilityPrice });
      dispatch({ type: 'PURCHASE_DISCARD_ABILITY' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Unlocked Discard for Energy ability!` });
    }
  };

  // Inventory Upgrades
  const handleBuyBagSlot = async () => {
    if (gameState.gold < bagSlotPrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${bagSlotPrice} gold to expand bag size!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const currentBagSize = gameState.inventory?.bag?.length || 6;
    if (currentBagSize >= 12) {
      await confirm({
        title: 'Maximum Size Reached',
        message: 'Your bag is already at maximum size!',
        confirmText: 'OK',
        confirmColor: 'purple'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Expand Bag?',
      message: `Add +1 Bag Slot for ${bagSlotPrice} gold?`,
      confirmText: 'Expand',
      cancelText: 'Cancel',
      confirmColor: 'orange',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: bagSlotPrice });
      dispatch({ type: 'EXPAND_BAG_SIZE' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Bag size increased!` });
    }
  };

  const handleBuyConsumableSlot = async () => {
    if (gameState.gold < consumableSlotPrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${consumableSlotPrice} gold to expand consumable slots!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const currentConsumableSize = gameState.inventory?.toolBelt?.consumables?.length || 4;
    if (currentConsumableSize >= 8) {
      await confirm({
        title: 'Maximum Slots Reached',
        message: 'You have reached the maximum consumable slots!',
        confirmText: 'OK',
        confirmColor: 'purple'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Expand Consumable Slots?',
      message: `Add +1 Consumable Slot for ${consumableSlotPrice} gold?`,
      confirmText: 'Expand',
      cancelText: 'Cancel',
      confirmColor: 'orange',
      cancelColor: 'white'
    });

    if (confirmed) {
      dispatch({ type: 'SPEND_GOLD', amount: consumableSlotPrice });
      dispatch({ type: 'EXPAND_CONSUMABLE_SIZE' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: `Consumable slots increased!` });
    }
  };

  const handleBuyPassiveSlot = async () => {
    if (gameState.gold < passiveSlotPrice) {
      await confirm({
        title: 'Not Enough Gold',
        message: `You need ${passiveSlotPrice} gold to expand passive slots!`,
        confirmText: 'OK',
        confirmColor: 'red'
      });
      return;
    }

    const currentPassiveSize = gameState.inventory?.toolBelt?.passives?.length || 3;
    if (currentPassiveSize >= 6) {
      await confirm({
        title: 'Maximum Slots Reached',
        message: 'You have reached the maximum passive slots!',
        confirmText: 'OK',
        confirmColor: 'purple'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Expand Passive Slots?',
      message: `Add +1 Passive Slot for ${passiveSlotPrice} gold?`,
      confirmText: 'Expand',
      cancelText: 'Cancel',
      confirmColor: 'purple',
      cancelColor: 'white'
    });

    if (confirmed) {
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
      <div className="h-screen nb-bg-yellow p-3 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-3">
          {/* LEFT PANEL - Shop Character (30%) */}
          <div className="w-[30%] flex flex-col gap-3">
            {/* Header with Gold */}
            <div className="nb-bg-white nb-border-xl nb-shadow-xl p-4">
              <div className="text-center mb-3">
                <div className="nb-bg-orange nb-border-lg nb-shadow p-2 inline-block mb-2">
                  <ShoppingCart className="w-12 h-12 text-black" />
                </div>
                <NBHeading level={1} className="text-black mb-1 text-2xl">
                  SHOP
                </NBHeading>
              </div>

              {/* Gold Display */}
              <div className="nb-bg-yellow nb-border-xl nb-shadow-xl px-4 py-3 flex items-center justify-center gap-2 mb-3">
                <Coins className="w-8 h-8 text-black" />
                <span className="text-4xl font-black text-black">{gameState.gold}</span>
              </div>

              {/* Reroll Button */}
              <NBButton
                onClick={handleReroll}
                disabled={gameState.gold < rerollPrice}
                variant={gameState.gold >= rerollPrice ? 'purple' : 'white'}
                size="md"
                className="w-full flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Reroll ({rerollPrice}g)</span>
              </NBButton>
            </div>

            {/* Shop Character Placeholder */}
            <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-6 flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-7xl mb-3">🧙</div>
                <NBBadge color="yellow" className="px-4 py-2 text-sm">
                  SHOPKEEPER
                </NBBadge>
                <p className="text-white font-bold text-xs mt-2 uppercase">
                  Character Coming Soon!
                </p>
              </div>
            </div>

            {/* Leave Button */}
            <NBButton
              onClick={handleLeaveShop}
              variant="danger"
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>LEAVE SHOP</span>
            </NBButton>
          </div>

          {/* RIGHT PANEL - Content (70%) */}
          <div className="w-[70%] flex flex-col h-full">
            {/* Tab Switcher */}
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setActiveTab('buy')}
                className={`
                  flex-1 py-3 font-black text-xl uppercase
                  nb-border-xl nb-shadow-xl
                  ${activeTab === 'buy' ? 'nb-bg-green' : 'nb-bg-white'}
                  nb-hover transition-all
                `}
              >
                🛒 BUY ITEMS
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`
                  flex-1 py-3 font-black text-xl uppercase
                  nb-border-xl nb-shadow-xl
                  ${activeTab === 'sell' ? 'nb-bg-orange' : 'nb-bg-white'}
                  nb-hover transition-all
                `}
              >
                💰 SELL ITEMS
              </button>
            </div>

            {/* Tab Content - Fixed Height with Scrolling */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {activeTab === 'buy' ? (
                <>
                  {/* BUY CARD PACKS Section */}
                  <div className="nb-bg-white nb-border-xl nb-shadow-xl p-3">
                    <NBHeading level={2} className="text-center mb-3 text-lg">
                      🎴 CARD PACKS
                    </NBHeading>

                    <div className="grid grid-cols-4 gap-3">
                      {/* Bronze Pack */}
                      <button
                        onClick={() => handleBuyPack('bronze')}
                        disabled={gameState.gold < packPrices.bronze}
                        className={`
                          relative group
                          ${gameState.gold >= packPrices.bronze ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all duration-300
                          ${gameState.gold >= packPrices.bronze ? 'hover:scale-105 hover:-translate-y-1' : ''}
                        `}
                      >
                        {/* Pack Container - Vertical Rectangle like real booster */}
                        <div className="relative nb-border-xl nb-shadow-xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                            aspectRatio: '2/3'
                          }}
                        >
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60"></div>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 blur-2xl rounded-full"></div>

                          {/* Pack Content */}
                          <div className="relative h-full flex flex-col items-center justify-between p-3">
                            {/* Top Section - Icon */}
                            <div className="text-5xl drop-shadow-lg">🥉</div>

                            {/* Middle Section - Pack Name */}
                            <div className="text-center">
                              <div className="text-white font-black text-xl uppercase tracking-wide drop-shadow-lg mb-1"
                                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                              >
                                BRONZE
                              </div>
                              <div className="text-white text-xs font-bold bg-black/30 px-2 py-1 rounded">
                                3 CARDS
                              </div>
                            </div>

                            {/* Bottom Section - Price */}
                            <div className="w-full">
                              <div className={`
                                ${gameState.gold >= packPrices.bronze ? 'nb-bg-yellow' : 'nb-bg-white'}
                                nb-border nb-shadow px-2 py-1 text-center
                              `}>
                                <div className="flex items-center justify-center gap-1">
                                  <Coins className="w-4 h-4" />
                                  <span className="font-black text-sm">{packPrices.bronze}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Foil Pattern Overlay */}
                          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-transparent via-white/50 to-transparent animate-pulse"></div>
                        </div>
                      </button>

                      {/* Silver Pack */}
                      <button
                        onClick={() => handleBuyPack('silver')}
                        disabled={gameState.gold < packPrices.silver}
                        className={`
                          relative group
                          ${gameState.gold >= packPrices.silver ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all duration-300
                          ${gameState.gold >= packPrices.silver ? 'hover:scale-105 hover:-translate-y-1' : ''}
                        `}
                      >
                        {/* Pack Container */}
                        <div className="relative nb-border-xl nb-shadow-xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #e0e0e0 0%, #b8b8b8 50%, #909090 100%)',
                            aspectRatio: '2/3'
                          }}
                        >
                          {/* Metallic Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/20"></div>
                          <div className="absolute top-0 left-0 w-20 h-20 bg-white/40 blur-2xl rounded-full"></div>
                          <div className="absolute bottom-0 right-0 w-16 h-16 bg-black/20 blur-xl rounded-full"></div>

                          {/* Pack Content */}
                          <div className="relative h-full flex flex-col items-center justify-between p-3">
                            <div className="text-5xl drop-shadow-lg">🥈</div>

                            <div className="text-center">
                              <div className="text-black font-black text-xl uppercase tracking-wide drop-shadow-lg mb-1"
                                style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.5)' }}
                              >
                                SILVER
                              </div>
                              <div className="text-black text-xs font-bold bg-white/40 px-2 py-1 rounded">
                                3 CARDS
                              </div>
                            </div>

                            <div className="w-full">
                              <div className={`
                                ${gameState.gold >= packPrices.silver ? 'nb-bg-yellow' : 'nb-bg-white'}
                                nb-border nb-shadow px-2 py-1 text-center
                              `}>
                                <div className="flex items-center justify-center gap-1">
                                  <Coins className="w-4 h-4" />
                                  <span className="font-black text-sm">{packPrices.silver}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Metallic Pattern */}
                          <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                        </div>
                      </button>

                      {/* Gold Pack */}
                      <button
                        onClick={() => handleBuyPack('gold')}
                        disabled={gameState.gold < packPrices.gold}
                        className={`
                          relative group
                          ${gameState.gold >= packPrices.gold ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all duration-300
                          ${gameState.gold >= packPrices.gold ? 'hover:scale-105 hover:-translate-y-1' : ''}
                        `}
                      >
                        {/* Pack Container */}
                        <div className="relative nb-border-xl nb-shadow-xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                            aspectRatio: '2/3'
                          }}
                        >
                          {/* Golden Shine */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/60 via-transparent to-amber-900/20"></div>
                          <div className="absolute top-1/4 right-0 w-24 h-24 bg-yellow-200/40 blur-3xl rounded-full"></div>
                          <div className="absolute bottom-1/4 left-0 w-20 h-20 bg-amber-600/30 blur-2xl rounded-full"></div>

                          {/* Pack Content */}
                          <div className="relative h-full flex flex-col items-center justify-between p-3">
                            <div className="text-5xl drop-shadow-lg">🥇</div>

                            <div className="text-center">
                              <div className="text-black font-black text-xl uppercase tracking-wide drop-shadow-lg mb-1"
                                style={{ textShadow: '2px 2px 4px rgba(255,215,0,0.5)' }}
                              >
                                GOLD
                              </div>
                              <div className="text-black text-xs font-bold bg-yellow-900/30 px-2 py-1 rounded text-white">
                                3 CARDS
                              </div>
                            </div>

                            <div className="w-full">
                              <div className={`
                                ${gameState.gold >= packPrices.gold ? 'nb-bg-green' : 'nb-bg-white'}
                                nb-border nb-shadow px-2 py-1 text-center
                              `}>
                                <div className="flex items-center justify-center gap-1">
                                  <Coins className="w-4 h-4" />
                                  <span className="font-black text-sm">{packPrices.gold}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gold Sparkle Effect */}
                          <div className="absolute inset-0 opacity-40 bg-gradient-to-tl from-yellow-300/50 via-transparent to-yellow-400/50 animate-pulse"
                            style={{ animationDuration: '2s' }}
                          ></div>
                        </div>
                      </button>

                      {/* Diamond Pack */}
                      <button
                        onClick={() => handleBuyPack('diamond')}
                        disabled={gameState.gold < packPrices.diamond}
                        className={`
                          relative group
                          ${gameState.gold >= packPrices.diamond ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all duration-300
                          ${gameState.gold >= packPrices.diamond ? 'hover:scale-105 hover:-translate-y-1' : ''}
                        `}
                      >
                        {/* Pack Container */}
                        <div className="relative nb-border-xl nb-shadow-xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 30%, #7e22ce 60%, #6b21a8 100%)',
                            aspectRatio: '2/3'
                          }}
                        >
                          {/* Rainbow Holographic Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-300/40 via-purple-300/40 to-blue-300/40 opacity-60"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-400/40 blur-2xl rounded-full"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/40 blur-xl rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/20 blur-3xl rounded-full"></div>

                          {/* Pack Content */}
                          <div className="relative h-full flex flex-col items-center justify-between p-3">
                            <div className="text-5xl drop-shadow-lg animate-pulse">💎</div>

                            <div className="text-center">
                              <div className="text-white font-black text-xl uppercase tracking-wide drop-shadow-lg mb-1"
                                style={{ textShadow: '2px 2px 6px rgba(168,85,247,0.8), 0 0 10px rgba(236,72,153,0.5)' }}
                              >
                                DIAMOND
                              </div>
                              <div className="text-white text-xs font-bold bg-purple-900/40 px-2 py-1 rounded">
                                3 CARDS
                              </div>
                            </div>

                            <div className="w-full">
                              <div className={`
                                ${gameState.gold >= packPrices.diamond ? 'nb-bg-green' : 'nb-bg-white'}
                                nb-border nb-shadow px-2 py-1 text-center
                              `}>
                                <div className="flex items-center justify-center gap-1">
                                  <Coins className="w-4 h-4" />
                                  <span className="font-black text-sm">{packPrices.diamond}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Holographic Rainbow Shimmer */}
                          <div className="absolute inset-0 opacity-50"
                            style={{
                              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                              animation: 'shimmer 3s infinite'
                            }}
                          ></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* BUY ITEMS Section */}
                  <div className="nb-bg-white nb-border-xl nb-shadow-xl p-3">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Package className="w-6 h-6 text-black" />
                      <NBHeading level={2} className="text-center text-lg">
                        BUY ITEMS
                      </NBHeading>
                    </div>

                    <div className="space-y-2">
                      {shopOffers.items.map((item, index) => {
                        const alreadyPurchased = purchasedItemIndices.includes(index);
                        const canAfford = gameState.gold >= item.price;

                        return (
                          <button
                            key={index}
                            onClick={() => !alreadyPurchased && canAfford && handleBuyItem(item, index)}
                            disabled={!canAfford || alreadyPurchased}
                            className={`
                              w-full nb-bg-purple nb-border-xl nb-shadow-lg
                              p-4 flex items-center gap-4
                              ${(canAfford && !alreadyPurchased) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                              transition-all
                            `}
                          >
                            <div className="text-5xl">{item.emoji}</div>
                            <div className="flex-1 text-left">
                              <div className="text-black font-black text-lg uppercase">{item.name}</div>
                              <div className="text-gray-700 text-sm font-semibold">{item.description}</div>
                            </div>
                            <div className={`
                              ${alreadyPurchased ? 'bg-gray-600' : (canAfford ? 'nb-bg-green' : 'nb-bg-red')}
                              nb-border nb-shadow px-4 py-2 text-white font-bold uppercase tracking-wide
                              flex items-center gap-1
                            `}>
                              {alreadyPurchased ? (
                                <>✓ PURCHASED</>
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

                  {/* PERMANENT UPGRADES Section */}
                  <div className="nb-bg-white nb-border-xl nb-shadow-xl p-3">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <TrendingUp className="w-6 h-6 text-black" />
                      <NBHeading level={2} className="text-center text-lg">
                        UPGRADES
                      </NBHeading>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Max Health Upgrade */}
                      <button
                        onClick={handleBuyHealthUpgrade}
                        disabled={gameState.gold < healthUpgradePrice || healthUpgradesPurchased >= maxUpgrades}
                        className={`
                          nb-bg-red nb-border-xl nb-shadow-lg
                          p-2 relative
                          ${(gameState.gold >= healthUpgradePrice && healthUpgradesPurchased < maxUpgrades) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all
                        `}
                      >
                        <Heart className="w-8 h-8 text-black mx-auto mb-1" />
                        <div className="text-black font-black text-sm mb-1 uppercase">+10 HP</div>
                        <div className="text-gray-800 text-xs mb-2 font-bold">({healthUpgradesPurchased}/{maxUpgrades})</div>
                        {healthUpgradesPurchased >= maxUpgrades ? (
                          <NBBadge color="white" className="px-2 py-0.5 text-xs">
                            MAX
                          </NBBadge>
                        ) : (
                          <NBBadge
                            color={gameState.gold >= healthUpgradePrice ? 'green' : 'white'}
                            className="px-2 py-0.5 text-xs inline-flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3" />
                            {healthUpgradePrice}
                          </NBBadge>
                        )}
                      </button>

                      {/* Max Energy Upgrade */}
                      <button
                        onClick={handleBuyEnergyUpgrade}
                        disabled={gameState.gold < energyUpgradePrice || energyUpgradesPurchased >= maxUpgrades}
                        className={`
                          nb-bg-cyan nb-border-xl nb-shadow-lg
                          p-2 relative
                          ${(gameState.gold >= energyUpgradePrice && energyUpgradesPurchased < maxUpgrades) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all
                        `}
                      >
                        <Zap className="w-8 h-8 text-black mx-auto mb-1" />
                        <div className="text-black font-black text-sm mb-1 uppercase">+1 ⚡</div>
                        <div className="text-gray-800 text-xs mb-2 font-bold">({energyUpgradesPurchased}/{maxUpgrades})</div>
                        {energyUpgradesPurchased >= maxUpgrades ? (
                          <NBBadge color="white" className="px-2 py-0.5 text-xs">
                            MAX
                          </NBBadge>
                        ) : (
                          <NBBadge
                            color={gameState.gold >= energyUpgradePrice ? 'green' : 'white'}
                            className="px-2 py-0.5 text-xs inline-flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3" />
                            {energyUpgradePrice}
                          </NBBadge>
                        )}
                      </button>

                      {/* Hand Size Upgrade */}
                      <button
                        onClick={handleBuyHandSizeUpgrade}
                        disabled={gameState.gold < handSizeUpgradePrice || handSizeUpgradesPurchased >= maxUpgrades}
                        className={`
                          nb-bg-purple nb-border-xl nb-shadow-lg
                          p-2 relative
                          ${(gameState.gold >= handSizeUpgradePrice && handSizeUpgradesPurchased < maxUpgrades) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-all
                        `}
                      >
                        <Users className="w-8 h-8 text-black mx-auto mb-1" />
                        <div className="text-black font-black text-sm mb-1 uppercase">+1 Hand</div>
                        <div className="text-gray-800 text-xs mb-2 font-bold">({handSizeUpgradesPurchased}/{maxUpgrades})</div>
                        {handSizeUpgradesPurchased >= maxUpgrades ? (
                          <NBBadge color="white" className="px-2 py-0.5 text-xs">
                            MAX
                          </NBBadge>
                        ) : (
                          <NBBadge
                            color={gameState.gold >= handSizeUpgradePrice ? 'green' : 'white'}
                            className="px-2 py-0.5 text-xs inline-flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3" />
                            {handSizeUpgradePrice}
                          </NBBadge>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* BOSS ABILITIES Section */}
                  <div className="nb-bg-white nb-border-xl nb-shadow-xl p-3">
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <NBHeading level={2} className="text-center text-lg">
                        BOSS ABILITIES
                      </NBHeading>
                      <NBBadge color="orange" className="text-xs px-3 py-1">
                        DEFEAT BOSSES TO UNLOCK
                      </NBBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Draw Card Ability */}
                      <div className={`
                        nb-bg-green nb-border-xl nb-shadow-lg
                        p-6 relative
                        ${bossesDefeated >= 1 ? '' : 'opacity-50'}
                        transition-all
                      `}>
                        {bossesDefeated < 1 && (
                          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center nb-border-xl">
                            <NBBadge color="white" className="text-sm px-4 py-2">
                              LOCKED
                            </NBBadge>
                          </div>
                        )}

                        <div className="text-black font-black text-lg mb-2 text-center uppercase">Draw Card</div>
                        <div className="text-gray-800 text-xs mb-4 text-center font-bold">Draw 1 for 3 energy</div>

                        {gameState.hasDrawAbility ? (
                          <NBBadge color="white" className="w-full text-center px-3 py-2 text-sm">
                            ✓ UNLOCKED
                          </NBBadge>
                        ) : bossesDefeated >= 1 ? (
                          <NBButton
                            onClick={handleBuyDrawAbility}
                            disabled={gameState.gold < drawAbilityPrice}
                            variant={gameState.gold >= drawAbilityPrice ? 'yellow' : 'white'}
                            size="sm"
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Coins className="w-4 h-4" />
                            {drawAbilityPrice}
                          </NBButton>
                        ) : null}
                      </div>

                      {/* Discard Ability */}
                      <div className={`
                        nb-bg-orange nb-border-xl nb-shadow-lg
                        p-6 relative
                        ${bossesDefeated >= 2 ? '' : 'opacity-50'}
                        transition-all
                      `}>
                        {bossesDefeated < 2 && (
                          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center nb-border-xl">
                            <NBBadge color="white" className="text-sm px-4 py-2">
                              LOCKED
                            </NBBadge>
                          </div>
                        )}

                        <div className="text-black font-black text-lg mb-2 text-center uppercase">Discard</div>
                        <div className="text-gray-800 text-xs mb-4 text-center font-bold">Discard for 1 energy</div>

                        {gameState.hasDiscardAbility ? (
                          <NBBadge color="white" className="w-full text-center px-3 py-2 text-sm">
                            ✓ UNLOCKED
                          </NBBadge>
                        ) : bossesDefeated >= 2 ? (
                          <NBButton
                            onClick={handleBuyDiscardAbility}
                            disabled={gameState.gold < discardAbilityPrice}
                            variant={gameState.gold >= discardAbilityPrice ? 'yellow' : 'white'}
                            size="sm"
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Coins className="w-4 h-4" />
                            {discardAbilityPrice}
                          </NBButton>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* INVENTORY UPGRADES Section */}
                  {inventoryUnlocked && (
                    <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6">
                      <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="flex items-center gap-3">
                          <Package className="w-10 h-10 text-black" />
                          <NBHeading level={2} className="text-center">
                            INVENTORY UPGRADES
                          </NBHeading>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {/* Bag Slot Upgrade */}
                        <button
                          onClick={handleBuyBagSlot}
                          disabled={gameState.gold < bagSlotPrice || currentBagSize >= 12}
                          className={`
                            nb-bg-orange nb-border-xl nb-shadow-lg
                            p-6 relative
                            ${(gameState.gold >= bagSlotPrice && currentBagSize < 12) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                            transition-all
                          `}
                        >
                          <Package className="w-12 h-12 text-black mx-auto mb-3" />
                          <div className="text-black font-black text-lg mb-2 uppercase">+1 Bag</div>
                          <div className="text-gray-800 text-xs mb-3 font-bold">{currentBagSize}/12</div>
                          {currentBagSize >= 12 ? (
                            <NBBadge color="white" className="px-3 py-1 text-sm">
                              MAXED
                            </NBBadge>
                          ) : (
                            <NBBadge
                              color={gameState.gold >= bagSlotPrice ? 'green' : 'white'}
                              className="px-3 py-1 text-sm inline-flex items-center gap-1"
                            >
                              <Coins className="w-3 h-3" />
                              {bagSlotPrice}
                            </NBBadge>
                          )}
                        </button>

                        {/* Consumable Slot Upgrade */}
                        <button
                          onClick={handleBuyConsumableSlot}
                          disabled={gameState.gold < consumableSlotPrice || currentConsumableSize >= 8}
                          className={`
                            nb-bg-green nb-border-xl nb-shadow-lg
                            p-6 relative
                            ${(gameState.gold >= consumableSlotPrice && currentConsumableSize < 8) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                            transition-all
                          `}
                        >
                          <Heart className="w-12 h-12 text-black mx-auto mb-3" />
                          <div className="text-black font-black text-lg mb-2 uppercase">+1 Item</div>
                          <div className="text-gray-800 text-xs mb-3 font-bold">{currentConsumableSize}/8</div>
                          {currentConsumableSize >= 8 ? (
                            <NBBadge color="white" className="px-3 py-1 text-sm">
                              MAXED
                            </NBBadge>
                          ) : (
                            <NBBadge
                              color={gameState.gold >= consumableSlotPrice ? 'green' : 'white'}
                              className="px-3 py-1 text-sm inline-flex items-center gap-1"
                            >
                              <Coins className="w-3 h-3" />
                              {consumableSlotPrice}
                            </NBBadge>
                          )}
                        </button>

                        {/* Passive Slot Upgrade */}
                        <button
                          onClick={handleBuyPassiveSlot}
                          disabled={gameState.gold < passiveSlotPrice || currentPassiveSize >= 6}
                          className={`
                            nb-bg-blue nb-border-xl nb-shadow-lg
                            p-6 relative
                            ${(gameState.gold >= passiveSlotPrice && currentPassiveSize < 6) ? 'nb-hover cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                            transition-all
                          `}
                        >
                          <Zap className="w-12 h-12 text-black mx-auto mb-3" />
                          <div className="text-black font-black text-lg mb-2 uppercase">+1 Passive</div>
                          <div className="text-gray-800 text-xs mb-3 font-bold">{currentPassiveSize}/6</div>
                          {currentPassiveSize >= 6 ? (
                            <NBBadge color="white" className="px-3 py-1 text-sm">
                              MAXED
                            </NBBadge>
                          ) : (
                            <NBBadge
                              color={gameState.gold >= passiveSlotPrice ? 'green' : 'white'}
                              className="px-3 py-1 text-sm inline-flex items-center gap-1"
                            >
                              <Coins className="w-3 h-3" />
                              {passiveSlotPrice}
                            </NBBadge>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* SELL TAB - Remove Cards and Sell Items */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* REMOVE CARDS Section */}
                    <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Trash2 className="w-8 h-8 text-black" />
                        <NBHeading level={2} className="text-center">
                          REMOVE CARDS
                        </NBHeading>
                      </div>
                      <div className="flex items-center justify-center mb-4">
                        <NBBadge color="red" className="text-sm px-4 py-2">
                          +{cardRemovalRefund}g EACH
                        </NBBadge>
                      </div>

                      {gameState.unlockedCards && gameState.unlockedCards.length > 3 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                          {gameState.unlockedCards.map((card, index) => (
                            <button
                              key={index}
                              onClick={() => handleRemoveCard(card)}
                              className="w-full nb-bg-red nb-border-lg nb-shadow p-3 nb-hover transition-all flex items-center justify-between"
                            >
                              <div className="text-left">
                                <div className="text-black font-black text-sm uppercase">{card.name}</div>
                              </div>
                              <NBBadge color="green" className="px-3 py-1 text-sm flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                +{cardRemovalRefund}
                              </NBBadge>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 nb-bg-white nb-border-lg p-4">
                          <p className="text-gray-700 font-bold">You need at least 3 cards!</p>
                        </div>
                      )}
                    </div>

                    {/* SELL ITEMS Section */}
                    <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Coins className="w-8 h-8 text-black" />
                        <NBHeading level={2} className="text-center">
                          SELL ITEMS
                        </NBHeading>
                      </div>
                      <div className="flex items-center justify-center mb-4">
                        <NBBadge color="yellow" className="text-sm px-4 py-2">
                          50% REFUND
                        </NBBadge>
                      </div>

                      {playerItems.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                          {playerItems.map((item, index) => {
                            const sellPrice = Math.floor(item.price * 0.5);

                            return (
                              <button
                                key={index}
                                onClick={() => handleSellItem(item)}
                                className="w-full nb-bg-green nb-border-lg nb-shadow p-3 nb-hover transition-all flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">{item.emoji}</div>
                                  <div className="text-left">
                                    <div className="text-black font-black text-sm uppercase">{item.name}</div>
                                  </div>
                                </div>
                                <NBBadge color="yellow" className="px-3 py-1 text-sm flex items-center gap-1">
                                  <Coins className="w-4 h-4" />
                                  +{sellPrice}
                                </NBBadge>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 nb-bg-white nb-border-lg p-4">
                          <p className="text-gray-700 font-bold">Your inventory is empty!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pack Opening Overlay */}
      {showPackOpening && (
        <PackOpening
          packType={selectedPackType}
          onComplete={handlePackOpeningComplete}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </PageTransition>
  );
};
