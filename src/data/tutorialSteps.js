/**
 * Tutorial Steps - Staged Tutorial Flow
 *
 * Each step has:
 * - id: Unique identifier
 * - message: Stijn's explanation
 * - trigger: When to show this step
 * - position: Where Stijn's popup appears
 * - highlightArea: Optional CSS selector to highlight
 * - autoAdvance: Whether to auto-advance after condition met
 * - pauseBattle: Whether to pause battle actions during this step
 */

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    message: "Welcome to your first battle! I'm Stijn, and I'll guide you through the basics. This is the Training Dummy - it's weak and slow, perfect for learning.",
    trigger: 'on_battle_start',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: true
  },
  {
    id: 'hand_intro',
    message: "These are your cards at the bottom. You start with 5 cards each battle. Your hand PERSISTS between turns - no more discarding everything like other card games!",
    trigger: 'manual',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: true
  },
  {
    id: 'energy_intro',
    message: "See that energy counter? Each card costs energy to play. You start with 10 energy and it refills EVERY turn. Look at the energy cost on your cards!",
    trigger: 'manual',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: true
  },
  {
    id: 'play_card_intro',
    message: "Time to attack! DRAG A CARD UPWARD onto the battlefield to play it. Try playing a damage card to attack the Training Dummy!",
    trigger: 'manual',
    position: 'bottom-left',
    waitFor: 'card_played',
    autoAdvance: true,
    pauseBattle: true
  },
  {
    id: 'card_played_success',
    message: "Great job! Your card went into the discard pile. When your deck runs out, the discard pile shuffles back in. You'll never run out of cards!",
    trigger: 'on_card_played',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: true
  },
  {
    id: 'discard_intro',
    message: "Don't need a card right now? DRAG IT TO THE RIGHT to the discard zone. This helps you cycle through your deck faster to find the cards you need!",
    trigger: 'manual',
    position: 'bottom-right',
    waitFor: 'card_discarded',
    autoAdvance: true,
    pauseBattle: true
  },
  {
    id: 'end_turn_intro',
    message: "Alright, let's end your turn! Click the END TURN button on the right. You'll draw back up to 5 cards and refill your energy. The enemy will take their turn next.",
    trigger: 'manual',
    position: 'bottom-left',
    waitFor: 'turn_ended',
    autoAdvance: true,
    pauseBattle: true
  },
  {
    id: 'turn_ended_success',
    message: "Perfect! Your hand refilled and your energy is back to 10. Now the enemy will attack. Don't worry, the Training Dummy is very weak!",
    trigger: 'on_turn_ended',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: false // Let enemy take their turn
  },
  {
    id: 'second_turn',
    message: "Your turn again! Notice your hand still has cards from before, plus you drew more. This persistence is key - plan ahead!",
    trigger: 'manual',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: true
  },
  {
    id: 'timer_intro',
    message: "See the timer at the top? You have 2 minutes per battle. As time runs out, enemies get STRONGER. Early (80s+) is normal. Mid (40-80s) gives enemies +1 Strength. Late (<40s) gives +2 Strength and Regeneration!",
    trigger: 'manual',
    position: 'top-left',
    autoAdvance: false,
    pauseBattle: true
  },
  {
    id: 'finish_battle',
    message: "That's the core! Play cards, manage energy, end your turn, repeat. Defeat the Training Dummy to complete the tutorial. The timer is paused while I'm talking, so take your time!",
    trigger: 'manual',
    position: 'bottom-left',
    autoAdvance: false,
    pauseBattle: true,
    isLastStep: true
  }
];

/**
 * Get tutorial step by ID
 */
export const getTutorialStep = (stepId) => {
  return TUTORIAL_STEPS.find(step => step.id === stepId);
};

/**
 * Get next tutorial step
 */
export const getNextTutorialStep = (currentStepId) => {
  const currentIndex = TUTORIAL_STEPS.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === TUTORIAL_STEPS.length - 1) {
    return null;
  }
  return TUTORIAL_STEPS[currentIndex + 1];
};

/**
 * Check if tutorial is complete
 */
export const isTutorialComplete = (currentStepId) => {
  const step = getTutorialStep(currentStepId);
  return step?.isLastStep || false;
};
