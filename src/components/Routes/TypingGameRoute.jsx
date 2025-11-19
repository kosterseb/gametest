import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useGame } from '../../context/GameContext';
import TypingGame from '../MiniGames/TypingGame';

const TypingGameRoute = () => {
  const { navigate, routeParams } = useRouter();
  const { gameState, dispatch } = useGame();

  const handleComplete = (rewards) => {
    console.log('🎉 Typing game completed! Rewards:', rewards);

    // Award the rewards
    if (rewards.gold > 0) {
      dispatch({ type: 'ADD_GOLD', amount: rewards.gold });
    }

    if (rewards.xp > 0) {
      dispatch({ type: 'ADD_EXPERIENCE', amount: rewards.xp });
    }

    // Complete the surprise node in the branching map
    // Find the surprise node in the current act and mark it as completed
    const currentAct = gameState.branchingMap[gameState.currentAct - 1];
    if (currentAct && gameState.selectedBiome) {
      const selectedBiome = currentAct.biomeOptions.find(b => b.biomeId === gameState.selectedBiome);
      if (selectedBiome) {
        // Find the surprise node on floor 4
        const floor4Number = (gameState.currentAct - 1) * 5 + 4;
        const floor4 = selectedBiome.floors.find(f => f.floor === floor4Number);
        if (floor4) {
          const surpriseNode = floor4.nodes.find(n => n.type === 'surprise');
          if (surpriseNode) {
            // Complete this node
            dispatch({ type: 'COMPLETE_NODE_IN_TREE', nodeId: surpriseNode.id });
          }
        }
      }
    }

    // Navigate back to the map after completing the minigame
    setTimeout(() => {
      navigate('/map');
    }, 500);
  };

  return <TypingGame onComplete={handleComplete} difficulty="medium" />;
};

export default TypingGameRoute;
