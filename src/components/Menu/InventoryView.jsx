import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { Package, Zap, Shield, AlertCircle, Check, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { ITEM_TYPES, ITEM_RARITY_CONFIG, getItemById } from '../../data/items';
import { NBButton, NBHeading, NBBadge } from '../UI/NeoBrutalUI';

export const InventoryView = () => {
  const { gameState, dispatch } = useGame();
  const { currentRoute } = useRouter();
  const [selectedItem, setSelectedItem] = useState(null);

  const isInBattle = currentRoute === '/battle';

  // Get inventory data
  const bag = gameState.inventory?.bag || Array(8).fill(null);
  const toolBelt = gameState.inventory?.toolBelt || { consumables: [null, null], passive: null };
  const maxBagSize = gameState.maxBagSize || 8;

  // Count items
  const bagItemCount = bag.filter(item => item !== null).length;
  const equippedConsumableCount = toolBelt.consumables.filter(item => item !== null).length;
  const hasEquippedPassive = toolBelt.passive !== null;

  // Handle item click
  const handleItemClick = (item, location) => {
    if (!item) return;
    
    setSelectedItem({ item, location });
  };

  // Equip item from bag
  const handleEquipItem = () => {
    if (!selectedItem || selectedItem.location !== 'bag') return;

    const { item } = selectedItem;

    if (item.type === ITEM_TYPES.CONSUMABLE) {
      dispatch({ type: 'EQUIP_CONSUMABLE', item });
    } else if (item.type === ITEM_TYPES.PASSIVE) {
      dispatch({ type: 'EQUIP_PASSIVE', item });
    }

    setSelectedItem(null);
  };

  // Unequip item to bag
  const handleUnequipItem = () => {
    if (!selectedItem) return;

    const { item, location } = selectedItem;

    // Check if bag has space
    const hasSpace = bag.some(slot => slot === null);
    if (!hasSpace) {
      alert('Bag is full! Cannot unequip.');
      return;
    }

    if (location === 'consumable') {
      dispatch({ type: 'UNEQUIP_CONSUMABLE', instanceId: item.instanceId });
    } else if (location === 'passive') {
      dispatch({ type: 'UNEQUIP_PASSIVE' });
    }

    setSelectedItem(null);
  };

  // Use consumable (outside battle)
  const handleUseConsumable = (item) => {
    if (isInBattle) {
      alert('Use consumables via battle buttons during combat!');
      return;
    }

    // Execute item effect
    if (item.effect && typeof item.effect === 'function') {
      item.effect(dispatch, gameState);
    }

    // Remove from tool belt
    dispatch({ type: 'USE_CONSUMABLE', instanceId: item.instanceId });
  };

  // Render item card
  const renderItemCard = (item, location, index) => {
    const isEmpty = !item;
    const isSelected = selectedItem?.item?.instanceId === item?.instanceId;
    const rarityConfig = item ? ITEM_RARITY_CONFIG[item.rarity] : ITEM_RARITY_CONFIG.common;

    return (
      <button
        key={`${location}_${index}`}
        onClick={() => !isEmpty && handleItemClick(item, location)}
        disabled={isEmpty}
        className={`
          ${isEmpty ? 'nb-bg-white nb-border-lg' : `${rarityConfig.bgColor} nb-border-lg nb-hover cursor-pointer`}
          ${isSelected ? 'nb-shadow-colored-yellow' : 'nb-shadow'}
          p-3 transition-all duration-200
          flex flex-col items-center justify-center
          min-h-[100px] relative
          ${isEmpty ? 'cursor-not-allowed' : ''}
        `}
      >
        {isEmpty ? (
          <div className="text-black text-center">
            <Plus className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-bold uppercase">Empty</span>
          </div>
        ) : (
          <>
            {/* Rarity badge */}
            <div className={`absolute top-1 left-1 ${rarityConfig.bgColor} nb-border nb-shadow px-2 py-0.5 text-xs font-black uppercase text-black`}>
              {rarityConfig.name[0]}
            </div>

            {/* Emoji */}
            <div className="text-4xl mb-2">{item.emoji}</div>

            {/* Name */}
            <div className="text-sm font-black text-center text-black uppercase">{item.name}</div>

            {/* Type badge */}
            <div className={`mt-1 text-xs px-2 py-0.5 nb-border nb-shadow ${item.type === ITEM_TYPES.CONSUMABLE ? 'nb-bg-blue' : 'nb-bg-purple'} text-black font-black uppercase`}>
              {item.type === ITEM_TYPES.CONSUMABLE ? 'CONS' : 'PASS'}
            </div>
          </>
        )}
      </button>
    );
  };

  return (
    <div>
      {/* Battle Warning */}
      {isInBattle && (
        <div className="mb-6 nb-bg-orange nb-border-xl nb-shadow-lg p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-black flex-shrink-0" />
          <div>
            <NBHeading level={4} className="text-black mb-2">⚔️ IN BATTLE</NBHeading>
            <p className="text-sm text-black font-bold uppercase">
              Use consumables via battle buttons. Cannot equip/unequip during combat.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 nb-bg-purple nb-border-xl nb-shadow-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-6 h-6 text-black" />
          <NBHeading level={3} className="text-black">YOUR INVENTORY</NBHeading>
        </div>
        <div className="nb-bg-white nb-border-lg nb-shadow px-4 py-2 inline-block">
          <p className="text-black font-bold text-sm uppercase">
            Manage your items. Click to select, then equip or unequip.
          </p>
        </div>
      </div>

      {/* Bag Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <NBHeading level={4} className="text-black flex items-center gap-2">
            🎒 BAG ({bagItemCount}/{maxBagSize})
          </NBHeading>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {bag.map((item, index) => renderItemCard(item, 'bag', index))}
        </div>

        {bagItemCount === 0 && (
          <div className="text-center py-8 nb-bg-white nb-border-xl nb-shadow-lg p-6">
            <Package className="w-12 h-12 mx-auto mb-3 text-black" />
            <p className="font-black text-black uppercase mb-2">Your bag is empty!</p>
            <p className="text-sm text-black font-bold">Find items in shops, battles, and mystery nodes.</p>
          </div>
        )}
      </div>

      {/* Tool Belt Section */}
      <div className="mb-8">
        <NBHeading level={4} className="text-black mb-4 flex items-center gap-2">
          🛡️ EQUIPPED TOOL BELT
        </NBHeading>

        {/* Consumables */}
        <div className="mb-6">
          <h5 className="text-sm font-black mb-3 text-black uppercase">
            Consumables ({equippedConsumableCount}/{gameState.maxConsumableSlots})
          </h5>
          <div className="grid grid-cols-2 gap-3">
            {toolBelt.consumables.map((item, index) => (
              <div key={`consumable_${index}`} className="relative">
                {renderItemCard(item, 'consumable', index)}

                {/* Use button (outside battle only) */}
                {item && !isInBattle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseConsumable(item);
                    }}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 nb-bg-green nb-border nb-shadow text-black text-xs px-3 py-1 font-black uppercase transition-all nb-hover"
                  >
                    Use Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Passive */}
        <div>
          <h5 className="text-sm font-black mb-3 text-black uppercase">
            Passive ({hasEquippedPassive ? '1' : '0'}/{gameState.maxPassiveSlots})
          </h5>
          <div className="grid grid-cols-1 max-w-[200px]">
            {renderItemCard(toolBelt.passive, 'passive', 0)}
          </div>
        </div>
      </div>

      {/* Selected Item Actions */}
      {selectedItem && !isInBattle && (
        <div className="nb-bg-purple nb-border-xl nb-shadow-lg p-6 mb-6">
          <NBHeading level={5} className="text-black mb-4">SELECTED ITEM:</NBHeading>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">{selectedItem.item.emoji}</div>
            <div>
              <div className="font-black text-black uppercase mb-1">{selectedItem.item.name}</div>
              <div className="text-sm text-black font-bold">{selectedItem.item.description}</div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {selectedItem.location === 'bag' && (
              <NBButton
                onClick={handleEquipItem}
                variant="success"
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>EQUIP</span>
              </NBButton>
            )}

            {(selectedItem.location === 'consumable' || selectedItem.location === 'passive') && (
              <NBButton
                onClick={handleUnequipItem}
                variant="orange"
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>UNEQUIP</span>
              </NBButton>
            )}

            <NBButton
              onClick={() => setSelectedItem(null)}
              variant="white"
              size="lg"
            >
              CANCEL
            </NBButton>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 nb-bg-cyan nb-border-xl nb-shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-black" />
          <NBHeading level={5} className="text-black">HOW IT WORKS</NBHeading>
        </div>
        <div className="nb-bg-white nb-border-lg nb-shadow p-4">
          <ul className="text-sm text-black font-bold space-y-2">
            <li>• <span className="font-black uppercase">Bag:</span> Store items here (max {maxBagSize} slots)</li>
            <li>• <span className="font-black uppercase">Tool Belt:</span> Equip items to use in battle</li>
            <li>• <span className="font-black uppercase">Consumables:</span> One-time use, consumed after use</li>
            <li>• <span className="font-black uppercase">Passives:</span> Always active while equipped</li>
            <li>• <span className="font-black uppercase">Outside Battle:</span> Use consumables now or save for combat</li>
            <li>• <span className="font-black uppercase">During Battle:</span> Use equipped consumables via battle buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
};