/**
 * Map Tutorial Steps
 *
 * Guides players through the map navigation system
 * Each step has:
 * - id: Unique identifier
 * - message: Stijn's explanation
 * - position: Where Stijn's popup appears
 * - highlightArea: Optional CSS selector to highlight
 * - autoAdvance: Whether to auto-advance after condition met
 */

export const MAP_TUTORIAL_STEPS = [
  {
    id: 'map_welcome',
    message: "Great battle! Now you're back on the map. This is how you navigate through Retenta - a linear path with choices along the way.",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'floor_progress',
    message: "See the top? You're on Floor 1, Act 1. There are 25 floors total, split into 5 acts. Each act gets progressively harder!",
    position: 'top-left',
    autoAdvance: false
  },
  {
    id: 'player_stats',
    message: "Your health and gold are displayed here. Gold is for shops, and health... well, don't let it hit zero! You can rest at campfires to heal.",
    position: 'top-right',
    autoAdvance: false
  },
  {
    id: 'node_types_intro',
    message: "Let me explain the different nodes you'll encounter. Each icon represents a different type of location.",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'enemy_nodes',
    message: "RED SKULL icons are ENEMY battles. These are standard fights - defeat enemies for gold and experience!",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'elite_nodes',
    message: "PURPLE icons are ELITE enemies. They're tougher than normal enemies but give better rewards!",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'shop_nodes',
    message: "YELLOW SHOPPING BAG icons are SHOPS. Spend your hard-earned gold on cards, items, and upgrades!",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'boss_nodes',
    message: "RED CROWN icons are BOSS FIGHTS. These appear every 8 floors and are the toughest battles. Make sure you're ready!",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'joker_nodes',
    message: "JOKER icons are SPECIAL EVENTS. These can give you powerful bonuses, but sometimes at a cost. They're always interesting!",
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'selecting_nodes',
    message: "To move forward, CLICK on the next available node. Available nodes will be brighter and clickable.",
    position: 'bottom-left',
    waitFor: 'node_selected',
    autoAdvance: true
  },
  {
    id: 'confirming_selection',
    message: "Good! Now click the CONFIRM button to proceed to that node. Or click another node to change your mind.",
    position: 'bottom-right',
    waitFor: 'node_confirmed',
    autoAdvance: true
  },
  {
    id: 'map_complete',
    message: "That's the map system! Choose your path wisely - shops before bosses, rest when low on health, and don't be afraid of elites for better loot. Good luck!",
    position: 'bottom-left',
    autoAdvance: false,
    isLastStep: true
  }
];

/**
 * Get map tutorial step by ID
 */
export const getMapTutorialStep = (stepId) => {
  return MAP_TUTORIAL_STEPS.find(step => step.id === stepId);
};

/**
 * Get next map tutorial step
 */
export const getNextMapTutorialStep = (currentStepId) => {
  const currentIndex = MAP_TUTORIAL_STEPS.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === MAP_TUTORIAL_STEPS.length - 1) {
    return null;
  }
  return MAP_TUTORIAL_STEPS[currentIndex + 1];
};

/**
 * Check if map tutorial is complete
 */
export const isMapTutorialComplete = (currentStepId) => {
  const step = getMapTutorialStep(currentStepId);
  return step?.isLastStep || false;
};
