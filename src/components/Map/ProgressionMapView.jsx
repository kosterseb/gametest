import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { generateMap } from '../../utils/mapGenerator';
import { bossEnemies, finalBoss } from '../../data/enemies';
import { PageTransition } from '../UI/PageTransition';
import { MapNode } from './MapNode';
import { ActDivider } from './ActDivider';
import { Heart, Coins, ArrowDown, CheckCircle } from 'lucide-react';

export const ProgressionMapView = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (gameState.progressionMap.length === 0) {
      const newMap = generateMap(25);
      dispatch({ type: 'INITIALIZE_MAP', map: newMap });
    }
  }, [gameState.progressionMap.length, dispatch]);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    dispatch({ type: 'SELECT_NODE', nodeId: node.id });
  };

  const handleConfirmSelection = () => {
    if (!selectedNode) return;

    dispatch({ type: 'COMPLETE_NODE', nodeId: selectedNode.id });

    const currentFloorData = gameState.progressionMap.find(f => f.floor === gameState.currentFloor);

    if (currentFloorData?.isActEnd && selectedNode.type !== 'boss') {
      navigate('/act-transition');
      return;
    }

    switch (selectedNode.type) {
      case 'enemy':
      case 'elite':
        dispatch({
          type: 'SET_ENEMY_FOR_BATTLE',
          enemyData: selectedNode.enemyData,
          isBoss: false
        });

        if (gameState.showPreBattleLoadout) {
          navigate('/pre-battle-loadout');
        } else {
          navigate('/battle');
        }
        break;

      case 'boss':
        const isFinalBoss = selectedNode.bossIndex === 'final';
        const bossData = isFinalBoss
          ? finalBoss
          : bossEnemies[selectedNode.bossIndex % bossEnemies.length];

        dispatch({
          type: 'SET_ENEMY_FOR_BATTLE',
          enemyData: bossData,
          isBoss: true
        });

        if (gameState.showPreBattleLoadout) {
          navigate('/pre-battle-loadout');
        } else {
          navigate('/battle');
        }
        break;

      case 'shop':
        navigate('/shop');
        break;

      case 'joker':
        navigate('/joker');
        break;

      default:
        break;
    }
  };

  if (gameState.progressionMap.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-2xl">Generating map...</div>
        </div>
      </PageTransition>
    );
  }

  const currentFloorData = gameState.progressionMap.find(f => f.floor === gameState.currentFloor);
  const isBattleNode = selectedNode?.type === 'enemy' || selectedNode?.type === 'elite' || selectedNode?.type === 'boss';

  // Get visible floors (current + next 3)
  const visibleFloors = gameState.progressionMap.slice(
    Math.max(0, gameState.currentFloor - 1),
    gameState.currentFloor + 3
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header - Player Stats */}
          <div className="bg-gradient-to-r from-purple-800 to-indigo-800 bg-opacity-90 p-6 rounded-xl mb-8 shadow-2xl border-2 border-purple-500 sticky top-0 z-40">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Floor {gameState.currentFloor}
                </h1>
                <p className="text-purple-200 text-sm">
                  Act {gameState.currentAct} • {currentFloorData?.isBossFloor ? '⚠️ Boss Fight!' : 'Choose your path'}
                </p>
              </div>

              {/* Player Stats */}
              <div className="flex gap-4">
                <div className="bg-red-900 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-red-500">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-xl font-bold text-white">
                      {gameState.playerHealth}/{gameState.maxPlayerHealth}
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-900 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-yellow-500">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-white">{gameState.gold}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="text-xs text-purple-200 mb-1">
                Progress: {gameState.completedNodes.length}/25 nodes completed
              </div>
              <div className="w-full bg-purple-950 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(gameState.completedNodes.length / 25) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Map Path */}
          <div className="relative">
            {visibleFloors.map((floorData, floorIndex) => {
              const isCurrentFloor = floorData.floor === gameState.currentFloor;
              const isPastFloor = floorData.floor < gameState.currentFloor;
              const showActDivider = floorData.floor % 5 === 1 && floorData.floor > 1;

              return (
                <div key={floorData.floor}>
                  {/* Act Divider */}
                  {showActDivider && <ActDivider actNumber={floorData.act} />}

                  {/* Floor Container */}
                  <div className={`
          relative mb-12
          ${isCurrentFloor ? 'scale-100' : 'scale-95 opacity-80'}
          transition-all duration-300
        `}>
                    {/* Floor Number Badge */}
                    <div className="flex justify-center mb-6">
                      <div className={`
              ${isCurrentFloor ? 'bg-yellow-500 border-yellow-300 animate-pulse' : isPastFloor ? 'bg-gray-600 border-gray-500' : 'bg-purple-700 border-purple-500'}
              px-6 py-2 rounded-full border-4 shadow-lg
            `}>
                        <div className="flex items-center gap-2">
                          {isPastFloor && <CheckCircle className="w-5 h-5 text-white" />}
                          <span className="text-white font-bold text-lg">
                            Floor {floorData.floor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nodes */}
                    <div className="flex justify-center items-center gap-8">
                      {floorData.nodes.map((node) => {
                        const isSelected = selectedNode?.id === node.id;
                        const isCompleted = gameState.completedNodes.includes(node.id);
                        const isAvailable = node.available;

                        return (
                          <div key={node.id} className="relative">
                            <MapNode
                              node={node}
                              floor={floorData.floor}
                              isSelected={isSelected}
                              isCompleted={isCompleted}
                              isAvailable={isAvailable}
                              onSelect={handleNodeSelect}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Node Action Panel - MOVED HERE */}
                    {isCurrentFloor && selectedNode && !gameState.completedNodes.includes(selectedNode.id) && (
                      <div className="mt-8 animate-in slide-in-from-top duration-300">
                        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-6 rounded-xl shadow-2xl border-4 border-yellow-400">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold mb-4 text-white">
                              {selectedNode.type === 'boss' ? '⚔️ Fight Boss' :
                                selectedNode.type === 'elite' ? '⚔️ Fight Elite' :
                                  selectedNode.type === 'enemy' ? 'Enter Battle' :
                                    selectedNode.type === 'shop' ? 'Visit Shop' : 'Enter Mystery Node'}?
                            </h3>

                            {/* Enemy Quick Info */}
                            {(selectedNode.type === 'enemy' || selectedNode.type === 'elite' || selectedNode.type === 'boss') && selectedNode.enemyData && (
                              <div className="mb-4 bg-black bg-opacity-30 p-4 rounded-lg inline-block">
                                <div className="flex items-center gap-4">
                                  <div className="text-4xl">{selectedNode.enemyData.emoji}</div>
                                  <div className="text-left">
                                    <div className="font-bold text-lg text-white">{selectedNode.enemyData.name}</div>
                                    <div className="text-sm text-gray-300">
                                      HP: {selectedNode.enemyData.health} • Gold: {selectedNode.enemyData.goldReward[0]}-{selectedNode.enemyData.goldReward[1]}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Loadout Info */}
                            {isBattleNode && (
                              <div className="mb-4 text-sm text-purple-200">
                                {gameState.showPreBattleLoadout
                                  ? '💡 Pre-battle loadout screen enabled'
                                  : '💡 Skipping directly to battle'}
                              </div>
                            )}

                            <div className="flex justify-center gap-4">
                              <button
                                onClick={handleConfirmSelection}
                                className={`
                        ${selectedNode.type === 'boss' ? 'bg-red-600 hover:bg-red-700' :
                                    selectedNode.type === 'elite' ? 'bg-orange-600 hover:bg-orange-700' :
                                      'bg-green-600 hover:bg-green-700'}
                        text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg
                      `}
                              >
                                Confirm
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedNode(null);
                                  dispatch({ type: 'SELECT_NODE', nodeId: null });
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Connection Line to Next Floor */}
                    {floorIndex < visibleFloors.length - 1 && (
                      <div className="flex justify-center mt-6">
                        <ArrowDown className={`
                w-8 h-8
                ${isPastFloor ? 'text-gray-600' : 'text-purple-400'}
              `} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          
        </div>
      </div>
    </PageTransition>
  );
};