import React, { useState, useEffect } from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useGame } from '../../context/GameContext';
import { DialogueBox } from '../Dialogue/DialogueBox';
import { getDialogue } from '../../data/dialogues';
import { tutorialEnemy } from '../../data/enemies';

/**
 * DialogueRoute Component
 *
 * Route for displaying cutscenes and dialogue sequences
 * Accepts dialogue data through route state
 */
export const DialogueRoute = () => {
  const { navigate, routeParams } = useRouter();
  const { gameState, dispatch } = useGame();

  const [dialogue, setDialogue] = useState(null);
  const [nextRoute, setNextRoute] = useState('/map');
  const [onCompleteAction, setOnCompleteAction] = useState(null);
  const [visualStance, setVisualStance] = useState('neutral');
  const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(true);

  // Load dialogue on mount
  useEffect(() => {
    console.log('📚 DialogueRoute: Loading dialogue. routeParams:', routeParams);

    // Determine which scene we're loading
    let sceneId = routeParams?.scene || routeParams?.dialogueId;

    // Disable visual effects for tutorial and intro scenes to avoid blocking interaction
    const disableEffectsFor = [
      'story_intro',
      'tutorial_intro',
      'post_tutorial_battle',
      'biome_tutorial',
      'post_map_tutorial',
      'inventory_tutorial',
      'tutorial_complete'
    ];

    // Default to disabled unless we're in a story event scene
    const shouldEnableEffects = sceneId &&
      (sceneId.includes('reed') ||
       sceneId.includes('boss') ||
       sceneId.includes('response') ||
       sceneId.includes('defeat')) &&
      !disableEffectsFor.includes(sceneId);

    setVisualEffectsEnabled(shouldEnableEffects);

    // Detect visual stance from scene name
    if (sceneId) {
      if (sceneId.includes('energized') || sceneId.includes('confident')) {
        setVisualStance('energized');
      } else if (sceneId.includes('cautious') || sceneId.includes('humble')) {
        setVisualStance('cautious');
      } else if (sceneId.includes('aggressive') || sceneId.includes('defiant')) {
        setVisualStance('aggressive');
      } else if (sceneId.includes('tactical') || sceneId.includes('diplomatic')) {
        setVisualStance('tactical');
      } else if (sceneId.includes('reed') || sceneId.includes('boss')) {
        setVisualStance('aggressive'); // Default boss encounters to aggressive
      } else {
        setVisualStance('neutral');
      }
    }

    if (routeParams?.scene) {
      // Load dialogue by scene ID (same as dialogueId)
      console.log('📚 DialogueRoute: Loading dialogue by scene:', routeParams.scene);
      const dialogueData = getDialogue(routeParams.scene);
      console.log('📚 DialogueRoute: Dialogue data loaded:', dialogueData ? 'SUCCESS' : 'FAILED (null)');
      setDialogue(dialogueData);
    } else if (routeParams?.dialogueId) {
      // Load dialogue by ID
      console.log('📚 DialogueRoute: Loading dialogue by ID:', routeParams.dialogueId);
      const dialogueData = getDialogue(routeParams.dialogueId);
      console.log('📚 DialogueRoute: Dialogue data loaded:', dialogueData ? 'SUCCESS' : 'FAILED (null)');
      setDialogue(dialogueData);
    } else if (routeParams?.dialogue) {
      // Use custom dialogue data
      console.log('📚 DialogueRoute: Using custom dialogue data');
      setDialogue(routeParams.dialogue);
    } else {
      console.log('⚠️ DialogueRoute: No dialogue source provided in routeParams!');
    }

    // Set next route
    if (routeParams?.nextRoute) {
      setNextRoute(routeParams.nextRoute);
    }

    // Set completion action
    if (routeParams?.onComplete) {
      setOnCompleteAction(() => routeParams.onComplete);
    }
  }, [routeParams]);

  // Handle dialogue completion
  const handleComplete = () => {
    // Execute any completion actions
    if (onCompleteAction) {
      onCompleteAction(dispatch, gameState);
    }

    // Navigate to next route
    navigate(nextRoute);
  };

  // Handle player choices
  const handleChoice = (choice) => {
    console.log('📚 DialogueRoute: Player chose:', choice);

    // Execute choice action
    if (choice.action) {
      console.log('📚 DialogueRoute: Executing action:', choice.action);
      switch (choice.action) {
        case 'start_tutorial':
          // Set tutorial enemy and navigate to tutorial battle
          console.log('📚 Starting tutorial - setting enemy and navigating to battle');
          dispatch({ type: 'SET_TUTORIAL_ENABLED', enabled: true });
          dispatch({ type: 'SET_ENEMY_FOR_BATTLE', enemyData: tutorialEnemy });
          console.log('📚 Navigating to /battle with isTutorial: true');
          navigate('/battle', { isTutorial: true });
          break;

        case 'skip_tutorial':
          // Skip tutorial, go to map for biome/enemy selection
          dispatch({ type: 'SET_TUTORIAL_ENABLED', enabled: false });
          navigate('/map');
          break;

        case 'accept_deal':
          // Accept the mysterious stranger's deal
          dispatch({ type: 'APPLY_TALENT', talent: { name: 'Strength Boost', strength: 3 } });
          dispatch({ type: 'MODIFY_MAX_HEALTH', amount: -20 });
          navigate('/map');
          break;

        case 'refuse_deal':
          // Refuse the deal, get gold instead
          dispatch({ type: 'ADD_GOLD', amount: 50 });
          navigate('/map');
          break;

        case 'continue_to_battle':
          navigate('/battle');
          break;

        case 'continue_to_map':
          navigate('/map');
          break;

        case 'continue_to_map_tutorial':
          // Show map tutorial after this dialogue
          console.log('📚 Starting map tutorial');
          navigate('/map', { startMapTutorial: true });
          break;

        case 'skip_map_tutorial':
          // Skip map tutorial, go directly to map
          console.log('📚 Skipping map tutorial');
          dispatch({ type: 'SET_MAP_TUTORIAL_COMPLETED', completed: true });
          navigate('/map');
          break;

        case 'start_biome_tutorial':
          // Show biome tutorial after battle tutorial
          console.log('📚 Starting biome tutorial');
          navigate('/dialogue', { scene: 'biome_tutorial' });
          break;

        case 'continue_to_inventory_intro':
          // After biome tutorial, continue to inventory explanation
          console.log('📚 Continuing to inventory intro');
          navigate('/dialogue', { scene: 'post_map_tutorial' });
          break;

        case 'start_inventory_tutorial':
          // Show inventory tutorial dialogue
          console.log('📚 Starting inventory tutorial');
          navigate('/dialogue', { scene: 'inventory_tutorial' });
          break;

        case 'skip_inventory_tutorial':
          // Skip inventory tutorial, complete all tutorials
          console.log('📚 Skipping inventory tutorial');
          navigate('/dialogue', { scene: 'tutorial_complete' });
          break;

        case 'finish_inventory_tutorial':
          // Inventory tutorial complete, show final dialogue
          console.log('📚 Inventory tutorial complete!');
          navigate('/dialogue', { scene: 'tutorial_complete' });
          break;

        case 'start_real_game':
          // Tutorial complete! Start with Reed encounter
          console.log('📚 Tutorial complete! Starting Reed encounter');

          // Reset any tutorial state and ensure clean slate
          dispatch({ type: 'RESET_FOR_NEW_GAME' });

          console.log('📚 Navigating to Reed pre-battle encounter');
          navigate('/dialogue', { scene: 'reed_pre_battle_encounter' });
          break;

        // 🎭 STORY EVENT: Reed Pre-Battle Choices
        case 'reed_response_confident':
          console.log('🎭 Player chose confident response');
          navigate('/dialogue', { scene: 'reed_response_confident' });
          break;

        case 'reed_response_humble':
          console.log('🎭 Player chose humble response');
          navigate('/dialogue', { scene: 'reed_response_humble' });
          break;

        case 'reed_response_defiant':
          console.log('🎭 Player chose defiant response');
          navigate('/dialogue', { scene: 'reed_response_defiant' });
          break;

        case 'reed_response_diplomatic':
          console.log('🎭 Player chose diplomatic response');
          navigate('/dialogue', { scene: 'reed_response_diplomatic' });
          break;

        // 🎭 STORY EVENT: Start Reed Boss Fight (with different modifiers)
        case 'start_reed_boss_fight_energized':
          console.log('🎭 Starting Reed boss fight - Energized mode');
          // TODO: Add player buff (e.g., +1 max energy or starting energy)
          dispatch({ type: 'SET_PLAYER_COMBAT_STANCE', stance: 'energized' });
          navigate('/battle', { bossId: 'reed', playerStance: 'energized' });
          break;

        case 'start_reed_boss_fight_cautious':
          console.log('🎭 Starting Reed boss fight - Cautious mode');
          // TODO: Add player buff (e.g., +5 HP or damage reduction)
          dispatch({ type: 'SET_PLAYER_COMBAT_STANCE', stance: 'cautious' });
          navigate('/battle', { bossId: 'reed', playerStance: 'cautious' });
          break;

        case 'start_reed_boss_fight_aggressive':
          console.log('🎭 Starting Reed boss fight - Aggressive mode');
          // TODO: Add player buff (e.g., +2 damage to all attacks)
          dispatch({ type: 'SET_PLAYER_COMBAT_STANCE', stance: 'aggressive' });
          navigate('/battle', { bossId: 'reed', playerStance: 'aggressive' });
          break;

        case 'start_reed_boss_fight_tactical':
          console.log('🎭 Starting Reed boss fight - Tactical mode');
          // TODO: Add player buff (e.g., draw +1 card at start)
          dispatch({ type: 'SET_PLAYER_COMBAT_STANCE', stance: 'tactical' });
          navigate('/battle', { bossId: 'reed', playerStance: 'tactical' });
          break;

        // 🎭 STORY EVENT: Reed Post-Battle Rewards
        case 'give_reward_energized':
          console.log('🎭 Giving reward - Energized path');
          // TODO: Give reward (e.g., rare card or energy boost item)
          dispatch({ type: 'ADD_GOLD', amount: 100 });
          dispatch({ type: 'UNLOCK_CARD', cardType: 'rare_energize' });
          navigate('/map');
          break;

        case 'give_reward_cautious':
          console.log('🎭 Giving reward - Cautious path');
          // TODO: Give reward (e.g., defensive item or HP boost)
          dispatch({ type: 'ADD_GOLD', amount: 75 });
          dispatch({ type: 'MODIFY_MAX_HEALTH', amount: 15 });
          navigate('/map');
          break;

        case 'give_reward_aggressive':
          console.log('🎭 Giving reward - Aggressive path');
          // TODO: Give reward (e.g., damage boost card or attack item)
          dispatch({ type: 'ADD_GOLD', amount: 100 });
          dispatch({ type: 'UNLOCK_CARD', cardType: 'rare_attack' });
          navigate('/map');
          break;

        case 'give_reward_tactical':
          console.log('🎭 Giving reward - Tactical path');
          // TODO: Give reward (e.g., card draw item or utility card)
          dispatch({ type: 'ADD_GOLD', amount: 125 });
          dispatch({ type: 'UNLOCK_CARD', cardType: 'rare_utility' });
          navigate('/map');
          break;

        default:
          // Navigate to specified route if provided
          if (choice.nextRoute) {
            navigate(choice.nextRoute);
          } else {
            handleComplete();
          }
      }
    } else {
      // No specific action, continue to next route
      handleComplete();
    }
  };

  if (!dialogue) {
    console.log('⚠️ DialogueRoute: No dialogue loaded, showing loading screen');
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white text-2xl font-black">Loading dialogue...</p>
      </div>
    );
  }

  console.log('📚 DialogueRoute: Rendering DialogueBox with', dialogue.length, 'dialogue steps');
  console.log('🎨 Visual stance:', visualStance, '| Effects enabled:', visualEffectsEnabled);

  return (
    <DialogueBox
      dialogue={dialogue}
      onComplete={handleComplete}
      onChoice={handleChoice}
      visualStance={visualStance}
      visualEffectsEnabled={visualEffectsEnabled}
    />
  );
};
