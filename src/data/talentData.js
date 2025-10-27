// src/data/talentData.js

export const talentPaths = {
    combat: {
      name: 'Combat',
      color: 'from-red-600 to-orange-500',
      icon: '⚔️',
      description: 'Increase your damage and offensive capabilities'
    },
    survival: {
      name: 'Survival',
      color: 'from-green-600 to-emerald-500',
      icon: '🛡️',
      description: 'Improve your defenses and sustainability'
    },
    economy: {
      name: 'Economy',
      color: 'from-yellow-600 to-amber-500',
      icon: '💰',
      description: 'Enhance your gold and shop benefits'
    },
    utility: {
      name: 'Utility',
      color: 'from-blue-600 to-cyan-500',
      icon: '⚙️',
      description: 'Unlock powerful utility features'
    }
  };
  
  // Talent Tree Structure
  export const talents = [
    // ========== COMBAT PATH ==========
    {
      id: 'combat_damage_1',
      name: 'Sharp Blade',
      path: 'combat',
      type: 'minor',
      cost: 1,
      icon: '🗡️',
      description: '+2% damage to all attacks',
      effect: { type: 'damage_boost', value: 0.02 },
      requires: [],
      row: 1,
      column: 1
    },
    {
      id: 'combat_damage_2',
      name: 'Keen Edge',
      path: 'combat',
      type: 'minor',
      cost: 1,
      icon: '🗡️',
      description: '+2% damage to all attacks',
      effect: { type: 'damage_boost', value: 0.02 },
      requires: ['combat_damage_1'],
      row: 2,
      column: 1
    },
    {
      id: 'combat_power',
      name: 'Power Strike',
      path: 'combat',
      type: 'major',
      cost: 2,
      icon: '💥',
      description: '+5 starting max HP and deal +5% damage',
      effect: { type: 'power_boost', hpBonus: 5, damageBoost: 0.05 },
      requires: ['combat_damage_2'],
      row: 3,
      column: 1
    },
    {
      id: 'combat_energy_1',
      name: 'Inner Focus',
      path: 'combat',
      type: 'minor',
      cost: 1,
      icon: '⚡',
      description: '+3% max energy',
      effect: { type: 'energy_boost', value: 0.03 },
      requires: ['combat_power'],
      row: 4,
      column: 1
    },
    {
      id: 'combat_energy_major',
      name: 'Battle Surge',
      path: 'combat',
      type: 'major',
      cost: 3,
      icon: '⚡',
      description: 'Start each battle with +2 energy',
      effect: { type: 'starting_energy', value: 2 },
      requires: ['combat_energy_1'],
      row: 5,
      column: 1
    },
  
    // ========== SURVIVAL PATH ==========
    {
      id: 'survival_hp_1',
      name: 'Tough Skin',
      path: 'survival',
      type: 'minor',
      cost: 1,
      icon: '❤️',
      description: '+3 max HP',
      effect: { type: 'health_boost', value: 3 },
      requires: [],
      row: 1,
      column: 2
    },
    {
      id: 'survival_hp_2',
      name: 'Hardened Body',
      path: 'survival',
      type: 'minor',
      cost: 1,
      icon: '❤️',
      description: '+3 max HP',
      effect: { type: 'health_boost', value: 3 },
      requires: ['survival_hp_1'],
      row: 2,
      column: 2
    },
    {
      id: 'survival_regen',
      name: 'Battle Mending',
      path: 'survival',
      type: 'major',
      cost: 2,
      icon: '💚',
      description: 'Heal 5 HP after each battle',
      effect: { type: 'post_battle_heal', value: 5 },
      requires: ['survival_hp_2'],
      row: 3,
      column: 2
    },
    {
      id: 'survival_defense_1',
      name: 'Sturdy Defense',
      path: 'survival',
      type: 'minor',
      cost: 1,
      icon: '🛡️',
      description: 'Reduce incoming damage by 1',
      effect: { type: 'damage_reduction', value: 1 },
      requires: ['survival_regen'],
      row: 4,
      column: 2
    },
    {
      id: 'survival_revive',
      name: 'Second Wind',
      path: 'survival',
      type: 'major',
      cost: 3,
      icon: '🔄',
      description: 'Revive once per run at 30% HP',
      effect: { type: 'revive', value: 0.3 },
      requires: ['survival_defense_1'],
      row: 5,
      column: 2
    },
  
    // ========== ECONOMY PATH ==========
    {
      id: 'economy_gold_1',
      name: 'Coin Finder',
      path: 'economy',
      type: 'minor',
      cost: 1,
      icon: '💰',
      description: '+5% gold from battles',
      effect: { type: 'gold_boost', value: 0.05 },
      requires: [],
      row: 1,
      column: 3
    },
    {
      id: 'economy_gold_2',
      name: 'Treasure Hunter',
      path: 'economy',
      type: 'minor',
      cost: 1,
      icon: '💰',
      description: '+5% gold from battles',
      effect: { type: 'gold_boost', value: 0.05 },
      requires: ['economy_gold_1'],
      row: 2,
      column: 3
    },
    {
      id: 'economy_starting_gold',
      name: 'Wealthy Start',
      path: 'economy',
      type: 'major',
      cost: 2,
      icon: '💎',
      description: 'Start each run with 50 gold',
      effect: { type: 'starting_gold', value: 50 },
      requires: ['economy_gold_2'],
      row: 3,
      column: 3
    },
    {
      id: 'economy_discount_1',
      name: 'Haggler',
      path: 'economy',
      type: 'minor',
      cost: 1,
      icon: '🏷️',
      description: 'Shop items 5% cheaper',
      effect: { type: 'shop_discount', value: 0.05 },
      requires: ['economy_starting_gold'],
      row: 4,
      column: 3
    },
    {
      id: 'economy_rare_items',
      name: 'Fortune Favored',
      path: 'economy',
      type: 'major',
      cost: 3,
      icon: '🌟',
      description: 'Elite enemies have 20% higher item drop rate',
      effect: { type: 'item_drop_boost', value: 0.20 },
      requires: ['economy_discount_1'],
      row: 5,
      column: 3
    },
  
    // ========== UTILITY PATH ==========
    {
      id: 'utility_hand_1',
      name: 'Card Memory',
      path: 'utility',
      type: 'minor',
      cost: 1,
      icon: '🎴',
      description: '+1 max hand size',
      effect: { type: 'hand_size_boost', value: 1 },
      requires: [],
      row: 1,
      column: 4
    },
    {
      id: 'utility_deck_1',
      name: 'Deck Builder',
      path: 'utility',
      type: 'minor',
      cost: 1,
      icon: '📚',
      description: '+1 max deck size',
      effect: { type: 'deck_size_boost', value: 1 },
      requires: ['utility_hand_1'],
      row: 2,
      column: 4
    },
    {
      id: 'utility_draw',
      name: 'Card Master',
      path: 'utility',
      type: 'major',
      cost: 2,
      icon: '🃏',
      description: 'Draw +1 card at the start of each turn',
      effect: { type: 'draw_bonus', value: 1 },
      requires: ['utility_deck_1'],
      row: 3,
      column: 4
    },
    {
      id: 'utility_item_slot',
      name: 'Adventurer\'s Pack',
      path: 'utility',
      type: 'minor',
      cost: 1,
      icon: '🎒',
      description: '+2 bag slots',
      effect: { type: 'bag_size_boost', value: 2 },
      requires: ['utility_draw'],
      row: 4,
      column: 4
    },
    {
      id: 'utility_instant_heal',
      name: 'Emergency Skip',
      path: 'utility',
      type: 'major',
      cost: 3,
      icon: '✨',
      description: 'Can skip reward screens for instant 15 HP heal',
      effect: { type: 'skip_for_heal', value: 15 },
      requires: ['utility_item_slot'],
      row: 5,
      column: 4
    },
  
    // ========== CROSS-PATH SYNERGIES ==========
    {
      id: 'synergy_warrior',
      name: 'Battle Veteran',
      path: 'combat',
      type: 'major',
      cost: 3,
      icon: '⚔️',
      description: '+10 max HP and +3% damage',
      effect: { type: 'warrior_synergy', hpBonus: 10, damageBoost: 0.03 },
      requires: ['combat_energy_major', 'survival_regen'],
      row: 6,
      column: 1.5
    },
    {
      id: 'synergy_merchant',
      name: 'Master Trader',
      path: 'economy',
      type: 'major',
      cost: 3,
      icon: '💼',
      description: '15% shop discount and +10% gold',
      effect: { type: 'merchant_synergy', discount: 0.15, goldBoost: 0.10 },
      requires: ['economy_rare_items', 'utility_draw'],
      row: 6,
      column: 3.5
    }
  ];
  
  // Helper function to check if a talent can be unlocked
  export const canUnlockTalent = (talentId, unlockedTalents) => {
    const talent = talents.find(t => t.id === talentId);
    if (!talent) return false;
  
    // Check if already unlocked
    if (unlockedTalents.includes(talentId)) return false;
  
    // Check prerequisites
    if (talent.requires.length === 0) return true;
  
    return talent.requires.every(reqId => unlockedTalents.includes(reqId));
  };
  
  // Helper function to get available talents (can be unlocked with current progress)
  export const getAvailableTalents = (unlockedTalents) => {
    return talents.filter(talent => 
      !unlockedTalents.includes(talent.id) && 
      canUnlockTalent(talent.id, unlockedTalents)
    );
  };
  
  // Helper function to get talent by ID
  export const getTalentById = (talentId) => {
    return talents.find(t => t.id === talentId);
  };
  
  console.log('🌳 Talent system loaded:', talents.length, 'talents');