import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { generateMap } from '../../utils/mapGenerator';
import { bossEnemies, finalBoss } from '../../data/enemies';
import { PageTransition } from '../UI/PageTransition';
import { MapNode } from './MapNode';
import { ActDivider } from './ActDivider';
import { Heart, Coins, ArrowDown, CheckCircle } from 'lucide-react';
import { NBButton, NBHeading, NBBadge, NBProgressBar } from '../UI/NeoBrutalUI';
import { BattleRecapPopup } from '../UI/BattleRecapPopup';

export const ProgressionMapView = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [selectedNode, setSelectedNode] = useState(null);
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    if (gameState.progressionMap.length === 0) {
      const newMap = generateMap(25);
      dispatch({ type: 'INITIALIZE_MAP', map: newMap });
    }
  }, [gameState.progressionMap.length, dispatch]);

  // Show battle recap when returning from battle
  useEffect(() => {
    if (gameState.showBattleRecap && gameState.lastBattleRewards) {
      setShowRecap(true);
    }
  }, [gameState.showBattleRecap, gameState.lastBattleRewards]);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    dispatch({ type: 'SELECT_NODE', nodeId: node.id });
  };

  const handleRecapContinue = () => {
    setShowRecap(false);
    dispatch({ type: 'CLEAR_BATTLE_RECAP' });
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
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Generating map...</div>
          </div>
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
      <div className="min-h-screen nb-bg-purple p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header - Player Stats */}
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6 mb-8 sticky top-0 z-40">
            <div className="flex justify-between items-center mb-4">
              <div>
                <NBHeading level={1} className="mb-2">
                  FLOOR {gameState.currentFloor}
                </NBHeading>
                <div className="flex items-center gap-3">
                  <NBBadge color="cyan" className="text-sm px-3 py-1">
                    ACT {gameState.currentAct}
                  </NBBadge>
                  {currentFloorData?.isBossFloor && (
                    <NBBadge color="red" className="text-sm px-3 py-1 animate-pulse">
                      BOSS FIGHT!
                    </NBBadge>
                  )}
                </div>
              </div>

              {/* Player Stats */}
              <div className="flex gap-3">
                <div className="nb-bg-red nb-border-lg nb-shadow px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-black" />
                    <span className="text-xl font-black text-black">
                      {gameState.playerHealth}/{gameState.maxPlayerHealth}
                    </span>
                  </div>
                </div>
                <div className="nb-bg-yellow nb-border-lg nb-shadow px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-black" />
                    <span className="text-xl font-black text-black">{gameState.gold}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <NBProgressBar
                value={gameState.completedNodes.length}
                max={25}
                color="green"
                label="PROGRESS"
                showValue={true}
              />
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
                      <NBBadge
                        color={isCurrentFloor ? 'yellow' : isPastFloor ? 'white' : 'purple'}
                        className={`px-6 py-3 text-lg ${isCurrentFloor ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {isPastFloor && <CheckCircle className="w-5 h-5" />}
                          <span className="font-black uppercase">
                            Floor {floorData.floor}
                          </span>
                        </div>
                      </NBBadge>
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
                        <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6">
                          <div className="text-center">
                            <NBHeading level={2} className="mb-6">
                              {selectedNode.type === 'boss' ? 'FIGHT BOSS' :
                                selectedNode.type === 'elite' ? 'FIGHT ELITE' :
                                  selectedNode.type === 'enemy' ? 'ENTER BATTLE' :
                                    selectedNode.type === 'shop' ? 'VISIT SHOP' : 'ENTER MYSTERY NODE'}?
                            </NBHeading>

                            {/* Enemy Quick Info */}
                            {(selectedNode.type === 'enemy' || selectedNode.type === 'elite' || selectedNode.type === 'boss') && selectedNode.enemyData && (
                              <div className="mb-6 nb-bg-cyan nb-border-xl nb-shadow-lg p-4 inline-block">
                                <div className="flex items-center gap-4">
                                  <div className="text-5xl">{selectedNode.enemyData.emoji}</div>
                                  <div className="text-left">
                                    <div className="font-black text-xl text-black uppercase">{selectedNode.enemyData.name}</div>
                                    <div className="text-sm text-gray-800 font-bold">
                                      HP: {selectedNode.enemyData.health} • Gold: {selectedNode.enemyData.goldReward[0]}-{selectedNode.enemyData.goldReward[1]}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Loadout Info */}
                            {isBattleNode && (
                              <div className="mb-6">
                                <NBBadge color="purple" className="text-sm px-4 py-2">
                                  {gameState.showPreBattleLoadout
                                    ? 'Pre-battle loadout screen enabled'
                                    : 'Skipping directly to battle'}
                                </NBBadge>
                              </div>
                            )}

                            <div className="flex justify-center gap-4">
                              <NBButton
                                onClick={handleConfirmSelection}
                                variant={selectedNode.type === 'boss' ? 'danger' :
                                  selectedNode.type === 'elite' ? 'orange' : 'success'}
                                size="lg"
                                className="px-8 py-4 text-xl"
                              >
                                CONFIRM
                              </NBButton>

                              <NBButton
                                onClick={() => {
                                  setSelectedNode(null);
                                  dispatch({ type: 'SELECT_NODE', nodeId: null });
                                }}
                                variant="white"
                                size="lg"
                                className="px-8 py-4 text-xl"
                              >
                                CANCEL
                              </NBButton>
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
                ${isPastFloor ? 'text-gray-600' : 'text-black'}
              `} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>


        </div>

        {/* Battle Recap Popup */}
        {showRecap && gameState.lastBattleRewards && gameState.battleStartStats && (
          <BattleRecapPopup
            goldBefore={gameState.battleStartStats.gold}
            goldAfter={gameState.gold}
            expBefore={gameState.battleStartStats.experience}
            expAfter={gameState.profile?.experience || 0}
            levelBefore={gameState.battleStartStats.level}
            levelAfter={gameState.profile?.level || 1}
            hpBefore={gameState.battleStartStats.health}
            hpAfter={gameState.playerHealth}
            maxHp={gameState.maxPlayerHealth}
            onContinue={handleRecapContinue}
          />
        )}
      </div>
    </PageTransition>
  );
};