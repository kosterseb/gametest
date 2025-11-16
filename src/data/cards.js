
// Card spawn weight system
const CARD_WEIGHTS = {
  damage: 50,    // 50% chance
  utility: 30,   // 30% chance
  heal: 10,      // 10% chance 
  cleanse: 10    // 10% chance 
};

// Rarity weights for drops
export const RARITY_WEIGHTS = {
  common: 60,
  rare: 30,
  epic: 10
};

export const cardTemplates = [
  // ==================== COMMON DAMAGE CARDS ====================
  {
    name: "Quick Jab",
    type: "damage",
    description: "Deal 15 damage",
    baseDamage: 15,
    energyCost: 2,
    weight: 'damage',
    rarity: 'common'
  },
  {
    name: "Power Slam",
    type: "damage",
    description: "Deal 22 damage",
    baseDamage: 22,
    energyCost: 3,
    weight: 'damage',
    rarity: 'common'
  },
  {
    name: "Swift Strike",
    type: "damage",
    description: "Deal 12 damage",
    baseDamage: 12,
    energyCost: 1,
    weight: 'damage',
    rarity: 'common'
  },
  {
    name: "Heavy Blow",
    type: "damage",
    description: "Deal 18 damage",
    baseDamage: 18,
    energyCost: 2,
    weight: 'damage',
    rarity: 'common'
  },

  // ==================== RARE DAMAGE CARDS ====================
  {
    name: "Lucky Strike",
    type: "damage",
    description: "Roll dice for bonus damage",
    diceRoll: true,
    baseDamage: 18,
    energyCost: 3,
    weight: 'damage',
    rarity: 'rare'
  },
  {
    name: "Crushing Hammer",
    type: "damage",
    description: "Deal 28 damage",
    baseDamage: 28,
    energyCost: 4,
    weight: 'damage',
    rarity: 'rare'
  },
  {
    name: "Double Tap",
    type: "damage",
    description: "Deal 10 damage twice",
    baseDamage: 10,
    energyCost: 3,
    weight: 'damage',
    rarity: 'rare',
    multiHit: 2
  },
  {
    name: "Execute",
    type: "damage",
    description: "Deal 35 damage if enemy below 30% HP",
    baseDamage: 20,
    energyCost: 3,
    weight: 'damage',
    rarity: 'rare',
    conditional: 'execute'
  },

  // ==================== EPIC DAMAGE CARDS ====================
  {
    name: "Devastating Blow",
    type: "damage",
    description: "Deal 40 damage",
    baseDamage: 40,
    energyCost: 5,
    weight: 'damage',
    rarity: 'epic'
  },
  {
    name: "Meteor Strike",
    type: "damage",
    description: "Deal 35 damage, take 5 recoil",
    baseDamage: 35,
    energyCost: 3,
    weight: 'damage',
    rarity: 'epic',
    selfDamage: 5
  },
  {
    name: "Blade Flurry",
    type: "damage",
    description: "Deal 8 damage three times",
    baseDamage: 8,
    energyCost: 3,
    weight: 'damage',
    rarity: 'epic',
    multiHit: 3
  },

  // ==================== COMMON HEAL CARDS ====================
  {
    name: "First Aid",
    type: "heal",
    description: "Heal 18 HP",
    baseHeal: 18,
    energyCost: 2,
    weight: 'heal',
    rarity: 'common'
  },
  {
    name: "Minor Heal",
    type: "heal",
    description: "Heal 12 HP",
    baseHeal: 12,
    energyCost: 1,
    weight: 'heal',
    rarity: 'common'
  },

  // ==================== RARE HEAL CARDS ====================
  {
    name: "Healing Potion",
    type: "heal",
    description: "Roll dice to heal",
    diceRoll: true,
    baseHeal: 12,
    energyCost: 3,
    weight: 'heal',
    rarity: 'rare'
  },
  {
    name: "Big Heal",
    type: "heal",
    description: "Heal 25 HP",
    baseHeal: 25,
    energyCost: 3,
    weight: 'heal',
    rarity: 'rare'
  },
  {
    name: "Regeneration",
    type: "heal",
    description: "Heal 10 HP and draw 1 card",
    baseHeal: 10,
    energyCost: 2,
    weight: 'heal',
    rarity: 'rare',
    bonusEffect: 'draw'
  },

  // ==================== EPIC HEAL CARDS ====================
  {
    name: "Full Restore",
    type: "heal",
    description: "Heal 40 HP",
    baseHeal: 40,
    energyCost: 4,
    weight: 'heal',
    rarity: 'epic'
  },
  {
    name: "Miracle Cure",
    type: "heal",
    description: "Heal 30 HP and remove all statuses",
    baseHeal: 30,
    energyCost: 4,
    weight: 'heal',
    rarity: 'epic',
    bonusEffect: 'cleanse_all'
  },

  // ==================== COMMON UTILITY CARDS ====================
  {
    name: "Shield Wall",
    type: "utility",
    description: "Gain 10 shield",
    effect: "shield",
    shieldAmount: 10,
    energyCost: 1,
    weight: 'utility',
    rarity: 'common'
  },
  {
    name: "Card Draw",
    type: "utility",
    description: "Draw 1 card",
    effect: "draw",
    energyCost: 1,
    weight: 'utility',
    rarity: 'common'
  },
  {
    name: "Energy Boost",
    type: "utility",
    description: "Gain 2 energy",
    effect: "energy",
    energyCost: 0,
    weight: 'utility',
    rarity: 'common'
  },
  {
    name: "Focus",
    type: "utility",
    description: "Gain 3 energy",
    effect: "energy",
    energyCost: 1,
    weight: 'utility',
    rarity: 'common'
  },

  // ==================== RARE UTILITY CARDS ====================
  {
    name: "Lucky Draw",
    type: "utility",
    description: "Roll dice, draw that many cards",
    diceRoll: true,
    effect: "drawRoll",
    energyCost: 3,
    weight: 'utility',
    rarity: 'rare'
  },
  {
    name: "Second Wind",
    type: "utility",
    description: "Draw 2 cards and gain 2 energy",
    effect: "draw_energy",
    energyCost: 1,
    weight: 'utility',
    rarity: 'rare'
  },
  {
    name: "Preparation",
    type: "utility",
    description: "Draw 3 cards",
    effect: "draw_multi",
    energyCost: 2,
    weight: 'utility',
    rarity: 'rare'
  },
  {
    name: "Fortify",
    type: "utility",
    description: "Gain 5 armor (not implemented)",
    effect: "armor",
    energyCost: 2,
    weight: 'utility',
    rarity: 'rare'
  },

  // ==================== EPIC UTILITY CARDS ====================
  {
    name: "Time Warp",
    type: "utility",
    description: "Gain 8 energy",
    effect: "energy_large",
    energyCost: 0,
    weight: 'utility',
    rarity: 'epic'
  },
  {
    name: "Master Plan",
    type: "utility",
    description: "Draw 4 cards and gain 3 energy",
    effect: "master_plan",
    energyCost: 2,
    weight: 'utility',
    rarity: 'epic'
  },
  {
    name: "Adrenaline Rush",
    type: "utility",
    description: "Draw 2 cards, gain 4 energy, heal 10 HP",
    effect: "adrenaline",
    energyCost: 1,
    weight: 'utility',
    rarity: 'epic'
  },

  // ==================== COMMON CLEANSE CARDS ====================
  {
    name: "Antidote",
    type: "cleanse",
    description: "Remove Poison",
    effect: "cleanse_poison",
    energyCost: 1,
    weight: 'cleanse',
    rarity: 'common'
  },
  {
    name: "Clear Mind",
    type: "cleanse",
    description: "Remove Dazed",
    effect: "cleanse_dazed",
    energyCost: 1,
    weight: 'cleanse',
    rarity: 'common'
  },
  {
    name: "Bandage",
    type: "cleanse",
    description: "Remove Bleed + heal 5 HP",
    effect: "cleanse_bleed",
    baseHeal: 5,
    energyCost: 2,
    weight: 'cleanse',
    rarity: 'common'
  },

  // ==================== RARE CLEANSE CARDS ====================
  {
    name: "Purify",
    type: "cleanse",
    description: "Remove ALL status effects",
    effect: "cleanse_all",
    energyCost: 2,
    weight: 'cleanse',
    rarity: 'rare'
  },
  {
    name: "Cleansing Fire",
    type: "cleanse",
    description: "Remove all statuses and heal 15 HP",
    effect: "cleanse_all",
    baseHeal: 15,
    energyCost: 3,
    weight: 'cleanse',
    rarity: 'rare'
  },

  // ==================== BUFF CARDS (PLAYER STATUS) ====================
  {
    name: "Battle Cry",
    type: "utility",
    description: "Gain Strength 3 (deal +3 damage per stack)",
    effect: "buff_strength",
    statusEffect: {
      type: 'strength',
      stacks: 3
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'common'
  },
  {
    name: "Regenerate",
    type: "utility",
    description: "Gain Regeneration 2 (heal 4 HP per turn)",
    effect: "buff_regeneration",
    statusEffect: {
      type: 'regeneration',
      stacks: 2
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'common'
  },
  {
    name: "Evasion",
    type: "utility",
    description: "Gain Dodge 1 (avoid next attack)",
    effect: "buff_dodge",
    statusEffect: {
      type: 'dodge',
      stacks: 1
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'rare'
  },
  {
    name: "Thorny Armor",
    type: "utility",
    description: "Gain Thorns 3 (reflect 6 damage)",
    effect: "buff_thorns",
    statusEffect: {
      type: 'thorns',
      stacks: 3
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'rare'
  },
  {
    name: "Power Surge",
    type: "utility",
    description: "Gain Strength 5 (deal +5 damage per stack)",
    effect: "buff_strength",
    statusEffect: {
      type: 'strength',
      stacks: 5
    },
    energyCost: 3,
    weight: 'utility',
    rarity: 'epic'
  },
  {
    name: "Divine Protection",
    type: "utility",
    description: "Gain Shield 15 and Dodge 1",
    effect: "buff_shield_dodge",
    statusEffect: [
      { type: 'shield', stacks: 15 },
      { type: 'dodge', stacks: 1 }
    ],
    energyCost: 3,
    weight: 'utility',
    rarity: 'epic'
  },

  // ==================== COUNTER CARDS ====================
  {
    name: "Perfect Block",
    type: "counter",
    description: "COUNTER: Block enemy attack completely",
    effect: "counter_block",
    counterEffect: {
      type: 'block',
      blockAmount: 'all'
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'rare',
    isCounter: true
  },
  {
    name: "Riposte",
    type: "counter",
    description: "COUNTER: Block attack and deal 15 damage back",
    effect: "counter_riposte",
    counterEffect: {
      type: 'block_and_damage',
      blockAmount: 'all',
      damageBack: 15
    },
    energyCost: 3,
    weight: 'utility',
    rarity: 'rare',
    isCounter: true
  },
  {
    name: "Counter Strike",
    type: "counter",
    description: "COUNTER: Reduce damage by 50% and deal 20 damage",
    effect: "counter_strike",
    counterEffect: {
      type: 'reduce_and_damage',
      reduction: 0.5,
      damageBack: 20
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'common',
    isCounter: true
  },
  {
    name: "Lucky Counter",
    type: "counter",
    description: "COUNTER: Roll dice - on 4+ block attack and deal damage equal to roll × 5",
    effect: "counter_dice",
    diceRoll: true,
    counterEffect: {
      type: 'dice_counter',
      threshold: 4,
      damageMultiplier: 5
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'epic',
    isCounter: true
  },
  {
    name: "Parry",
    type: "counter",
    description: "COUNTER: Block attack and gain Shield 10",
    effect: "counter_parry",
    counterEffect: {
      type: 'block_and_shield',
      blockAmount: 'all',
      shieldGain: 10
    },
    energyCost: 2,
    weight: 'utility',
    rarity: 'rare',
    isCounter: true
  }
];

// Weighted random card selection
export const getRandomCard = () => {
  const totalWeight = Object.values(CARD_WEIGHTS).reduce((sum, w) => sum + w, 0);
  const roll = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  let selectedType = 'damage';

  for (const [type, weight] of Object.entries(CARD_WEIGHTS)) {
    cumulativeWeight += weight;
    if (roll <= cumulativeWeight) {
      selectedType = type;
      break;
    }
  }

  const cardsOfType = cardTemplates.filter(card => card.weight === selectedType);
  return cardsOfType[Math.floor(Math.random() * cardsOfType.length)];
};

// Get random card by rarity
export const getRandomCardByRarity = (rarity) => {
  const cardsOfRarity = cardTemplates.filter(card => card.rarity === rarity);
  if (cardsOfRarity.length === 0) return getRandomCard();
  return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
};

// Roll for card rarity based on weights
export const rollCardRarity = (customWeights = RARITY_WEIGHTS) => {
  const totalWeight = Object.values(customWeights).reduce((sum, w) => sum + w, 0);
  const roll = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const [rarity, weight] of Object.entries(customWeights)) {
    cumulativeWeight += weight;
    if (roll <= cumulativeWeight) {
      return rarity;
    }
  }

  return;
};

// Get card reward options (for post-battle)
export const getCardRewardOptions = (count = 3, rarityWeights = RARITY_WEIGHTS) => {
  const options = [];

  for (let i = 0; i < count; i++) {
    const rarity = rollCardRarity(rarityWeights);
    const card = getRandomCardByRarity(rarity);
    options.push(card);
  }

  return options;
};