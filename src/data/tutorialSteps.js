/**
 * Tutorial Steps
 *
 * Each step has:
 * - id: Unique identifier
 * - message: Stijn's explanation
 * - trigger: When to show this step
 * - position: Where Stijn's popup appears
 * - highlightArea: Optional CSS selector to highlight
 * - autoAdvance: Whether to auto-advance after condition met
 */

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    message: "Welcome to your first battle! I'm Stijn, and I'll guide you through the basics. Let's start by understanding what you're looking at.",
    trigger: 'on_battle_start',
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'hand_intro',
    message: "These are your cards at the bottom. You start with 5 cards, and your hand persists between turns - no more discarding everything!",
    trigger: 'manual',
    position: 'bottom-left',
    highlightArea: '.card-hand-area',
    autoAdvance: false
  },
  {
    id: 'energy_intro',
    message: "See that energy counter? You need energy to play cards. Each card shows its energy cost. You start with 10 energy each turn.",
    trigger: 'manual',
    position: 'bottom-left',
    highlightArea: '.energy-display',
    autoAdvance: false
  },
  {
    id: 'play_card',
    message: "Now try it! DRAG A CARD UPWARD to play it. Go ahead, attack the enemy!",
    trigger: 'manual',
    position: 'bottom-left',
    highlightArea: '.card-hand-area',
    waitFor: 'card_played',
    autoAdvance: true
  },
  {
    id: 'card_played_success',
    message: "Nice! You dealt damage! Cards go to your discard pile after use, and you'll shuffle them back when your deck runs out.",
    trigger: 'on_card_played',
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'discard_intro',
    message: "Don't like a card? DRAG IT TO THE RIGHT to discard it. This helps you manage your hand better!",
    trigger: 'manual',
    position: 'bottom-right',
    highlightArea: '.discard-zone',
    waitFor: 'card_discarded',
    autoAdvance: true
  },
  {
    id: 'discard_success',
    message: "Perfect! Discarding lets you get rid of cards you don't need right now. Use it wisely!",
    trigger: 'on_card_discarded',
    position: 'bottom-right',
    autoAdvance: false
  },
  {
    id: 'status_effects',
    message: "See those icons under the health bars? Those are status effects. They can buff you, debuff enemies, or cause damage over time.",
    trigger: 'manual',
    position: 'top-left',
    highlightArea: '.status-display',
    autoAdvance: false
  },
  {
    id: 'timer_intro',
    message: "Watch the timer! You have 2 minutes per battle. The battle gets harder as time runs out - Early, Mid, and Late stages affect enemy strength.",
    trigger: 'manual',
    position: 'top-left',
    highlightArea: '.battle-timer',
    autoAdvance: false
  },
  {
    id: 'timer_stages',
    message: "Early game (80s+) is normal. Mid game (40-80s), enemies get +1 Strength. Late game (<40s), they get +2 Strength and Regeneration. Don't let time run out!",
    trigger: 'manual',
    position: 'top-left',
    autoAdvance: false
  },
  {
    id: 'counter_system',
    message: "If an enemy attacks and you have a counter card, you'll get a 15-second window to block! Counter cards are powerful defensive tools.",
    trigger: 'manual',
    position: 'bottom-left',
    autoAdvance: false
  },
  {
    id: 'end_turn',
    message: "When you're done with your turn, click the END TURN button on the right. You'll draw back up to 5 cards and refill your energy!",
    trigger: 'manual',
    position: 'bottom-right',
    highlightArea: '.end-turn-button',
    waitFor: 'turn_ended',
    autoAdvance: true
  },
  {
    id: 'tutorial_complete',
    message: "That's everything! Remember: drag up to play, drag right to discard, watch your timer, and use those counter cards. Now go win this battle!",
    trigger: 'on_turn_ended',
    position: 'bottom-left',
    autoAdvance: false,
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
