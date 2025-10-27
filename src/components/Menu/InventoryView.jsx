import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { Package, Zap, Shield, AlertCircle, Check, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { ITEM_TYPES, ITEM_RARITY_CONFIG, getItemById } from '../../data/items';

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
          ${isEmpty ? 'bg-gray-100 border-dashed border-gray-300' : `${rarityConfig.bgColor} ${rarityConfig.borderColor} hover:scale-105 cursor-pointer`}
          ${isSelected ? 'ring-4 ring-purple-500' : ''}
          border-2 rounded-lg p-3 transition-all duration-200
          flex flex-col items-center justify-center
          min-h-[100px] relative
          ${isEmpty ? 'cursor-not-allowed' : ''}
        `}
      >
        {isEmpty ? (
          <div className="text-gray-400 text-center">
            <Plus className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Empty</span>
          </div>
        ) : (
          <>
            {/* Rarity badge */}
            <div className={`absolute top-1 left-1 ${rarityConfig.bgColor} ${rarityConfig.borderColor} border px-2 py-0.5 rounded text-xs font-bold ${rarityConfig.color}`}>
              {rarityConfig.name[0]}
            </div>

            {/* Emoji */}
            <div className="text-4xl mb-2">{item.emoji}</div>

            {/* Name */}
            <div className="text-sm font-bold text-center text-gray-800">{item.name}</div>

            {/* Type badge */}
            <div className={`mt-1 text-xs px-2 py-0.5 rounded ${item.type === ITEM_TYPES.CONSUMABLE ? 'bg-blue-500' : 'bg-purple-500'} text-white font-semibold`}>
              {item.type === ITEM_TYPES.CONSUMABLE ? 'Consumable' : 'Passive'}
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
        <div className="mb-6 bg-orange-100 border-2 border-orange-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-orange-800 mb-1">⚔️ In Battle</h4>
            <p className="text-sm text-orange-700">
              Use consumables via battle buttons. Cannot equip/unequip during combat.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Package className="w-6 h-6 text-purple-600" />
          Your Inventory
        </h3>
        <p className="text-gray-600 text-sm">
          Manage your items. Click to select, then equip or unequip.
        </p>
      </div>

      {/* Bag Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            🎒 Bag ({bagItemCount}/{maxBagSize})
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {bag.map((item, index) => renderItemCard(item, 'bag', index))}
        </div>

        {bagItemCount === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Your bag is empty!</p>
            <p className="text-sm mt-1">Find items in shops, battles, and mystery nodes.</p>
          </div>
        )}
      </div>

      {/* Tool Belt Section */}
      <div className="mb-8">
        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
          🛡️ Equipped Tool Belt
        </h4>

        {/* Consumables */}
        <div className="mb-4">
          <h5 className="text-md font-semibold mb-2 text-gray-700">
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
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg transition-all"
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
          <h5 className="text-md font-semibold mb-2 text-gray-700">
            Passive ({hasEquippedPassive ? '1' : '0'}/{gameState.maxPassiveSlots})
          </h5>
          <div className="grid grid-cols-1 max-w-[200px]">
            {renderItemCard(toolBelt.passive, 'passive', 0)}
          </div>
        </div>
      </div>

      {/* Selected Item Actions */}
      {selectedItem && !isInBattle && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <h5 className="font-bold text-purple-800 mb-3">Selected Item:</h5>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{selectedItem.item.emoji}</div>
            <div>
              <div className="font-bold text-gray-800">{selectedItem.item.name}</div>
              <div className="text-sm text-gray-600">{selectedItem.item.description}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {selectedItem.location === 'bag' && (
              <button
                onClick={handleEquipItem}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Equip to Tool Belt
              </button>
            )}

            {(selectedItem.location === 'consumable' || selectedItem.location === 'passive') && (
              <button
                onClick={handleUnequipItem}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Unequip to Bag
              </button>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          How It Works
        </h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Bag:</strong> Store items here (max {maxBagSize} slots)</li>
          <li>• <strong>Tool Belt:</strong> Equip items to use in battle</li>
          <li>• <strong>Consumables:</strong> One-time use, consumed after use</li>
          <li>• <strong>Passives:</strong> Always active while equipped</li>
          <li>• <strong>Outside Battle:</strong> Use consumables now or save for combat</li>
          <li>• <strong>During Battle:</strong> Use equipped consumables via battle buttons</li>
        </ul>
      </div>
    </div>
  );
};