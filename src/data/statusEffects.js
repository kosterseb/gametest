// src/data/statusEffects.js

// Status type definitions with full details
export const STATUS_TYPES = {
  // DAMAGE OVER TIME (Player & Enemy)
  BURN: {
    id: 'burn',
    name: 'Burn',
    emoji: '🔥',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    description: 'Takes fire damage each turn. Increases by 1 each turn.',
    damagePerTurn: (stacks) => stacks + 1, // Escalating damage
    tickBehavior: 'escalate', // Increases each turn
    canStack: true,
    maxStacks: 10,
    visual: 'fire-particles'
  },
  
  POISON: {
    id: 'poison',
    name: 'Poison',
    emoji: '☠️',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    description: 'Takes poison damage each turn.',
    damagePerTurn: (stacks) => stacks * 3,
    tickBehavior: 'static', // Consistent damage
    canStack: true,
    maxStacks: 10,
    visual: 'poison-bubbles'
  },
  
  BLEED: {
    id: 'bleed',
    name: 'Bleed',
    emoji: '🩸',
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    description: 'Takes damage when taking any action.',
    damageOnAction: (stacks) => stacks * 2,
    canStack: true,
    maxStacks: 10,
    visual: 'blood-drip'
  },
  
  // DEBUFFS (Mostly on enemies)
  VULNERABLE: {
    id: 'vulnerable',
    name: 'Vulnerable',
    emoji: '💔',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500',
    description: 'Takes 50% more damage.',
    damageMultiplier: 1.5,
    canStack: false,
    duration: 3,
    visual: 'crack-effect'
  },
  
  WEAK: {
    id: 'weak',
    name: 'Weak',
    emoji: '💪',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500',
    description: 'Deals 25% less damage.',
    damageMultiplier: 0.75,
    canStack: false,
    duration: 3,
    visual: 'weakened-glow'
  },
  
  FREEZE: {
    id: 'freeze',
    name: 'Freeze',
    emoji: '❄️',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400',
    description: 'Cannot act next turn.',
    skipTurn: true,
    canStack: false,
    duration: 1,
    visual: 'ice-crystals'
  },
  
  STUN: {
    id: 'stun',
    name: 'Stun',
    emoji: '😵',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    description: 'Cannot act for 1 turn.',
    skipTurn: true,
    canStack: false,
    duration: 1,
    visual: 'stars-spinning'
  },
  
  SLOW: {
    id: 'slow',
    name: 'Slow',
    emoji: '🐌',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    description: 'Loses 1 energy per turn.',
    energyDrain: 1,
    canStack: true,
    maxStacks: 3,
    visual: 'slow-aura'
  },
  
  MARKED: {
    id: 'marked',
    name: 'Marked',
    emoji: '🎯',
    color: 'text-red-400',
    bgColor: 'bg-red-400',
    description: 'Next attack deals double damage.',
    nextAttackMultiplier: 2,
    canStack: false,
    duration: 2,
    consumeOnHit: true,
    visual: 'target-reticle'
  },
  
  CURSED: {
    id: 'cursed',
    name: 'Cursed',
    emoji: '👻',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600',
    description: 'Cards cost 1 more energy.',
    energyCostIncrease: 1,
    canStack: true,
    maxStacks: 3,
    visual: 'dark-wisps'
  },
  
  // BUFFS (Mostly on player)
  STRENGTH: {
    id: 'strength',
    name: 'Strength',
    emoji: '💪',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600',
    description: 'Deals more damage.',
    damageBoost: (stacks) => stacks * 3,
    canStack: true,
    maxStacks: 10,
    visual: 'power-aura'
  },
  
  SHIELD: {
    id: 'shield',
    name: 'Shield',
    emoji: '🛡️',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: 'Blocks incoming damage.',
    blockAmount: (stacks) => stacks,
    canStack: true,
    maxStacks: 99,
    consumeOnHit: true,
    visual: 'shield-glow'
  },
  
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration',
    emoji: '💚',
    color: 'text-green-400',
    bgColor: 'bg-green-400',
    description: 'Heals each turn.',
    healPerTurn: (stacks) => stacks * 2,
    canStack: true,
    maxStacks: 10,
    visual: 'heal-sparkles'
  },
  
  THORNS: {
    id: 'thorns',
    name: 'Thorns',
    emoji: '🌹',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    description: 'Reflects damage back to attacker.',
    reflectDamage: (stacks) => stacks * 2,
    canStack: true,
    maxStacks: 10,
    visual: 'thorn-barrier'
  },
  
  DODGE: {
    id: 'dodge',
    name: 'Dodge',
    emoji: '💨',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
    description: 'Avoid the next attack.',
    evadeNext: true,
    canStack: true,
    maxStacks: 3,
    consumeOnHit: true,
    visual: 'afterimage'
  },
  
  FOCUS: {
    id: 'focus',
    name: 'Focus',
    emoji: '🎯',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400',
    description: 'Cards cost 1 less energy.',
    energyCostReduction: 1,
    canStack: true,
    maxStacks: 3,
    visual: 'concentration-glow'
  },
  
  // SPECIAL
  DAZED: {
    id: 'dazed',
    name: 'Dazed',
    emoji: '😵‍💫',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
    description: 'Cards cost 1 more energy and draw 1 less card.',
    energyCostIncrease: 1,
    drawPenalty: 1,
    canStack: false,
    duration: 2,
    visual: 'dizzy-stars'
  },
  
  FRAGILE: {
    id: 'fragile',
    name: 'Fragile',
    emoji: '💥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400',
    description: 'Takes double damage from next hit.',
    nextDamageMultiplier: 2,
    canStack: false,
    consumeOnHit: true,
    visual: 'glass-shatter'
  },
  
  ENRAGED: {
    id: 'enraged',
    name: 'Enraged',
    emoji: '😡',
    color: 'text-red-700',
    bgColor: 'bg-red-700',
    description: 'Deals 50% more damage but takes 25% more damage.',
    damageMultiplier: 1.5,
    damageTakenMultiplier: 1.25,
    canStack: false,
    duration: 3,
    visual: 'rage-flames'
  }
};

// Helper to create a status instance
export const createStatus = (statusId, stacks = 1, duration = null) => {
  const statusType = STATUS_TYPES[statusId.toUpperCase()];
  
  if (!statusType) {
    console.error(`Status type ${statusId} not found`);
    return null;
  }
  
  return {
    type: statusId.toLowerCase(),
    stacks: statusType.canStack ? stacks : 1,
    duration: duration || statusType.duration || null,
    ...statusType
  };
};

// Apply status to a target's status array
export const applyStatus = (currentStatuses, newStatus) => {
  // ✅ ADD THIS NULL CHECK
  if (!currentStatuses) {
    currentStatuses = [];
  }
  
  const existingIndex = currentStatuses.findIndex(s => s.type === newStatus.type);
  
  if (existingIndex !== -1) {
    const existing = currentStatuses[existingIndex];
    
    // If can stack, add stacks
    if (newStatus.canStack) {
      const newStacks = Math.min(
        existing.stacks + newStatus.stacks,
        newStatus.maxStacks || 99
      );
      
      return [
        ...currentStatuses.slice(0, existingIndex),
        { ...existing, stacks: newStacks },
        ...currentStatuses.slice(existingIndex + 1)
      ];
    } else {
      // If can't stack, refresh duration
      return [
        ...currentStatuses.slice(0, existingIndex),
        { ...existing, duration: newStatus.duration },
        ...currentStatuses.slice(existingIndex + 1)
      ];
    }
  } else {
    // Add new status
    return [...currentStatuses, newStatus];
  }
};

// Remove a status
export const removeStatus = (currentStatuses, statusType) => {
  return currentStatuses.filter(s => s.type !== statusType);
};

// Tick all statuses (called at end of turn)
export const tickStatuses = (currentStatuses = []) => {
  // ✅ ADD NULL CHECK
  if (!currentStatuses || !Array.isArray(currentStatuses)) {
    return [];
  }
  
  return currentStatuses
    .map(status => {
      // Handle escalating damage (like Burn)
      if (status.tickBehavior === 'escalate') {
        return {
          ...status,
          stacks: status.stacks + 1
        };
      }
      
      // Decrease duration if it exists
      if (status.duration !== null) {
        return {
          ...status,
          duration: status.duration - 1
        };
      }
      
      return status;
    })
    .filter(status => {
      // Remove if duration expired
      if (status.duration !== null && status.duration <= 0) {
        return false;
      }
      return true;
    });
};

// Calculate total damage from DoT statuses
export const calculateStatusDamage = (statuses = []) => {
  // ✅ ADD NULL CHECK
  if (!statuses || !Array.isArray(statuses)) {
    return 0;
  }
  
  return statuses.reduce((total, status) => {
    if (status.damagePerTurn) {
      return total + status.damagePerTurn(status.stacks);
    }
    return total;
  }, 0);
};

// Calculate damage multiplier from statuses
export const calculateDamageMultiplier = (statuses = [], isDealing = true) => {
  let multiplier = 1;
  
  // ✅ ADD NULL CHECK
  if (!statuses || !Array.isArray(statuses)) {
    return multiplier;
  }
  
  statuses.forEach(status => {
    if (isDealing && status.damageMultiplier && status.id !== 'enraged') {
      multiplier *= status.damageMultiplier;
    }
    
    if (!isDealing && status.damageMultiplier && status.id === 'vulnerable') {
      multiplier *= status.damageMultiplier;
    }
    
    if (status.id === 'enraged') {
      multiplier *= isDealing ? status.damageMultiplier : status.damageTakenMultiplier;
    }
  });
  
  return multiplier;
};

// Get modified card energy cost
export const getModifiedCardCost = (baseCost, statuses = []) => {
  let cost = baseCost;
  
  // ✅ ADD NULL CHECK
  if (!statuses || !Array.isArray(statuses)) {
    return Math.max(0, cost);
  }
  
  statuses.forEach(status => {
    if (status.energyCostIncrease) {
      cost += status.energyCostIncrease * status.stacks;
    }
    if (status.energyCostReduction) {
      cost -= status.energyCostReduction * status.stacks;
    }
  });
  
  return Math.max(0, cost);
};

// Get damage boost from strength
export const getDamageBoost = (statuses = []) => {
  // ✅ ADD NULL CHECK
  if (!statuses || !Array.isArray(statuses)) {
    return 0;
  }
  
  return statuses.reduce((total, status) => {
    if (status.damageBoost) {
      return total + status.damageBoost(status.stacks);
    }
    return total;
  }, 0);
};

// Check if should skip turn
export const shouldSkipTurn = (statuses = []) => {
  // ✅ ADD NULL CHECK
  if (!statuses || !Array.isArray(statuses)) {
    return false;
  }
  
  return statuses.some(status => status.skipTurn);
};

// Apply shield blocking
export const applyShieldBlock = (statuses = [], incomingDamage) => {
  // ✅ ADD NULL CHECK
  if (!statuses || !Array.isArray(statuses)) {
    return { damage: incomingDamage, newStatuses: [] };
  }
  
  const shieldStatus = statuses.find(s => s.id === 'shield');
  
  if (!shieldStatus) {
    return { damage: incomingDamage, newStatuses: statuses };
  }
  
  const blockAmount = shieldStatus.blockAmount(shieldStatus.stacks);
  const blockedDamage = Math.min(blockAmount, incomingDamage);
  const remainingDamage = Math.max(0, incomingDamage - blockedDamage);
  const remainingShield = Math.max(0, blockAmount - incomingDamage);
  
  const newStatuses = remainingShield > 0
    ? statuses.map(s => s.id === 'shield' ? { ...s, stacks: remainingShield } : s)
    : statuses.filter(s => s.id !== 'shield');
  
  return {
    damage: remainingDamage,
    blocked: blockedDamage,
    newStatuses
  };
};

// Get modified damage (includes all multipliers)
export const getModifiedDamage = (baseDamage, attackerStatuses = [], defenderStatuses = []) => {
  let damage = baseDamage;
  
  // Add strength bonus
  damage += getDamageBoost(attackerStatuses);
  
  // Apply attacker multipliers (weak, etc)
  damage *= calculateDamageMultiplier(attackerStatuses, true);
  
  // Apply defender multipliers (vulnerable, etc)
  damage *= calculateDamageMultiplier(defenderStatuses, false);
  
  // Check for marked
  if (defenderStatuses && Array.isArray(defenderStatuses)) {
    const markedStatus = defenderStatuses.find(s => s.id === 'marked');
    if (markedStatus && markedStatus.nextAttackMultiplier) {
      damage *= markedStatus.nextAttackMultiplier;
    }
    
    // Check for fragile
    const fragileStatus = defenderStatuses.find(s => s.id === 'fragile');
    if (fragileStatus && fragileStatus.nextDamageMultiplier) {
      damage *= fragileStatus.nextDamageMultiplier;
    }
  }
  
  return Math.floor(damage);
};

// Card rarity colors (keep existing)
export const RARITY_CONFIG = {
  common: {
    name: 'Common',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    glowColor: 'shadow-gray-500/50'
  },
  rare: {
    name: 'Rare',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50'
  },
  epic: {
    name: 'Epic',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/50'
  },
  legendary: {
    name: 'Legendary',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    glowColor: 'shadow-orange-500/50'
  }
};

console.log('✨ Expanded status system loaded with', Object.keys(STATUS_TYPES).length, 'status types!');