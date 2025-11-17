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

  // Load dialogue on mount
  useEffect(() => {
    if (routeParams?.scene) {
      // Load dialogue by scene ID (same as dialogueId)
      const dialogueData = getDialogue(routeParams.scene);
      setDialogue(dialogueData);
    } else if (routeParams?.dialogueId) {
      // Load dialogue by ID
      const dialogueData = getDialogue(routeParams.dialogueId);
      setDialogue(dialogueData);
    } else if (routeParams?.dialogue) {
      // Use custom dialogue data
      setDialogue(routeParams.dialogue);
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
    console.log('Player chose:', choice);

    // Execute choice action
    if (choice.action) {
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
          // Tutorial complete! Start real gameplay
          console.log('📚 Tutorial complete! Starting real game');
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
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white text-2xl font-black">Loading dialogue...</p>
      </div>
    );
  }

  return (
    <DialogueBox
      dialogue={dialogue}
      onComplete={handleComplete}
      onChoice={handleChoice}
    />
  );
};
