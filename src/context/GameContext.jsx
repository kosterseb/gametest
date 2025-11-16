import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cardTemplates, getRandomCard } from '../data/cards';
import { getItemById } from '../data/items';
import {
  saveProfile,
  loadSave,
  addExperience,
  unlockTalent,
  updateRunStats,
  endRun,
  startNewRun
} from '../utils/SaveManager';
import { applyTalentBonusesToRunStart } from '../utils/talentEffects';
import { applyStatus, tickStatuses, calculateStatusDamage } from '../data/statusEffects';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

// Helper function to apply status effects (handles stacking for Bleed)


// Helper function to tick statuses (apply damage, reduce duration)


const initialGameState = {
  // PROFILE SYSTEM (NEW)
  currentSaveSlot: null, // Which save slot is loaded (1, 2, or 3)
  profile: null, // Full profile data from SaveManager

  // BATTLE STATE
  playerHealth: 100,
  maxPlayerHealth: 100,
  enemyHealth: 70,
  playerHand: [],
  battleNumber: 1,
  playerEnergy: 10,
  maxEnergy: 10,
  maxHandSize: 6,
  turnCount: 0,
  battleLog: [],
  currentEnemyIndex: 0,
  currentEnemyData: null,

  // MAP FIELDS
  campaignMode: 'random',
  progressionMap: [],
  currentFloor: 1,
  currentAct: 1,
  completedNodes: [],
  selectedNodeId: null,
  jokerBonus: null,

  // BRANCHING TREE SYSTEM
  useBranchingPaths: true, // Toggle to enable new branching system
  branchingMap: [], // New map structure: array of act objects with biome options
  selectedBiome: null, // Currently selected biome (e.g., 'act1_swamp')
  completedNodeIds: [], // Array of completed node IDs in the tree
  availableNodeIds: [], // Array of currently available node IDs
  biomeLocked: false, // True once player selects a biome for current act

  gold: 0,

  // Boss/Elite tracking
  bossesDefeated: 0,
  elitesDefeated: 0,

  // PHASE C: Ability Unlocks
  hasDrawAbility: false,
  hasDiscardAbility: false,
  drawAbilityUnlocked: false,
  discardAbilityUnlocked: false,
  inventoryUpgradeUnlocked: false,

  // Upgrade Purchase Tracking
  healthUpgradesPurchased: 0,
  energyUpgradesPurchased: 0,
  handSizeUpgradesPurchased: 0,

  // PHASE B: Status Effects
  playerStatuses: [],
  enemyStatuses: [],

  // TALENTS
  hasUsedRevive: false,

  // PHASE 1 - DECK MANAGEMENT
  unlockedCards: [],
  selectedCardTypes: [],
  maxSelectedCards: 6,
  allCardsUnlocked: false,

  // CARD REWARD SYSTEM
  shouldShowCardReward: false,
  cardRewardRarity: null,

  // PHASE 2: INVENTORY SYSTEM
  inventory: {
    bag: Array(8).fill(null),
    toolBelt: {
      consumables: [null, null],
      passive: null
    }
  },
  maxBagSize: 8,
  maxConsumableSlots: 2,
  maxPassiveSlots: 1,
  activeItemEffects: {},
  showPreBattleLoadout: true,
  prefer3DView: true, // User preference for 3D map view

  // Tutorial completion tracking
  tutorialCompleted: false, // Battle tutorial
  mapTutorialCompleted: false, // Map tutorial

  // Inventory upgrades purchased
  bagUpgradesPurchased: 0,
  consumableUpgradesPurchased: 0,
  passiveUpgradesPurchased: 0,

  // ITEM REWARD SYSTEM
  pendingItemRewards: [],
  shouldShowItemReward: false,

  // MENU CONTROL
  menuOpen: false,
  menuTab: 'deck',
};

const gameReducer = (state, action) => {
  switch (action.type) {
    // ========== PROFILE & SAVE SYSTEM ==========
    case 'LOAD_PROFILE':
      const loadedProfile = action.profile;
      return {
        ...state,
        currentSaveSlot: action.slotNumber,
        profile: loadedProfile,
        // Load current run data if active
        ...(loadedProfile.currentRun.active ? {
          currentFloor: loadedProfile.currentRun.floor,
          currentAct: loadedProfile.currentRun.act,
          gold: loadedProfile.currentRun.gold,
          playerHealth: loadedProfile.currentRun.playerHealth,
          maxPlayerHealth: loadedProfile.currentRun.maxPlayerHealth,
          maxEnergy: loadedProfile.currentRun.maxEnergy,
          maxHandSize: loadedProfile.currentRun.maxHandSize,
          unlockedCards: loadedProfile.currentRun.unlockedCards,
          selectedCardTypes: loadedProfile.currentRun.selectedCardTypes,
          inventory: loadedProfile.currentRun.inventory,
          completedNodes: loadedProfile.currentRun.completedNodes,
          progressionMap: loadedProfile.currentRun.progressionMap,
          branchingMap: loadedProfile.currentRun.branchingMap || [],
          selectedBiome: loadedProfile.currentRun.selectedBiome || null,
          biomeLocked: loadedProfile.currentRun.biomeLocked || false,
          availableNodeIds: loadedProfile.currentRun.availableNodeIds || [],
          completedNodeIds: loadedProfile.currentRun.completedNodeIds || [],
          showPreBattleLoadout: loadedProfile.settings.showPreBattleLoadout,
          prefer3DView: loadedProfile.settings.prefer3DView !== undefined ? loadedProfile.settings.prefer3DView : true
        } : {})
      };

    case 'SAVE_PROFILE':
      if (state.currentSaveSlot && state.profile) {
        // Update profile with current run data
        const updatedProfile = {
          ...state.profile,
          currentRun: {
            ...state.profile.currentRun,
            active: true,
            floor: state.currentFloor,
            act: state.currentAct,
            gold: state.gold,
            playerHealth: state.playerHealth,
            maxPlayerHealth: state.maxPlayerHealth,
            maxEnergy: state.maxEnergy,
            maxHandSize: state.maxHandSize,
            unlockedCards: state.unlockedCards,
            selectedCardTypes: state.selectedCardTypes,
            inventory: state.inventory,
            completedNodes: state.completedNodes,
            progressionMap: state.progressionMap,
            branchingMap: state.branchingMap,
            selectedBiome: state.selectedBiome,
            biomeLocked: state.biomeLocked,
            availableNodeIds: state.availableNodeIds,
            completedNodeIds: state.completedNodeIds
          },
          settings: {
            ...state.profile.settings,
            showPreBattleLoadout: state.showPreBattleLoadout,
            prefer3DView: state.prefer3DView
          }
        };

        saveProfile(state.currentSaveSlot, updatedProfile);
        return {
          ...state,
          profile: updatedProfile
        };
      }
      return state;

    case 'ADD_EXPERIENCE':
      if (!state.profile) return state;

      const xpResult = addExperience(state.profile, action.amount);

      // Auto-save after XP gain
      if (state.currentSaveSlot) {
        saveProfile(state.currentSaveSlot, xpResult.profile);
      }

      return {
        ...state,
        profile: xpResult.profile
      };

    case 'UNLOCK_TALENT':
      if (!state.profile) return state;

      const updatedProfileWithTalent = unlockTalent(state.profile, action.talentId);

      // Auto-save after talent unlock
      if (state.currentSaveSlot) {
        saveProfile(state.currentSaveSlot, updatedProfileWithTalent);
      }

      return {
        ...state,
        profile: updatedProfileWithTalent
      };

    case 'UPDATE_RUN_STATS':
      if (!state.profile) return state;

      const updatedProfileWithStats = updateRunStats(state.profile, action.stats);

      return {
        ...state,
        profile: updatedProfileWithStats
      };

    case 'END_RUN':
      if (!state.profile) return state;

      const endedProfile = endRun(state.profile, action.victory);

      // Save the ended run
      if (state.currentSaveSlot) {
        saveProfile(state.currentSaveSlot, endedProfile);
      }

      return {
        ...state,
        profile: endedProfile
      };

    case 'START_NEW_RUN':
      if (!state.profile) return state;

      const newRunProfile = startNewRun(state.profile);

      // Save the new run start
      if (state.currentSaveSlot) {
        saveProfile(state.currentSaveSlot, newRunProfile);
      }

      // Initialize starter cards
      const starterCards = [
        cardTemplates.find(c => c.name === "Quick Jab"),
        cardTemplates.find(c => c.name === "Minor Heal"),
        cardTemplates.find(c => c.name === "Card Draw"),
      ].filter(Boolean);

      const starterCardNames = starterCards.map(c => c.name);

      // Apply talent bonuses to base stats
      const baseStats = {
        maxPlayerHealth: 100,
        maxEnergy: 10,
        maxHandSize: 6,
        maxSelectedCards: 6,
        maxBagSize: 8
      };

      const talentBonuses = applyTalentBonusesToRunStart(
        baseStats,
        newRunProfile.unlockedTalents || []
      );

      return {
        ...state,
        profile: newRunProfile,
        // Reset game state for new run with talent bonuses
        currentFloor: 1,
        currentAct: 1,
        gold: talentBonuses.startingGold || 0, // ✅ Starting gold talent
        playerHealth: talentBonuses.maxPlayerHealth,
        maxPlayerHealth: talentBonuses.maxPlayerHealth, // ✅ Health boost talents
        playerEnergy: talentBonuses.maxEnergy,
        maxEnergy: talentBonuses.maxEnergy, // ✅ Energy boost talents
        maxHandSize: talentBonuses.maxHandSize, // ✅ Hand size talents
        maxSelectedCards: talentBonuses.maxSelectedCards, // ✅ Deck size talents
        maxBagSize: talentBonuses.maxBagSize, // ✅ Bag size talents
        completedNodes: [],
        progressionMap: [],
        unlockedCards: starterCards,
        selectedCardTypes: starterCardNames,
        hasUsedRevive: false, // ✅ Reset revive status
        inventory: {
          bag: Array(talentBonuses.maxBagSize).fill(null), // ✅ Bigger bag from talents
          toolBelt: {
            consumables: [null, null],
            passive: null
          }
        },
        // Reset branching tree system
        branchingMap: [],
        selectedBiome: null,
        completedNodeIds: [],
        availableNodeIds: [],
        biomeLocked: false
      };

    case 'SET_USED_REVIVE':
      return {
        ...state,
        hasUsedRevive: true
      };

    // ========== EXISTING ACTIONS (Keep all of these) ==========
    case 'DRAW_CARD':
      return { ...state, playerHand: [...state.playerHand, action.card] };

    case 'DRAW_MULTIPLE_CARDS':
      return { ...state, playerHand: [...state.playerHand, ...action.cards] };

    case 'REMOVE_CARD':
      return { ...state, playerHand: state.playerHand.filter(c => c.id !== action.cardId) };

    case 'DAMAGE_ENEMY':
      // Track damage dealt
      if (state.profile) {
        const updatedStats = updateRunStats(state.profile, {
          damageDealt: state.profile.currentRun.currentRunStats.damageDealt + action.amount
        });
        return {
          ...state,
          enemyHealth: Math.max(0, state.enemyHealth - action.amount),
          profile: updatedStats
        };
      }
      return { ...state, enemyHealth: Math.max(0, state.enemyHealth - action.amount) };

    case 'DAMAGE_PLAYER':
      return { ...state, playerHealth: Math.max(0, state.playerHealth - action.amount) };

    case 'HEAL_PLAYER':
      return { ...state, playerHealth: Math.min(state.maxPlayerHealth, state.playerHealth + action.amount) };

    case 'UPDATE_HEALTH':
      return { ...state, playerHealth: action.health };

    case 'HEAL_ENEMY':
      const enemyMaxHealth = state.currentEnemyData?.health || 70;
      return { ...state, enemyHealth: Math.min(enemyMaxHealth, state.enemyHealth + action.amount) };

    case 'SPEND_ENERGY':
      return { ...state, playerEnergy: Math.max(0, state.playerEnergy - action.amount) };

    case 'GAIN_ENERGY':
      return {
        ...state,
        playerEnergy: Math.min(state.maxEnergy, state.playerEnergy + action.amount)
      };

    case 'UPGRADE_MAX_ENERGY':
      return {
        ...state,
        maxEnergy: state.maxEnergy + action.amount,
        playerEnergy: state.playerEnergy + action.amount
      };

    case 'INCREMENT_TURN':
      return { ...state, turnCount: state.turnCount + 1 };

    case 'ADD_BATTLE_LOG':
      return { ...state, battleLog: [...state.battleLog.slice(-4), action.message] };

    case 'UPGRADE_HEALTH':
      return {
        ...state,
        maxPlayerHealth: state.maxPlayerHealth + action.amount
      };

    case 'UPGRADE_HAND_SIZE':
      return { ...state, maxHandSize: state.maxHandSize + action.amount };

    case 'INITIALIZE_MAP':
      return {
        ...state,
        progressionMap: action.map,
        currentFloor: 1,
        currentAct: 1,
        completedNodes: [],
        selectedNodeId: null
      };

    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId };

    case 'SELECT_CARD':
      return {
        ...state,
        selectedCardTypes: [...state.selectedCardTypes, action.cardName]
      };

    case 'DESELECT_CARD':
      return {
        ...state,
        selectedCardTypes: state.selectedCardTypes.filter(name => name !== action.cardName)
      };

    case 'COMPLETE_NODE': {
      const completedNodes = [...state.completedNodes, action.nodeId];
      const nextFloor = state.currentFloor + 1;
      const nextAct = Math.ceil(nextFloor / 5);

      const updatedMap = state.progressionMap.map(floor => {
        if (floor.floor === nextFloor) {
          return {
            ...floor,
            nodes: floor.nodes.map(node => ({ ...node, available: true }))
          };
        }
        return floor;
      });

      return {
        ...state,
        completedNodes,
        currentFloor: nextFloor,
        currentAct: nextAct,
        progressionMap: updatedMap,
        selectedNodeId: null
      };
    }

    // ========== BRANCHING TREE SYSTEM ACTIONS ==========
    case 'INITIALIZE_BRANCHING_MAP':
      return {
        ...state,
        branchingMap: action.map,
        currentAct: 1,
        currentFloor: 1,
        selectedBiome: null,
        completedNodeIds: [],
        availableNodeIds: [],
        biomeLocked: false
      };

    case 'SELECT_BIOME':
      // Player selects a biome at the start of an act
      if (state.biomeLocked) {
        console.warn('Biome already selected for this act');
        return state;
      }

      const actData = state.branchingMap[state.currentAct - 1];
      if (!actData) {
        console.error('Act data not found');
        return state;
      }

      const selectedBiomeData = actData.biomeOptions.find(b => b.biomeId === action.biomeId);
      if (!selectedBiomeData) {
        console.error('Biome not found:', action.biomeId);
        return state;
      }

      // Get the first node ID from the selected biome's tree
      const firstFloor = selectedBiomeData.floors[0];
      const firstNodeId = firstFloor?.nodes[0]?.id;

      if (!firstNodeId) {
        console.error('No starting node found in biome');
        return state;
      }

      // Mark the map with the selected biome and make first node available
      const mapWithSelectedBiome = state.branchingMap.map((act, idx) => {
        if (idx === state.currentAct - 1) {
          return {
            ...act,
            biomeOptions: act.biomeOptions.map(biome => {
              if (biome.biomeId === action.biomeId) {
                return {
                  ...biome,
                  floors: biome.floors.map((floor, floorIdx) => {
                    if (floorIdx === 0) {
                      return {
                        ...floor,
                        nodes: floor.nodes.map(node => ({
                          ...node,
                          available: true
                        }))
                      };
                    }
                    return floor;
                  })
                };
              }
              return biome;
            })
          };
        }
        return act;
      });

      return {
        ...state,
        selectedBiome: action.biomeId,
        biomeLocked: true,
        branchingMap: mapWithSelectedBiome,
        availableNodeIds: [firstNodeId]
      };

    case 'COMPLETE_NODE_IN_TREE':
      // Complete a node and make its children available
      // IMPORTANT: Lock out sibling nodes (alternate paths the player didn't choose)
      const nodeId = action.nodeId;
      const currentAct = state.branchingMap[state.currentAct - 1];

      if (!currentAct || !state.selectedBiome) {
        console.error('Invalid state for completing node');
        return state;
      }

      const selectedBiome = currentAct.biomeOptions.find(b => b.biomeId === state.selectedBiome);
      if (!selectedBiome) {
        console.error('Selected biome not found');
        return state;
      }

      // Find the completed node to get its children and floor
      let completedNode = null;
      let completedNodeFloor = null;
      let isLastFloorBeforeBoss = false;

      for (const floor of selectedBiome.floors) {
        completedNode = floor.nodes.find(n => n.id === nodeId);
        if (completedNode) {
          completedNodeFloor = floor;
          // Check if this is floor 4 (last floor before boss)
          isLastFloorBeforeBoss = floor.floor === (state.currentAct - 1) * 5 + 4;
          break;
        }
      }

      if (!completedNode) {
        console.error('Node not found:', nodeId);
        return state;
      }

      // Get children IDs
      const childrenIds = completedNode.childrenIds || [];

      // Find sibling nodes (other available nodes on the same floor that weren't chosen)
      const siblingNodeIds = completedNodeFloor.nodes
        .filter(node =>
          node.id !== nodeId && // Not the chosen node
          state.availableNodeIds.includes(node.id) // Was available as an option
        )
        .map(node => node.id);

      // Update the map: mark node as completed, lock out siblings, make children available
      const mapAfterNodeCompletion = state.branchingMap.map((act, actIdx) => {
        if (actIdx === state.currentAct - 1) {
          return {
            ...act,
            biomeOptions: act.biomeOptions.map(biome => {
              if (biome.biomeId === state.selectedBiome) {
                return {
                  ...biome,
                  floors: biome.floors.map(floor => ({
                    ...floor,
                    nodes: floor.nodes.map(node => {
                      // Mark completed node
                      if (node.id === nodeId) {
                        return { ...node, completed: true, available: false };
                      }
                      // Lock out sibling nodes (alternate paths not chosen)
                      if (siblingNodeIds.includes(node.id)) {
                        return { ...node, available: false };
                      }
                      // Make children available
                      if (childrenIds.includes(node.id)) {
                        return { ...node, available: true };
                      }
                      return node;
                    })
                  }))
                };
              }
              return biome;
            }),
            // If last floor, make boss available
            bossFloor: isLastFloorBeforeBoss
              ? { ...act.bossFloor, node: { ...act.bossFloor.node, available: true } }
              : act.bossFloor
          };
        }
        return act;
      });

      // Update available nodes list: remove completed node AND sibling nodes, add children
      // If this is the last floor before boss, add boss node ID
      const newAvailableNodeIds = [
        ...state.availableNodeIds.filter(id =>
          id !== nodeId && // Remove completed node
          !siblingNodeIds.includes(id) // Remove locked out siblings
        ),
        ...childrenIds, // Add children
        ...(isLastFloorBeforeBoss ? [currentAct.bossFloor.node.id] : []) // Add boss if last floor
      ];

      // Calculate current floor: use the floor number from the completed node's floor
      const calculatedFloor = completedNodeFloor.floor;

      console.log('COMPLETE_NODE_IN_TREE: completedNodeFloor.floor =', completedNodeFloor.floor, 'nodeId =', nodeId);

      return {
        ...state,
        branchingMap: mapAfterNodeCompletion,
        completedNodeIds: [...state.completedNodeIds, nodeId],
        availableNodeIds: newAvailableNodeIds,
        currentFloor: calculatedFloor
      };

    case 'COMPLETE_BOSS_FLOOR': {
      // Complete boss and move to next act
      const completedActNum = state.currentAct;
      const nextAct = completedActNum + 1;

      // Mark boss as completed
      const mapAfterBossComplete = state.branchingMap.map((act, actIdx) => {
        if (actIdx === completedActNum - 1) {
          return {
            ...act,
            bossFloor: {
              ...act.bossFloor,
              node: { ...act.bossFloor.node, completed: true, available: false }
            }
          };
        }
        return act;
      });

      return {
        ...state,
        branchingMap: mapAfterBossComplete,
        currentAct: nextAct,
        currentFloor: completedActNum * 5,  // Set to the boss floor number (5, 10, 15, etc.)
        selectedBiome: null,
        biomeLocked: false,
        availableNodeIds: []
      };
    }

    case 'SET_ENEMY_FOR_BATTLE':
      const enemyData = action.enemyData;

      if (!enemyData) {
        console.error('SET_ENEMY_FOR_BATTLE: enemyData is undefined!');
        return state;
      }

      return {
        ...state,
        enemyHealth: enemyData.health,
        currentEnemyData: enemyData,
        playerEnergy: state.maxEnergy,
        turnCount: 0,
        playerHand: [],
        battleLog: [],
        enemyStatuses: []
      };

    case 'JOKER_BONUS':
      return { ...state, jokerBonus: action.bonus };

    case 'CLEAR_JOKER_BONUS':
      return { ...state, jokerBonus: null };

    case 'ADD_GOLD':
      // Track gold earned
      if (state.profile) {
        const updatedStats = updateRunStats(state.profile, {
          goldEarned: state.profile.currentRun.currentRunStats.goldEarned + action.amount
        });
        return {
          ...state,
          gold: state.gold + action.amount,
          profile: updatedStats
        };
      }
      return { ...state, gold: state.gold + action.amount };

    case 'SPEND_GOLD':
      return { ...state, gold: Math.max(0, state.gold - action.amount) };

    case 'UNLOCK_DRAW_SHOP':
      return { ...state, drawAbilityUnlocked: true };

    case 'UNLOCK_DISCARD_SHOP':
      return { ...state, discardAbilityUnlocked: true };

    case 'UNLOCK_INVENTORY_SHOP':
      return { ...state, inventoryUpgradeUnlocked: true };

    case 'PURCHASE_DRAW_ABILITY':
      return { ...state, hasDrawAbility: true };

    case 'PURCHASE_DISCARD_ABILITY':
      return { ...state, hasDiscardAbility: true };

    case 'EXPAND_BAG_SIZE':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          bag: [...state.inventory.bag, null]
        }
      };

    case 'EXPAND_CONSUMABLE_SIZE':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          toolBelt: {
            ...state.inventory.toolBelt,
            consumables: [...state.inventory.toolBelt.consumables, null]
          }
        }
      };

    case 'EXPAND_PASSIVE_SIZE':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          toolBelt: {
            ...state.inventory.toolBelt,
            passives: [...state.inventory.toolBelt.passives, null]
          }
        }
      };

    case 'TRACK_UPGRADE':
      const { upgradeType } = action;
      if (upgradeType === 'health') {
        return { ...state, healthUpgradesPurchased: (state.healthUpgradesPurchased || 0) + 1 };
      } else if (upgradeType === 'energy') {
        return { ...state, energyUpgradesPurchased: (state.energyUpgradesPurchased || 0) + 1 };
      } else if (upgradeType === 'handSize') {
        return { ...state, handSizeUpgradesPurchased: (state.handSizeUpgradesPurchased || 0) + 1 };
      }
      return state;

    case 'INCREMENT_BOSSES_DEFEATED':
      return { ...state, bossesDefeated: (state.bossesDefeated || 0) + 1 };

    case 'INCREMENT_ELITES_DEFEATED':
      return { ...state, elitesDefeated: (state.elitesDefeated || 0) + 1 };

    case 'APPLY_STATUS_TO_PLAYER':
      return {
        ...state,
        playerStatuses: applyStatus(state.playerStatuses || [], action.status) // ✅ Fallback to []
      };

    case 'APPLY_STATUS_TO_ENEMY':
      return {
        ...state,
        enemyStatuses: applyStatus(state.enemyStatuses || [], action.status) // ✅ Fallback to []
      };

    case 'TICK_PLAYER_STATUSES':
      const { statuses: updatedPlayerStatuses, totalDamage: playerDamage } = tickStatuses(state.playerStatuses);
      return {
        ...state,
        playerStatuses: updatedPlayerStatuses,
        playerHealth: Math.max(0, state.playerHealth - playerDamage)
      };

    case 'TICK_ENEMY_STATUSES':
      const { statuses: updatedEnemyStatuses, totalDamage: enemyDamage } = tickStatuses(state.enemyStatuses);
      return {
        ...state,
        enemyStatuses: updatedEnemyStatuses,
        enemyHealth: Math.max(0, state.enemyHealth - enemyDamage)
      };

    case 'CLEAR_PLAYER_STATUS':
      return {
        ...state,
        playerStatuses: state.playerStatuses.filter(s => s.type !== action.statusType)
      };

    case 'CLEAR_ALL_PLAYER_STATUSES':
      return {
        ...state,
        playerStatuses: []
      };

    case 'UNLOCK_CARD':
      const cardExists = state.unlockedCards.some(c => c.name === action.card.name);
      if (cardExists) return state;

      return {
        ...state,
        unlockedCards: [...state.unlockedCards, action.card]
      };

    case 'SELECT_CARD_FOR_DECK':
      if (state.selectedCardTypes.length >= state.maxSelectedCards) {
        return state;
      }
      if (state.selectedCardTypes.includes(action.cardName)) {
        return state;
      }

      return {
        ...state,
        selectedCardTypes: [...state.selectedCardTypes, action.cardName]
      };

    case 'REMOVE_CARD_FROM_DECK':
      return {
        ...state,
        selectedCardTypes: state.selectedCardTypes.filter(name => name !== action.cardName)
      };

    case 'UPGRADE_MAX_SELECTED_CARDS':
      return {
        ...state,
        maxSelectedCards: state.maxSelectedCards + action.amount
      };

    case 'SELL_CARD':
      return {
        ...state,
        unlockedCards: state.unlockedCards.filter(c => c.name !== action.cardName),
        selectedCardTypes: state.selectedCardTypes.filter(name => name !== action.cardName)
      };

    case 'SET_CARD_REWARD':
      return {
        ...state,
        shouldShowCardReward: true,
        cardRewardRarity: action.rarityWeights
      };

    case 'CLEAR_CARD_REWARD':
      return {
        ...state,
        shouldShowCardReward: false,
        cardRewardRarity: null
      };

    case 'SET_ITEM_REWARD':
      return {
        ...state,
        shouldShowItemReward: true,
        pendingItemRewards: action.items
      };

    case 'CLEAR_ITEM_REWARD':
      return {
        ...state,
        shouldShowItemReward: false,
        pendingItemRewards: []
      };

    case 'SET_LAST_BATTLE_REWARDS':
      return {
        ...state,
        lastBattleRewards: action.rewards
      };

    case 'STORE_BATTLE_START_STATS':
      return {
        ...state,
        battleStartStats: action.stats
      };

    case 'SHOW_BATTLE_RECAP':
      return {
        ...state,
        showBattleRecap: true
      };

    case 'CLEAR_BATTLE_RECAP':
      return {
        ...state,
        showBattleRecap: false,
        battleStartStats: null
      };

    case 'ADD_PENDING_ITEM':
      return {
        ...state,
        pendingItemRewards: [...state.pendingItemRewards, action.item]
      };

    case 'ADD_ITEM_TO_BAG':
      const emptySlotIndex = state.inventory.bag.findIndex(slot => slot === null);

      if (emptySlotIndex === -1) {
        console.warn('Bag is full! Cannot add item.');
        return state;
      }

      const newBag = [...state.inventory.bag];
      newBag[emptySlotIndex] = action.item;

      return {
        ...state,
        inventory: {
          ...state.inventory,
          bag: newBag
        }
      };

    case 'REMOVE_ITEM_FROM_BAG':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          bag: state.inventory.bag.map(item =>
            item?.instanceId === action.instanceId ? null : item
          )
        }
      };

    case 'REMOVE_CONSUMABLE_FROM_TOOLBELT':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          toolBelt: {
            ...state.inventory.toolBelt,
            consumables: state.inventory.toolBelt.consumables.map(item =>
              item?.instanceId === action.instanceId ? null : item
            )
          }
        }
      };

    case 'EQUIP_CONSUMABLE':
      const emptyConsumableSlot = state.inventory.toolBelt.consumables.findIndex(slot => slot === null);

      if (emptyConsumableSlot === -1) {
        console.warn('All consumable slots full!');
        return state;
      }

      const bagAfterEquipConsumable = state.inventory.bag.map(item =>
        item?.instanceId === action.item.instanceId ? null : item
      );

      const newConsumables = [...state.inventory.toolBelt.consumables];
      newConsumables[emptyConsumableSlot] = action.item;

      return {
        ...state,
        inventory: {
          ...state.inventory,
          bag: bagAfterEquipConsumable,
          toolBelt: {
            ...state.inventory.toolBelt,
            consumables: newConsumables
          }
        }
      };

    case 'UNEQUIP_CONSUMABLE':
      const consumableIndex = state.inventory.toolBelt.consumables.findIndex(
        item => item?.instanceId === action.instanceId
      );

      if (consumableIndex === -1) return state;

      const itemToUnequip = state.inventory.toolBelt.consumables[consumableIndex];

      const emptyBagSlot = state.inventory.bag.findIndex(slot => slot === null);
      if (emptyBagSlot === -1) {
        console.warn('Bag is full! Cannot unequip.');
        return state;
      }

      const consumablesAfterUnequip = [...state.inventory.toolBelt.consumables];
      consumablesAfterUnequip[consumableIndex] = null;

      const bagAfterUnequip = [...state.inventory.bag];
      bagAfterUnequip[emptyBagSlot] = itemToUnequip;

      return {
        ...state,
        inventory: {
          ...state.inventory,
          bag: bagAfterUnequip,
          toolBelt: {
            ...state.inventory.toolBelt,
            consumables: consumablesAfterUnequip
          }
        }
      };

    case 'EQUIP_PASSIVE':
      if (state.inventory.toolBelt.passive !== null) {
        console.warn('Passive slot full!');
        return state;
      }

      const bagAfterEquipPassive = state.inventory.bag.map(item =>
        item?.instanceId === action.item.instanceId ? null : item
      );

      // Apply passive effect immediately
      let updatedState = {
        ...state,
        inventory: {
          ...state.inventory,
          bag: bagAfterEquipPassive,
          toolBelt: {
            ...state.inventory.toolBelt,
            passive: action.item
          }
        }
      };

      const effect = action.item.effect;

      if (effect.type === 'max_health_boost') {
        updatedState = {
          ...updatedState,
          maxPlayerHealth: updatedState.maxPlayerHealth + effect.value
        };
        console.log(`Equipped ${action.item.name}: +${effect.value} Max HP (new max: ${updatedState.maxPlayerHealth})`);
      }

      if (effect.type === 'max_energy_boost') {
        updatedState = {
          ...updatedState,
          maxEnergy: updatedState.maxEnergy + effect.value
        };
        console.log(`Equipped ${action.item.name}: +${effect.value} Max Energy (new max: ${updatedState.maxEnergy})`);
      }

      if (effect.type === 'hand_size_boost') {
        updatedState = {
          ...updatedState,
          maxHandSize: updatedState.maxHandSize + effect.value
        };
        console.log(`Equipped ${action.item.name}: +${effect.value} Hand Size (new max: ${updatedState.maxHandSize})`);
      }

      return updatedState;

    case 'UNEQUIP_PASSIVE':
      if (!state.inventory.toolBelt.passive) return state;

      const passiveToUnequip = state.inventory.toolBelt.passive;

      const emptyBagSlotForPassive = state.inventory.bag.findIndex(slot => slot === null);
      if (emptyBagSlotForPassive === -1) {
        console.warn('Bag is full! Cannot unequip.');
        return state;
      }

      const bagAfterUnequipPassive = [...state.inventory.bag];
      bagAfterUnequipPassive[emptyBagSlotForPassive] = passiveToUnequip;

      // Remove passive effect
      let stateAfterUnequip = {
        ...state,
        inventory: {
          ...state.inventory,
          bag: bagAfterUnequipPassive,
          toolBelt: {
            ...state.inventory.toolBelt,
            passive: null
          }
        }
      };

      const passiveEffect = passiveToUnequip.effect;

      if (passiveEffect.type === 'max_health_boost') {
        const newMaxHealth = Math.max(1, stateAfterUnequip.maxPlayerHealth - passiveEffect.value);
        stateAfterUnequip = {
          ...stateAfterUnequip,
          maxPlayerHealth: newMaxHealth,
          playerHealth: Math.min(stateAfterUnequip.playerHealth, newMaxHealth)
        };
        console.log(`Unequipped ${passiveToUnequip.name}: -${passiveEffect.value} Max HP (new max: ${newMaxHealth})`);
      }

      if (passiveEffect.type === 'max_energy_boost') {
        const newMaxEnergy = Math.max(1, stateAfterUnequip.maxEnergy - passiveEffect.value);
        stateAfterUnequip = {
          ...stateAfterUnequip,
          maxEnergy: newMaxEnergy,
          playerEnergy: Math.min(stateAfterUnequip.playerEnergy, newMaxEnergy)
        };
        console.log(`Unequipped ${passiveToUnequip.name}: -${passiveEffect.value} Max Energy (new max: ${newMaxEnergy})`);
      }

      if (passiveEffect.type === 'hand_size_boost') {
        const newMaxHandSize = Math.max(1, stateAfterUnequip.maxHandSize - passiveEffect.value);
        stateAfterUnequip = {
          ...stateAfterUnequip,
          maxHandSize: newMaxHandSize
        };
        console.log(`Unequipped ${passiveToUnequip.name}: -${passiveEffect.value} Hand Size (new max: ${newMaxHandSize})`);
      }

      return stateAfterUnequip;

    case 'USE_CONSUMABLE':
      const usedConsumableIndex = state.inventory.toolBelt.consumables.findIndex(
        item => item?.instanceId === action.instanceId
      );

      if (usedConsumableIndex === -1) return state;

      const consumablesAfterUse = [...state.inventory.toolBelt.consumables];
      consumablesAfterUse[usedConsumableIndex] = null;

      // Track items used
      if (state.profile) {
        const updatedStats = updateRunStats(state.profile, {
          itemsUsed: state.profile.currentRun.currentRunStats.itemsUsed + 1
        });
        return {
          ...state,
          inventory: {
            ...state.inventory,
            toolBelt: {
              ...state.inventory.toolBelt,
              consumables: consumablesAfterUse
            }
          },
          profile: updatedStats
        };
      }

      return {
        ...state,
        inventory: {
          ...state.inventory,
          toolBelt: {
            ...state.inventory.toolBelt,
            consumables: consumablesAfterUse
          }
        }
      };

    case 'SET_ITEM_EFFECT':
      return {
        ...state,
        activeItemEffects: {
          ...state.activeItemEffects,
          [action.effect.type]: action.effect.value
        }
      };

    case 'CLEAR_ITEM_EFFECT':
      const { [action.effectType]: removed, ...remainingEffects } = state.activeItemEffects;
      return {
        ...state,
        activeItemEffects: remainingEffects
      };

    case 'CLEAR_ALL_ITEM_EFFECTS':
      return {
        ...state,
        activeItemEffects: {}
      };

    case 'UPGRADE_BAG_SIZE':
      const newMaxBagSize = state.maxBagSize + action.amount;
      const expandedBag = [
        ...state.inventory.bag,
        ...Array(action.amount).fill(null)
      ];

      return {
        ...state,
        maxBagSize: newMaxBagSize,
        bagUpgradesPurchased: state.bagUpgradesPurchased + 1,
        inventory: {
          ...state.inventory,
          bag: expandedBag
        }
      };

    case 'UPGRADE_CONSUMABLE_SLOTS':
      const newMaxConsumableSlots = state.maxConsumableSlots + action.amount;
      const expandedConsumables = [
        ...state.inventory.toolBelt.consumables,
        ...Array(action.amount).fill(null)
      ];

      return {
        ...state,
        maxConsumableSlots: newMaxConsumableSlots,
        consumableUpgradesPurchased: state.consumableUpgradesPurchased + 1,
        inventory: {
          ...state.inventory,
          toolBelt: {
            ...state.inventory.toolBelt,
            consumables: expandedConsumables
          }
        }
      };

    case 'UPGRADE_PASSIVE_SLOTS':
      const newMaxPassiveSlots = state.maxPassiveSlots + action.amount;
      return {
        ...state,
        maxPassiveSlots: newMaxPassiveSlots,
        passiveUpgradesPurchased: state.passiveUpgradesPurchased + 1
      };

    case 'TOGGLE_PRE_BATTLE_LOADOUT':
      return {
        ...state,
        showPreBattleLoadout: !state.showPreBattleLoadout
      };

    case 'TOGGLE_3D_VIEW':
      return {
        ...state,
        prefer3DView: !state.prefer3DView
      };

    case 'SET_TUTORIAL_COMPLETED':
      return {
        ...state,
        tutorialCompleted: action.completed
      };

    case 'SET_MAP_TUTORIAL_COMPLETED':
      return {
        ...state,
        mapTutorialCompleted: action.completed
      };

    case 'OPEN_MENU':
      return {
        ...state,
        menuOpen: true,
        menuTab: action.tab || state.menuTab
      };

    case 'CLOSE_MENU':
      return {
        ...state,
        menuOpen: false
      };

    case 'SET_MENU_TAB':
      return {
        ...state,
        menuTab: action.tab
      };

    case 'TOGGLE_MENU':
      return {
        ...state,
        menuOpen: !state.menuOpen
      };

    case 'RESET_GAME':
      return { ...initialGameState, playerHand: [], progressionMap: [], currentEnemyData: null };

    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    if (!cardTemplates || cardTemplates.length === 0) {
      console.warn('Card templates not loaded yet');
      return;
    }

    if (gameState.unlockedCards.length === 0) {
      const starterCards = [
        cardTemplates.find(c => c.name === "Quick Jab"),
        cardTemplates.find(c => c.name === "Minor Heal"),
        cardTemplates.find(c => c.name === "Card Draw"),
      ].filter(Boolean);

      console.log('Initializing starter deck with 3 cards:', starterCards.map(c => c.name));

      starterCards.forEach(card => {
        const starterCard = { ...card, isStarter: true };
        dispatch({ type: 'UNLOCK_CARD', card: starterCard });
        dispatch({ type: 'SELECT_CARD_FOR_DECK', cardName: card.name });
      });
    }
  }, []);

  useEffect(() => {
    if (gameState.playerHand.length === 0 && gameState.battleNumber >= 1) {
      const initialHand = [];

      if (gameState.selectedCardTypes.length > 0) {
        const selectedCards = cardTemplates.filter(c =>
          gameState.selectedCardTypes.includes(c.name)
        );

        console.log('Drawing initial hand from', selectedCards.length, 'selected cards');

        for (let i = 0; i < 4; i++) {
          const randomCard = selectedCards[Math.floor(Math.random() * selectedCards.length)];
          if (randomCard) {
            initialHand.push({ ...randomCard, id: Date.now() + i + Math.random() });
          }
        }
      } else {
        console.warn('No cards selected, using random cards');
        for (let i = 0; i < 4; i++) {
          const randomCard = getRandomCard();
          initialHand.push({ ...randomCard, id: Date.now() + i + Math.random() });
        }
      }

      if (initialHand.length > 0) {
        dispatch({ type: 'DRAW_MULTIPLE_CARDS', cards: initialHand });
      }
    }
  }, [gameState.playerHand.length, gameState.battleNumber, gameState.selectedCardTypes]);

  // Auto-save periodically (every 30 seconds)
  useEffect(() => {
    if (!gameState.profile || !gameState.currentSaveSlot) return;

    const autoSaveInterval = setInterval(() => {
      console.log('💾 Auto-saving...');
      dispatch({ type: 'SAVE_PROFILE' });
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [gameState.profile, gameState.currentSaveSlot]);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};