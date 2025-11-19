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
      'tutorial_complete',
      'stijn_notification_tutorial',
      'stijn_level_up_encouragement',
      'stijn_floor_2_encouragement',
      'stijn_floor_3_surprise',
      'surprise_node_placeholder',
      'reed_pre_boss_dialogue',
      'reed_pre_boss_lore',
      'reed_pre_boss_tips',
      'reed_stijn_intro',
      'intro_mechanics_explanation'
    ];

    // Default to disabled unless we're in a story event scene
    const shouldEnableEffects = sceneId &&
      (sceneId.includes('reed') ||
       sceneId.includes('boss') ||
       sceneId.includes('response') ||
       sceneId.includes('defeat') ||
       sceneId.includes('mystery')) && // Enable for mystery nodes
      !disableEffectsFor.includes(sceneId);

    setVisualEffectsEnabled(shouldEnableEffects);

    // Detect visual stance from scene name
    if (sceneId) {
      if (sceneId.includes('mystery')) {
        // Mystery nodes use aggressive (dark red/orange) for eerie vibe
        setVisualStance('aggressive');
      } else if (sceneId.includes('energized') || sceneId.includes('confident')) {
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
          // Skip tutorial, show Reed & Stijn intro then go to map
          dispatch({ type: 'SET_TUTORIAL_ENABLED', enabled: false });
          dispatch({ type: 'RESET_FOR_NEW_GAME' });
          navigate('/dialogue', { scene: 'reed_stijn_intro' });
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
          // Tutorial complete! Start with intro dialogue
          console.log('📚 Tutorial complete! Starting intro dialogue');

          // Reset any tutorial state and ensure clean slate
          dispatch({ type: 'RESET_FOR_NEW_GAME' });

          console.log('📚 Navigating to Reed & Stijn intro dialogue');
          navigate('/dialogue', { scene: 'reed_stijn_intro' });
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

        // 🎭 STORY EVENT: Reed Challenge Accepted (go to map to progress)
        case 'reed_challenge_accepted':
          console.log('🎭 Reed challenge accepted - Player will meet Reed at the end');
          // Navigate to map where player can progress through encounters
          navigate('/map');
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

        // 🔮 MYSTERY NODE EVENTS

        // Flickering Lantern choices
        case 'mystery_lantern_left':
        case 'mystery_lantern_right':
          console.log('🔮 Mystery: Lantern path chosen');
          // 50/50 chance of fortune or misfortune
          const lanternOutcome = Math.random() < 0.5 ? 'mystery_outcome_fortune' : 'mystery_outcome_misfortune';
          navigate('/dialogue', { scene: lanternOutcome });
          break;

        // Whispering Voice choices
        case 'mystery_choose_power':
          console.log('🔮 Mystery: Chose power');
          // 60% chance of power, 40% chance of curse
          const powerOutcome = Math.random() < 0.6 ? 'mystery_outcome_power' : 'mystery_outcome_curse';
          navigate('/dialogue', { scene: powerOutcome });
          break;

        case 'mystery_choose_safety':
          console.log('🔮 Mystery: Chose safety');
          // 70% chance of blessing, 30% chance of nothing
          const safetyOutcome = Math.random() < 0.7 ? 'mystery_outcome_blessing' : 'mystery_outcome_nothing';
          navigate('/dialogue', { scene: safetyOutcome });
          break;

        // Oracle's Fortune
        case 'mystery_oracle_accept':
          console.log('🔮 Mystery: Paid oracle for fortune');
          // Check if player has enough gold
          if (gameState.gold >= 50) {
            dispatch({ type: 'ADD_GOLD', amount: -50 });
            // 70% chance of fortune, 30% chance of misfortune
            const oracleOutcome = Math.random() < 0.7 ? 'mystery_outcome_fortune' : 'mystery_outcome_misfortune';
            navigate('/dialogue', { scene: oracleOutcome });
          } else {
            // Not enough gold, get cursed
            navigate('/dialogue', { scene: 'mystery_outcome_curse' });
          }
          break;

        // Cursed Chest choices
        case 'mystery_open_chest':
          console.log('🔮 Mystery: Opened cursed chest');
          // 40% fortune, 60% misfortune
          const chestOutcome = Math.random() < 0.4 ? 'mystery_outcome_fortune' : 'mystery_outcome_misfortune';
          navigate('/dialogue', { scene: chestOutcome });
          break;

        case 'mystery_destroy_chest':
          console.log('🔮 Mystery: Destroyed cursed chest');
          // 50% nothing, 50% curse (angry spirits)
          const destroyOutcome = Math.random() < 0.5 ? 'mystery_outcome_nothing' : 'mystery_outcome_curse';
          navigate('/dialogue', { scene: destroyOutcome });
          break;

        // Dark Mirror choices
        case 'mystery_touch_mirror':
          console.log('🔮 Mystery: Touched the mirror');
          // 33% each for fortune, power, or misfortune
          const roll = Math.random();
          let mirrorOutcome;
          if (roll < 0.33) mirrorOutcome = 'mystery_outcome_fortune';
          else if (roll < 0.66) mirrorOutcome = 'mystery_outcome_power';
          else mirrorOutcome = 'mystery_outcome_misfortune';
          navigate('/dialogue', { scene: mirrorOutcome });
          break;

        case 'mystery_shatter_mirror':
          console.log('🔮 Mystery: Shattered the mirror');
          // Always get curse (7 years bad luck!)
          navigate('/dialogue', { scene: 'mystery_outcome_curse' });
          break;

        // Leave mystery node
        case 'mystery_leave':
          console.log('🔮 Mystery: Player walked away');
          navigate('/dialogue', { scene: 'mystery_outcome_nothing' });
          break;

        // Mystery Rewards
        case 'mystery_reward_fortune':
          console.log('🔮 Mystery Reward: Fortune!');
          dispatch({ type: 'ADD_GOLD', amount: 80 });
          dispatch({ type: 'HEAL_PLAYER', amount: 10 });
          navigate('/map');
          break;

        case 'mystery_reward_power':
          console.log('🔮 Mystery Reward: Power!');
          // Give random rare card
          dispatch({ type: 'UNLOCK_CARD', cardType: 'rare_random' });
          dispatch({ type: 'MODIFY_MAX_HEALTH', amount: -10 }); // Cost of power
          navigate('/map');
          break;

        case 'mystery_reward_blessing':
          console.log('🔮 Mystery Reward: Blessing!');
          dispatch({ type: 'HEAL_PLAYER', amount: 25 });
          dispatch({ type: 'MODIFY_MAX_HEALTH', amount: 10 });
          navigate('/map');
          break;

        // Mystery Penalties
        case 'mystery_penalty_misfortune':
          console.log('🔮 Mystery Penalty: Misfortune!');
          const goldToLose = Math.min(40, gameState.gold); // Lose up to 40 gold
          dispatch({ type: 'ADD_GOLD', amount: -goldToLose });
          dispatch({ type: 'DAMAGE_PLAYER', amount: 10 });
          navigate('/map');
          break;

        case 'mystery_penalty_curse':
          console.log('🔮 Mystery Penalty: Curse!');
          dispatch({ type: 'MODIFY_MAX_HEALTH', amount: -15 });
          dispatch({ type: 'DAMAGE_PLAYER', amount: 5 });
          navigate('/map');
          break;

        // 📚 NOTIFICATION TUTORIAL EVENTS
        case 'notification_tutorial_complete':
          console.log('📚 Notification tutorial complete!');
          dispatch({ type: 'MARK_NOTIFICATION_TUTORIAL_SHOWN' });
          navigate('/map');
          break;

        case 'level_up_tutorial_complete':
          console.log('📚 Level up tutorial complete!');
          dispatch({ type: 'MARK_LEVEL_UP_TUTORIAL_SHOWN' });
          navigate('/map');
          break;

        // 💬 FLOOR DIALOGUE EVENTS
        case 'floor_2_dialogue_complete':
          console.log('💬 Floor 2 dialogue complete!');
          dispatch({ type: 'MARK_FLOOR_2_DIALOGUE_SHOWN' });
          navigate('/map');
          break;

        case 'floor_3_dialogue_complete':
          console.log('💬 Floor 3 dialogue complete!');
          dispatch({ type: 'MARK_FLOOR_3_DIALOGUE_SHOWN' });
          navigate('/map');
          break;

        // 🎮 INTRO DIALOGUE ACTIONS
        case 'start_game_intro_complete':
          console.log('🎮 Intro dialogue complete - starting game!');
          navigate('/map');
          break;

        case 'intro_mechanics_explanation':
          console.log('🎮 Showing mechanics explanation');
          navigate('/dialogue', { scene: 'intro_mechanics_explanation' });
          break;

        // 👑 PRE-BOSS DIALOGUE ACTIONS
        case 'start_boss_battle':
          console.log('👑 Starting boss battle from dialogue!');
          // Boss data should already be set when node was selected
          navigate(gameState.showPreBattleLoadout ? '/pre-battle-loadout' : '/battle');
          break;

        case 'reed_pre_boss_lore':
          console.log('👑 Showing Reed lore dialogue');
          navigate('/dialogue', { scene: 'reed_pre_boss_lore' });
          break;

        case 'reed_pre_boss_tips':
          console.log('👑 Showing Reed tips dialogue');
          navigate('/dialogue', { scene: 'reed_pre_boss_tips' });
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
