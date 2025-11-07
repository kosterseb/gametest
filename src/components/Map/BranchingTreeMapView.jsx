import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { generateBranchingMap } from '../../utils/mapGenerator';
import { PageTransition } from '../UI/PageTransition';
import { MapNode } from './MapNode';
import { NBButton, NBHeading, NBBadge } from '../UI/NeoBrutalUI';
import { Heart, Coins, ArrowDown, CheckCircle, Maximize, Minimize } from 'lucide-react';
import { BattleRecapPopup } from '../UI/BattleRecapPopup';
import { ThreeDMapView } from './ThreeDMapView';

// Biome Selection Screen
const BiomeSelectionScreen = ({ actData, onSelectBiome }) => {
  const [selectedBiomeId, setSelectedBiomeId] = useState(null);

  const handleConfirm = () => {
    if (selectedBiomeId) {
      onSelectBiome(selectedBiomeId);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-purple p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <NBHeading level={1} className="mb-4 text-black">
              ACT {actData.actNumber} - CHOOSE YOUR BIOME
            </NBHeading>
            <div className="nb-bg-white nb-border-lg nb-shadow px-6 py-3 inline-block">
              <p className="text-black font-bold uppercase">
                Select which biome to explore
              </p>
            </div>
          </div>

          {/* Biome Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {actData.biomeOptions.map((biome) => {
              const isSelected = selectedBiomeId === biome.biomeId;

              return (
                <div
                  key={biome.biomeId}
                  onClick={() => setSelectedBiomeId(biome.biomeId)}
                  className={`
                    cursor-pointer transition-all duration-300
                    ${isSelected ? 'scale-105' : 'scale-100 opacity-90'}
                  `}
                >
                  <div className={`
                    nb-bg-${biome.color} nb-border-xl nb-shadow-xl p-6
                    ${isSelected ? 'nb-shadow-colored-yellow animate-pulse' : ''}
                  `}>
                    {/* Biome Header */}
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">{biome.icon}</div>
                      <NBHeading level={2} className="text-black mb-3">
                        {biome.name}
                      </NBHeading>
                      <p className="text-black font-bold text-sm mb-4">
                        {biome.description}
                      </p>
                      <div className="text-xs text-black font-semibold">
                        Theme: {biome.theme.toUpperCase()}
                      </div>
                    </div>

                    {/* Tree Preview - Simplified */}
                    <div className="space-y-2">
                      <div className="text-xs font-black text-black uppercase text-center mb-2">
                        Branching Path Preview:
                      </div>

                      {biome.floors.map((floor, idx) => (
                        <div key={floor.floor} className="mb-2">
                          <div className="text-xs text-black font-bold text-center mb-1">
                            Floor {floor.floor}
                          </div>
                          <div className="flex justify-center gap-2 flex-wrap">
                            {floor.nodes.map((node, nodeIdx) => (
                              <div
                                key={node.id}
                                className="nb-bg-white nb-border nb-shadow-sm px-2 py-1 text-xs font-bold uppercase"
                              >
                                {node.type}
                              </div>
                            ))}
                          </div>
                          {idx < biome.floors.length - 1 && (
                            <div className="flex justify-center mt-1">
                              <ArrowDown className="w-4 h-4 text-black" />
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-center mt-2">
                        <ArrowDown className="w-5 h-5 text-black animate-bounce" />
                      </div>

                      <div className="nb-bg-purple nb-border nb-shadow-lg p-2 text-center">
                        <span className="text-xs font-bold text-white uppercase">
                          BOSS FLOOR {actData.bossFloor.floor}
                        </span>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-4 text-center">
                        <NBBadge color="yellow" className="px-4 py-2 text-sm animate-pulse">
                          ✓ SELECTED
                        </NBBadge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          {selectedBiomeId && (
            <div className="text-center animate-fadeIn">
              <NBButton
                onClick={handleConfirm}
                variant="success"
                size="xl"
                className="px-12"
              >
                CONFIRM BIOME SELECTION
              </NBButton>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

// Main Branching Tree Map View
export const BranchingTreeMapView = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [showRecap, setShowRecap] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [is3DView, setIs3DView] = useState(true); // Start with 3D view by default

  // Initialize branching map
  useEffect(() => {
    if (gameState.branchingMap.length === 0) {
      const newMap = generateBranchingMap(5);
      dispatch({ type: 'INITIALIZE_BRANCHING_MAP', map: newMap });
    }
  }, [gameState.branchingMap.length, dispatch]);

  // Show battle recap when returning from battle
  useEffect(() => {
    if (gameState.showBattleRecap && gameState.lastBattleRewards) {
      setShowRecap(true);
    }
  }, [gameState.showBattleRecap, gameState.lastBattleRewards]);

  const handleBiomeSelection = (biomeId) => {
    dispatch({ type: 'SELECT_BIOME', biomeId });
  };

  const handleRecapContinue = () => {
    setShowRecap(false);
    dispatch({ type: 'CLEAR_BATTLE_RECAP' });
  };

  const handleNodeSelect = (node) => {
    if (!node.available || node.completed) return;
    setSelectedNode(node);
  };

  const handleConfirmSelection = () => {
    if (!selectedNode) return;

    const isBossNode = selectedNode.type === 'boss';

    // Complete node (except boss - that's handled after victory)
    if (!isBossNode) {
      dispatch({ type: 'COMPLETE_NODE_IN_TREE', nodeId: selectedNode.id });
    }

    // Navigate based on node type
    if (selectedNode.type === 'enemy' || selectedNode.type === 'elite' || selectedNode.type === 'boss') {
      dispatch({
        type: 'SET_ENEMY_FOR_BATTLE',
        enemyData: selectedNode.enemyData,
        isBoss: isBossNode
      });

      if (gameState.showPreBattleLoadout) {
        navigate('/pre-battle-loadout');
      } else {
        navigate('/battle');
      }
    } else if (selectedNode.type === 'shop') {
      navigate('/shop');
    } else if (selectedNode.type === 'joker') {
      navigate('/joker');
    }

    setSelectedNode(null);
  };

  const handleCancelSelection = () => {
    setSelectedNode(null);
  };

  if (gameState.branchingMap.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Generating biomes...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const currentActData = gameState.branchingMap[gameState.currentAct - 1];

  // Show biome selection if no biome is selected yet
  if (!gameState.biomeLocked && currentActData) {
    return <BiomeSelectionScreen actData={currentActData} onSelectBiome={handleBiomeSelection} />;
  }

  // Get selected biome data
  const selectedBiomeData = currentActData?.biomeOptions.find(b => b.biomeId === gameState.selectedBiome);

  if (!selectedBiomeData) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Loading biome...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-purple p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header - Player Stats */}
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6 mb-8 sticky top-0 z-40">
            <div className="flex justify-between items-center mb-4">
              <div>
                <NBHeading level={1} className="mb-2">
                  ACT {gameState.currentAct}
                </NBHeading>
                <div className="flex items-center gap-3 flex-wrap">
                  <NBBadge color={selectedBiomeData.color} className="text-sm px-3 py-1">
                    {selectedBiomeData.icon} {selectedBiomeData.name}
                  </NBBadge>
                  <NBBadge color="cyan" className="text-sm px-3 py-1">
                    Theme: {selectedBiomeData.theme}
                  </NBBadge>
                </div>
              </div>

              {/* Player Stats and Controls */}
              <div className="flex gap-3 items-center">
                {/* 3D Toggle Button */}
                <NBButton
                  onClick={() => setIs3DView(!is3DView)}
                  variant={is3DView ? "success" : "white"}
                  size="sm"
                  className="px-4 py-2"
                >
                  {is3DView ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
                  {is3DView ? '2D' : '3D'}
                </NBButton>

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
          </div>

          {/* 3D View */}
          {is3DView && (
            <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
              <ThreeDMapView
                selectedBiomeData={selectedBiomeData}
                currentActData={currentActData}
                selectedNode={selectedNode}
                onNodeSelect={handleNodeSelect}
                availableNodeIds={gameState.availableNodeIds}
                completedNodeIds={gameState.completedNodeIds}
              />
            </div>
          )}

          {/* 2D View - Branching Tree Display */}
          {!is3DView && (
            <div className="relative">
              {/* Display tree floor by floor */}
              {selectedBiomeData.floors.map((floor, floorIdx) => (
              <div key={floor.floor} className="mb-12">
                {/* Floor Badge */}
                <div className="flex justify-center mb-6">
                  <NBBadge
                    color={selectedBiomeData.color}
                    className="px-6 py-3 text-lg"
                  >
                    <span className="font-black uppercase">
                      Floor {floor.floor}
                    </span>
                  </NBBadge>
                </div>

                {/* Nodes in this floor */}
                <div className="flex justify-center items-center gap-6 flex-wrap">
                  {floor.nodes.map((node) => (
                    <div key={node.id} className="relative">
                      <MapNode
                        node={node}
                        floor={floor.floor}
                        isSelected={selectedNode?.id === node.id}
                        isCompleted={node.completed}
                        isAvailable={node.available}
                        onSelect={handleNodeSelect}
                      />
                    </div>
                  ))}
                </div>

                {/* Connection Arrow */}
                {floorIdx < selectedBiomeData.floors.length - 1 && (
                  <div className="flex justify-center mt-6">
                    <ArrowDown className="w-10 h-10 text-black" />
                  </div>
                )}
              </div>
            ))}

            {/* Arrow to boss */}
            <div className="flex justify-center my-8">
              <ArrowDown className="w-12 h-12 text-black animate-bounce" />
            </div>

            {/* Boss Floor */}
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <NBBadge
                  color="purple"
                  className="px-8 py-4 text-xl animate-pulse"
                >
                  <span className="font-black uppercase">
                    ACT BOSS - Floor {currentActData.bossFloor.floor}
                  </span>
                </NBBadge>
              </div>

              <div className="flex justify-center">
                <MapNode
                  node={currentActData.bossFloor.node}
                  floor={currentActData.bossFloor.floor}
                  isSelected={selectedNode?.id === currentActData.bossFloor.node.id}
                  isCompleted={currentActData.bossFloor.node.completed}
                  isAvailable={currentActData.bossFloor.node.available}
                  onSelect={handleNodeSelect}
                />
              </div>
            </div>
          </div>
          )}

          {/* Confirmation Panel - Show in both 2D and 3D */}
          {selectedNode && !selectedNode.completed && (
            <div className="mt-8 animate-fadeIn fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
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
                      onClick={handleCancelSelection}
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
