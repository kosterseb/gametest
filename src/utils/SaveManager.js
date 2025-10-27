// src/utils/SaveManager.js

const SAVE_KEY_PREFIX = 'cardquest_save_';
const MAX_SAVE_SLOTS = 3;

// Default profile structure
export const createEmptyProfile = () => ({
  // Profile Info
  profileName: '',
  avatarSeed: '', // DiceBear seed
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  
  // Meta Progression
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  talentPoints: 0,
  unlockedTalents: [], // Array of talent IDs
  
  // Lifetime Stats
  lifetimeStats: {
    totalRuns: 0,
    totalWins: 0,
    totalDeaths: 0,
    bestFloor: 0,
    totalEnemiesKilled: 0,
    totalDamageDealt: 0,
    totalGoldEarned: 0,
    totalCardsPlayed: 0,
    totalItemsUsed: 0,
    bossesDefeated: 0,
    elitesDefeated: 0
  },
  
  // Current Run (gets reset after completion/death)
  currentRun: {
    active: false,
    floor: 1,
    act: 1,
    gold: 0,
    playerHealth: 100,
    maxPlayerHealth: 100,
    maxEnergy: 10,
    maxHandSize: 6,
    unlockedCards: [],
    selectedCardTypes: [],
    inventory: {
      bag: Array(8).fill(null),
      toolBelt: {
        consumables: [null, null],
        passive: null
      }
    },
    completedNodes: [],
    progressionMap: [],
    // Run stats
    currentRunStats: {
      enemiesKilled: 0,
      damageDealt: 0,
      goldEarned: 0,
      cardsPlayed: 0,
      itemsUsed: 0,
      floorsCleared: 0
    }
  },
  
  // Unlocks & Achievements
  achievements: [],
  unlockedStartingDecks: ['basic'], // Starting deck types unlocked
  
  // Settings
  settings: {
    showPreBattleLoadout: true,
    musicVolume: 0.5,
    sfxVolume: 0.7
  }
});

// Calculate XP needed for next level (exponential curve)
export const calculateXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

// Get all save slots
export const getAllSaveSlots = () => {
  const slots = [];
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const save = loadSave(i);
    slots.push({
      slotNumber: i,
      profile: save,
      isEmpty: save === null
    });
  }
  return slots;
};

// Save profile to specific slot
export const saveProfile = (slotNumber, profile) => {
  if (slotNumber < 1 || slotNumber > MAX_SAVE_SLOTS) {
    console.error('Invalid save slot number:', slotNumber);
    return false;
  }
  
  try {
    const saveData = {
      ...profile,
      lastPlayedAt: new Date().toISOString()
    };
    
    const key = SAVE_KEY_PREFIX + slotNumber;
    localStorage.setItem(key, JSON.stringify(saveData));
    console.log(`✅ Game saved to slot ${slotNumber}`);
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
};

// Load profile from specific slot
export const loadSave = (slotNumber) => {
  if (slotNumber < 1 || slotNumber > MAX_SAVE_SLOTS) {
    console.error('Invalid save slot number:', slotNumber);
    return null;
  }
  
  try {
    const key = SAVE_KEY_PREFIX + slotNumber;
    const savedData = localStorage.getItem(key);
    
    if (!savedData) {
      return null; // Empty slot
    }
    
    const profile = JSON.parse(savedData);
    console.log(`✅ Loaded save from slot ${slotNumber}`);
    return profile;
  } catch (error) {
    console.error('Error loading save:', error);
    return null;
  }
};

// Delete save slot
export const deleteSave = (slotNumber) => {
  if (slotNumber < 1 || slotNumber > MAX_SAVE_SLOTS) {
    console.error('Invalid save slot number:', slotNumber);
    return false;
  }
  
  try {
    const key = SAVE_KEY_PREFIX + slotNumber;
    localStorage.removeItem(key);
    console.log(`✅ Deleted save slot ${slotNumber}`);
    return true;
  } catch (error) {
    console.error('Error deleting save:', error);
    return false;
  }
};

// Create new profile in slot
export const createNewProfile = (slotNumber, profileName, avatarSeed) => {
  const profile = createEmptyProfile();
  profile.profileName = profileName;
  profile.avatarSeed = avatarSeed;
  
  return saveProfile(slotNumber, profile);
};

// Update run stats (called during gameplay)
export const updateRunStats = (profile, statUpdates) => {
  return {
    ...profile,
    currentRun: {
      ...profile.currentRun,
      currentRunStats: {
        ...profile.currentRun.currentRunStats,
        ...statUpdates
      }
    }
  };
};

// Add experience and check for level up
export const addExperience = (profile, xpAmount) => {
  let newProfile = { ...profile };
  let newXP = newProfile.experience + xpAmount;
  let leveledUp = false;
  let levelsGained = 0;
  
  // Check for level ups
  while (newXP >= newProfile.experienceToNextLevel) {
    newXP -= newProfile.experienceToNextLevel;
    newProfile.level += 1;
    newProfile.talentPoints += 1;
    levelsGained += 1;
    leveledUp = true;
    newProfile.experienceToNextLevel = calculateXPForLevel(newProfile.level);
  }
  
  newProfile.experience = newXP;
  
  return {
    profile: newProfile,
    leveledUp,
    levelsGained
  };
};

// Unlock talent (spend talent point)
export const unlockTalent = (profile, talentId) => {
  if (profile.talentPoints <= 0) {
    console.warn('No talent points available');
    return profile;
  }
  
  if (profile.unlockedTalents.includes(talentId)) {
    console.warn('Talent already unlocked:', talentId);
    return profile;
  }
  
  return {
    ...profile,
    talentPoints: profile.talentPoints - 1,
    unlockedTalents: [...profile.unlockedTalents, talentId]
  };
};

// Reset current run (soft reset - keeps meta progression)
export const resetCurrentRun = (profile) => {
  const emptyProfile = createEmptyProfile();
  
  return {
    ...profile,
    currentRun: {
      ...emptyProfile.currentRun,
      active: false
    }
  };
};

// Start new run
export const startNewRun = (profile) => {
  const emptyProfile = createEmptyProfile();
  
  return {
    ...profile,
    lifetimeStats: {
      ...profile.lifetimeStats,
      totalRuns: profile.lifetimeStats.totalRuns + 1
    },
    currentRun: {
      ...emptyProfile.currentRun,
      active: true
    }
  };
};

// End run (victory or defeat) - merge stats
export const endRun = (profile, victory = false) => {
  const runStats = profile.currentRun.currentRunStats;
  
  const updatedProfile = {
    ...profile,
    lifetimeStats: {
      ...profile.lifetimeStats,
      totalWins: victory ? profile.lifetimeStats.totalWins + 1 : profile.lifetimeStats.totalWins,
      totalDeaths: !victory ? profile.lifetimeStats.totalDeaths + 1 : profile.lifetimeStats.totalDeaths,
      bestFloor: Math.max(profile.lifetimeStats.bestFloor, profile.currentRun.floor),
      totalEnemiesKilled: profile.lifetimeStats.totalEnemiesKilled + runStats.enemiesKilled,
      totalDamageDealt: profile.lifetimeStats.totalDamageDealt + runStats.damageDealt,
      totalGoldEarned: profile.lifetimeStats.totalGoldEarned + runStats.goldEarned,
      totalCardsPlayed: profile.lifetimeStats.totalCardsPlayed + runStats.cardsPlayed,
      totalItemsUsed: profile.lifetimeStats.totalItemsUsed + runStats.itemsUsed
    }
  };
  
  return resetCurrentRun(updatedProfile);
};

// Get formatted play time
export const getTimeSinceLastPlayed = (profile) => {
  const lastPlayed = new Date(profile.lastPlayedAt);
  const now = new Date();
  const diffMs = now - lastPlayed;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Export save data (for backup)
export const exportSave = (slotNumber) => {
  const profile = loadSave(slotNumber);
  if (!profile) return null;
  
  return JSON.stringify(profile, null, 2);
};

// Import save data (from backup)
export const importSave = (slotNumber, saveDataString) => {
  try {
    const profile = JSON.parse(saveDataString);
    return saveProfile(slotNumber, profile);
  } catch (error) {
    console.error('Error importing save:', error);
    return false;
  }
};

console.log('💾 SaveManager loaded');