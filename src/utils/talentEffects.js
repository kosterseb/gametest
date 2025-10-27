/**
 * Talent Effects Utility
 * Applies permanent talent-based bonuses to combat
 */

/**
 * Apply damage bonus from unlocked combat talents
 * @param {number} baseDamage - Base damage before talent bonuses
 * @param {string[]} unlockedTalents - Array of unlocked talent IDs
 * @returns {number} - Final damage after talent bonuses
 */
export const applyTalentDamageBonus = (baseDamage, unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return baseDamage;
    }
  
    let finalDamage = baseDamage;
  
    // Combat Path Talents
    if (unlockedTalents.includes('combat_mastery_1')) {
      finalDamage += 2;
    }
  
    if (unlockedTalents.includes('combat_mastery_2')) {
      finalDamage += 3;
    }
  
    if (unlockedTalents.includes('power_strike')) {
      finalDamage = Math.floor(finalDamage * 1.15);
    }
  
    if (unlockedTalents.includes('devastating_blow')) {
      finalDamage = Math.floor(finalDamage * 1.25);
    }
  
    if (unlockedTalents.includes('critical_mastery')) {
      if (Math.random() < 0.2) {
        finalDamage = finalDamage * 2;
      }
    }
  
    if (unlockedTalents.includes('berserker_rage')) {
      finalDamage = Math.floor(finalDamage * 1.1);
    }
  
    if (unlockedTalents.includes('blood_fury')) {
      finalDamage = Math.floor(finalDamage * 1.2);
    }
  
    if (unlockedTalents.includes('precision_strikes')) {
      finalDamage += 1;
    }
  
    if (unlockedTalents.includes('deadly_strikes')) {
      finalDamage += 2;
    }
  
    return Math.floor(finalDamage);
  };
  
  /**
   * Apply healing bonus from unlocked recovery talents
   */
  export const applyTalentHealingBonus = (baseHealing, unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return baseHealing;
    }
  
    let finalHealing = baseHealing;
  
    if (unlockedTalents.includes('vitality_1')) {
      finalHealing = Math.floor(finalHealing * 1.1);
    }
  
    if (unlockedTalents.includes('vitality_2')) {
      finalHealing = Math.floor(finalHealing * 1.2);
    }
  
    if (unlockedTalents.includes('regeneration_mastery')) {
      finalHealing = Math.floor(finalHealing * 1.3);
    }
  
    return Math.floor(finalHealing);
  };
  
  /**
   * Get starting energy bonus from talents
   */
  export const getTalentEnergyBonus = (unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return 0;
    }
  
    let bonus = 0;
  
    if (unlockedTalents.includes('energy_boost_1')) {
      bonus += 1;
    }
  
    if (unlockedTalents.includes('energy_boost_2')) {
      bonus += 2;
    }
  
    if (unlockedTalents.includes('energy_mastery')) {
      bonus += 3;
    }
  
    return bonus;
  };
  
  /**
   * Get card draw bonus from talents
   */
  export const getTalentDrawBonus = (unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return 0;
    }
  
    let bonus = 0;
  
    if (unlockedTalents.includes('card_draw_1')) {
      bonus += 1;
    }
  
    if (unlockedTalents.includes('card_draw_2')) {
      bonus += 1;
    }
  
    return bonus;
  };
  
  /**
   * Check if player has damage reduction talent
   */
  export const hasDamageReduction = (unlockedTalents) => {
    if (!unlockedTalents) return false;
    
    return unlockedTalents.includes('damage_reduction') || 
           unlockedTalents.includes('iron_skin') ||
           unlockedTalents.includes('tank');
  };
  
  /**
   * Apply damage reduction from talents
   */
  export const applyTalentDamageReduction = (incomingDamage, unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return incomingDamage;
    }
  
    let finalDamage = incomingDamage;
  
    if (unlockedTalents.includes('damage_reduction')) {
      finalDamage = Math.floor(finalDamage * 0.95);
    }
  
    if (unlockedTalents.includes('iron_skin')) {
      finalDamage = Math.floor(finalDamage * 0.9);
    }
  
    if (unlockedTalents.includes('tank')) {
      finalDamage = Math.floor(finalDamage * 0.85);
    }
  
    return Math.floor(Math.max(1, finalDamage));
  };
  
  /**
   * Check if player should gain bonus gold from talents
   */
  export const getGoldMultiplier = (unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return 1.0;
    }
  
    let multiplier = 1.0;
  
    if (unlockedTalents.includes('gold_finder')) {
      multiplier += 0.1;
    }
  
    if (unlockedTalents.includes('treasure_hunter')) {
      multiplier += 0.2;
    }
  
    if (unlockedTalents.includes('fortune')) {
      multiplier += 0.3;
    }
  
    return multiplier;
  };
  
  /**
   * Get starting health bonus from talents
   */
  export const getTalentHealthBonus = (unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return 0;
    }
  
    let bonus = 0;
  
    if (unlockedTalents.includes('health_boost_1')) {
      bonus += 10;
    }
  
    if (unlockedTalents.includes('health_boost_2')) {
      bonus += 20;
    }
  
    if (unlockedTalents.includes('health_boost_3')) {
      bonus += 30;
    }
  
    if (unlockedTalents.includes('vitality_major')) {
      bonus += 50;
    }
  
    return bonus;
  };
  
  /**
   * Apply all talent effects at battle start
   */
  export const applyBattleStartTalents = (gameState, unlockedTalents) => {
    const effects = {
      bonusEnergy: getTalentEnergyBonus(unlockedTalents),
      bonusCards: getTalentDrawBonus(unlockedTalents),
      damageReduction: hasDamageReduction(unlockedTalents),
    };
  
    return effects;
  };
  
  /**
   * Apply talent bonuses when starting a new run
   * This adjusts starting stats based on unlocked talents
   */
  export const applyTalentBonusesToRunStart = (baseStats, unlockedTalents) => {
    if (!unlockedTalents || unlockedTalents.length === 0) {
      return baseStats;
    }
  
    const modifiedStats = { ...baseStats };
  
    // Apply health bonuses
    const healthBonus = getTalentHealthBonus(unlockedTalents);
    if (healthBonus > 0) {
      modifiedStats.maxPlayerHealth = (modifiedStats.maxPlayerHealth || 100) + healthBonus;
      modifiedStats.playerHealth = (modifiedStats.playerHealth || 100) + healthBonus;
    }
  
    // Apply energy bonuses
    const energyBonus = getTalentEnergyBonus(unlockedTalents);
    if (energyBonus > 0) {
      modifiedStats.maxEnergy = (modifiedStats.maxEnergy || 10) + energyBonus;
    }
  
    // Apply hand size bonuses
    const drawBonus = getTalentDrawBonus(unlockedTalents);
    if (drawBonus > 0) {
      modifiedStats.maxHandSize = (modifiedStats.maxHandSize || 6) + drawBonus;
    }
  
    // Apply starting gold bonus if talent exists
    if (unlockedTalents.includes('starting_gold')) {
      modifiedStats.gold = (modifiedStats.gold || 0) + 50;
    }
  
    if (unlockedTalents.includes('wealthy_start')) {
      modifiedStats.gold = (modifiedStats.gold || 0) + 100;
    }
  
    return modifiedStats;
  };