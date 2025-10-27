// src/data/items.js

// Helper to get item by ID
export const getItemById = (id) => {
  return ITEMS.find(item => item.id === id);
};

// Create unique item instance
export const createItemInstance = (itemId) => {
  const baseItem = getItemById(itemId);
  if (!baseItem) {
    console.error('Item not found:', itemId);
    return null;
  }
  
  return {
    ...baseItem,
    instanceId: `${itemId}_${Date.now()}_${Math.random()}`
  };
};

// Item types constant
export const ITEM_TYPES = {
  CONSUMABLE: 'consumable',
  PASSIVE: 'passive'
};

// ITEMS DATABASE
export const ITEMS = [
  // ===== CONSUMABLES =====
  {
    id: 'health_potion',
    name: 'Health Potion',
    emoji: '🧪',
    description: 'Restore 30 HP instantly',
    rarity: 'common',
    type: 'consumable',
    price: 40,
    effect: (dispatch, gameState) => {
      dispatch({ type: 'HEAL_PLAYER', amount: 30 });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '🧪 Health Potion: Restored 30 HP!' });
    }
  },
  {
    id: 'energy_drink',
    name: 'Energy Drink',
    emoji: '⚡',
    description: 'Gain 5 energy this turn',
    rarity: 'common',
    type: 'consumable',
    price: 35,
    effect: (dispatch, gameState) => {
      dispatch({ type: 'GAIN_ENERGY', amount: 5 });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '⚡ Energy Drink: Gained 5 energy!' });
    }
  },
  {
    id: 'strength_potion',
    name: 'Strength Potion',
    emoji: '💪',
    description: 'Next attack deals +10 damage',
    rarity: 'common',
    type: 'consumable',
    price: 45,
    effect: (dispatch, gameState) => {
      // Apply Strength status effect
      const strengthStatus = {
        type: 'strength',
        name: 'Strength',
        description: '+10 damage to next attack',
        emoji: '💪',
        duration: 1,
        damageBoost: 10,
        color: 'text-orange-600'
      };
      dispatch({ type: 'APPLY_STATUS_TO_PLAYER', status: strengthStatus });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '💪 Strength Potion: Next attack +10 damage!' });
    }
  },
  {
    id: 'card_draw',
    name: 'Mystic Scroll',
    emoji: '📜',
    description: 'Draw 3 cards immediately',
    rarity: 'rare',
    type: 'consumable',
    price: 50,
    // SPECIAL: This effect needs access to drawMultipleCards function
    // So we'll handle it specially in BattleRoute
    needsSpecialHandling: true,
    specialEffect: 'draw_3_cards',
    effect: (dispatch, gameState) => {
      dispatch({ type: 'ADD_BATTLE_LOG', message: '📜 Mystic Scroll: Drawing 3 cards!' });
    }
  },
  {
    id: 'smoke_bomb',
    name: 'Smoke Bomb',
    emoji: '💨',
    description: 'Enemy misses next attack',
    rarity: 'rare',
    type: 'consumable',
    price: 55,
    effect: (dispatch, gameState) => {
      const dodgeStatus = {
        type: 'dodge',
        name: 'Dodge',
        description: 'Next enemy attack misses',
        emoji: '💨',
        duration: 1,
        color: 'text-gray-600'
      };
      dispatch({ type: 'APPLY_STATUS_TO_PLAYER', status: dodgeStatus });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '💨 Smoke Bomb: Next enemy attack will miss!' });
    }
  },
  {
    id: 'cleanse_tonic',
    name: 'Cleanse Tonic',
    emoji: '🍶',
    description: 'Remove all negative status effects',
    rarity: 'rare',
    type: 'consumable',
    price: 60,
    effect: (dispatch, gameState) => {
      dispatch({ type: 'CLEAR_ALL_PLAYER_STATUSES' });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '🍶 Cleanse Tonic: All negative effects removed!' });
    }
  },
  {
    id: 'mega_potion',
    name: 'Mega Potion',
    emoji: '🧃',
    description: 'Restore 60 HP instantly',
    rarity: 'epic',
    type: 'consumable',
    price: 80,
    effect: (dispatch, gameState) => {
      dispatch({ type: 'HEAL_PLAYER', amount: 60 });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '🧃 Mega Potion: Restored 60 HP!' });
    }
  },
  {
    id: 'adrenaline_shot',
    name: 'Adrenaline Shot',
    emoji: '💉',
    description: 'Gain 8 energy and draw 2 cards',
    rarity: 'epic',
    type: 'consumable',
    price: 90,
    // SPECIAL: Needs to draw cards
    needsSpecialHandling: true,
    specialEffect: 'draw_2_cards',
    effect: (dispatch, gameState) => {
      dispatch({ type: 'GAIN_ENERGY', amount: 8 });
      dispatch({ type: 'ADD_BATTLE_LOG', message: '💉 Adrenaline Shot: +8 energy and drawing 2 cards!' });
    }
  },

  // ===== PASSIVES =====
  {
    id: 'vitality_ring',
    name: 'Vitality Ring',
    emoji: '💍',
    description: '+20 Max Health',
    rarity: 'common',
    type: 'passive',
    price: 70,
    effect: {
      type: 'max_health_boost',
      value: 20
    }
  },
  {
    id: 'energy_crystal',
    name: 'Energy Crystal',
    emoji: '💎',
    description: '+3 Max Energy',
    rarity: 'rare',
    type: 'passive',
    price: 100,
    effect: {
      type: 'max_energy_boost',
      value: 3
    }
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    emoji: '🍀',
    description: '+1 Hand Size',
    rarity: 'rare',
    type: 'passive',
    price: 90,
    effect: {
      type: 'hand_size_boost',
      value: 1
    }
  },
  {
    id: 'thorns_ring',
    name: 'Thorns Ring',
    emoji: '🌹',
    description: 'Reflect 3 damage when attacked',
    rarity: 'epic',
    type: 'passive',
    price: 120,
    effect: {
      type: 'damage_reflection',
      value: 3
    }
  },
  {
    id: 'shield_amulet',
    name: 'Shield Amulet',
    emoji: '🛡️',
    description: 'Reduce all damage taken by 2',
    rarity: 'epic',
    type: 'passive',
    price: 130,
    effect: {
      type: 'damage_reduction',
      value: 2
    }
  },
  {
    id: 'regeneration_pendant',
    name: 'Regeneration Pendant',
    emoji: '✨',
    description: 'Heal 2 HP at the start of each turn',
    rarity: 'epic',
    type: 'passive',
    price: 110,
    effect: {
      type: 'regeneration',
      value: 2
    }
  }
];

// Item rarity configuration
export const ITEM_RARITY_CONFIG = {
  common: {
    name: 'Common',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    glowColor: 'shadow-gray-300',
    weight: 60
  },
  rare: {
    name: 'Rare',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-400',
    weight: 30
  },
  epic: {
    name: 'Epic',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-600',
    glowColor: 'shadow-purple-500',
    weight: 10
  }
};

// Get random item based on rarity weights
export const getRandomItemReward = () => {
  const roll = Math.random() * 100;
  let rarity = 'common';
  
  if (roll < 10) rarity = 'epic';
  else if (roll < 40) rarity = 'rare';
  
  const itemsOfRarity = ITEMS.filter(item => item.rarity === rarity);
  return itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
};