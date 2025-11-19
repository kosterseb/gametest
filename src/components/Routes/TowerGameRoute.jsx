import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useGame } from '../../context/GameContext';
import TowerGame from '../MiniGames/TowerGame';

const TowerGameRoute = () => {
  const { navigate, routeParams } = useRouter();
  const { gameState, dispatch } = useGame();

  // Get game mode and difficulty from route params, or use defaults
  const gameMode = routeParams.gameMode || 'score';
  const difficulty = routeParams.difficulty || 'medium';

  const handleComplete = (rewards) => {
    console.log('🏗️ Tower game completed! Rewards:', rewards);

    // Award the rewards
    if (rewards.gold > 0) {
      dispatch({ type: 'ADD_GOLD', amount: rewards.gold });
    }

    if (rewards.xp > 0) {
      dispatch({ type: 'ADD_EXPERIENCE', amount: rewards.xp });
    }

    // Complete the event node in the branching map
    // The nodeId should be passed via routeParams
    if (routeParams.nodeId) {
      dispatch({ type: 'COMPLETE_NODE_IN_TREE', nodeId: routeParams.nodeId });
    }

    // Navigate back to the map after completing the minigame
    setTimeout(() => {
      navigate('/map');
    }, 500);
  };

  return (
    <TowerGame
      onComplete={handleComplete}
      difficulty={difficulty}
      gameMode={gameMode}
    />
  );
};

export default TowerGameRoute;
