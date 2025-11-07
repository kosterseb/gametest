import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { generateBranchingMap } from '../../utils/mapGenerator';
import { PageTransition } from '../UI/PageTransition';
import { MapNode } from './MapNode';
import { NBButton, NBHeading, NBBadge, NBCard } from '../UI/NeoBrutalUI';
import { Heart, Coins, Swords, HelpCircle, Crown, ShoppingCart, ArrowDown, CheckCircle } from 'lucide-react';
import { BattleRecapPopup } from '../UI/BattleRecapPopup';

// Path Selection Screen
const PathSelectionScreen = ({ actData, onSelectPath }) => {
  const [selectedPath, setSelectedPath] = useState(null);

  const handleConfirm = () => {
    if (selectedPath) {
      onSelectPath(selectedPath);
    }
  };

  const getPathIcon = (iconName) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-16 h-16" />;
      case 'Coins': return <Coins className="w-16 h-16" />;
      case 'HelpCircle': return <HelpCircle className="w-16 h-16" />;
      default: return <Swords className="w-16 h-16" />;
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'enemy': return <Swords className="w-5 h-5" />;
      case 'elite': return <Crown className="w-5 h-5" />;
      case 'boss': return <Crown className="w-6 h-6" />;
      case 'shop': return <ShoppingCart className="w-5 h-5" />;
      case 'joker': return <HelpCircle className="w-5 h-5" />;
      default: return <Swords className="w-5 h-5" />;
    }
  };

  const getNodeTypeLabel = (type) => {
    switch (type) {
      case 'enemy': return 'Battle';
      case 'elite': return 'Elite';
      case 'boss': return 'Boss';
      case 'shop': return 'Shop';
      case 'joker': return 'Mystery';
      default: return 'Node';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-purple p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <NBHeading level={1} className="mb-4 text-black">
              ACT {actData.actNumber} - CHOOSE YOUR PATH
            </NBHeading>
            <div className="nb-bg-white nb-border-lg nb-shadow px-6 py-3 inline-block">
              <p className="text-black font-bold uppercase">
                Select a path to take through this act
              </p>
            </div>
          </div>

          {/* Path Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {actData.paths.map((path) => {
              const isSelected = selectedPath === path.theme;

              return (
                <div
                  key={path.pathId}
                  onClick={() => setSelectedPath(path.theme)}
                  className={`
                    cursor-pointer transition-all duration-300
                    ${isSelected ? 'scale-105' : 'scale-100 opacity-90'}
                  `}
                >
                  <div className={`
                    nb-bg-${path.color} nb-border-xl nb-shadow-xl p-6
                    ${isSelected ? 'nb-shadow-colored-yellow animate-pulse' : ''}
                  `}>
                    {/* Path Header */}
                    <div className="text-center mb-6">
                      <div className="text-black mb-4">
                        {getPathIcon(path.icon)}
                      </div>
                      <NBHeading level={2} className="text-black mb-3">
                        {path.name}
                      </NBHeading>
                      <p className="text-black font-bold text-sm mb-4">
                        {path.description}
                      </p>
                    </div>

                    {/* Path Preview - All 4 floors + boss */}
                    <div className="space-y-3">
                      <div className="text-xs font-black text-black uppercase text-center mb-2">
                        Path Preview:
                      </div>

                      {/* Floors 1-4 */}
                      {path.floors.map((floor, idx) => (
                        <div
                          key={idx}
                          className="nb-bg-white nb-border nb-shadow-sm p-3 flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-black text-gray-700 uppercase">
                              Floor {floor.floor}:
                            </span>
                            <div className="flex items-center gap-1">
                              {getNodeIcon(floor.node.type)}
                              <span className="text-xs font-bold text-black uppercase">
                                {getNodeTypeLabel(floor.node.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Arrow to boss */}
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-6 h-6 text-black" />
                      </div>

                      {/* Boss floor */}
                      <div className="nb-bg-purple nb-border nb-shadow-lg p-3 flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-black text-white uppercase">
                            Floor {actData.bossFloor.floor}:
                          </span>
                          <div className="flex items-center gap-1">
                            {getNodeIcon('boss')}
                            <span className="text-xs font-bold text-white uppercase">
                              ACT BOSS
                            </span>
                          </div>
                        </div>
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
          {selectedPath && (
            <div className="text-center animate-fadeIn">
              <NBButton
                onClick={handleConfirm}
                variant="success"
                size="xl"
                className="px-12"
              >
                CONFIRM PATH SELECTION
              </NBButton>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

// Main Branching Map View
export const BranchingMapView = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [showRecap, setShowRecap] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

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

  const handlePathSelection = (pathTheme) => {
    dispatch({ type: 'SELECT_PATH', pathTheme });
  };

  const handleRecapContinue = () => {
    setShowRecap(false);
    dispatch({ type: 'CLEAR_BATTLE_RECAP' });
  };

  const handleNodeSelect = (node, floor) => {
    if (!node.available || node.completed) return;
    setSelectedNode(node);
    setSelectedFloor(floor);
  };

  const handleConfirmSelection = () => {
    if (!selectedNode) return;

    const isBossNode = selectedNode.type === 'boss';

    // Complete floor (except for boss - that's handled after victory)
    if (!isBossNode) {
      dispatch({ type: 'COMPLETE_FLOOR_IN_PATH' });
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
  };

  const handleCancelSelection = () => {
    setSelectedNode(null);
    setSelectedFloor(null);
  };

  if (gameState.branchingMap.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Generating paths...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const currentActData = gameState.branchingMap[gameState.currentAct - 1];

  // Show path selection if no path is selected yet
  if (!gameState.pathLocked && currentActData) {
    return <PathSelectionScreen actData={currentActData} onSelectPath={handlePathSelection} />;
  }

  // Get selected path data
  const selectedPathData = currentActData?.paths.find(p => p.theme === gameState.selectedPath);

  if (!selectedPathData) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Loading path...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-purple p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header - Player Stats */}
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-6 mb-8 sticky top-0 z-40">
            <div className="flex justify-between items-center mb-4">
              <div>
                <NBHeading level={1} className="mb-2">
                  ACT {gameState.currentAct}
                </NBHeading>
                <div className="flex items-center gap-3">
                  <NBBadge color={selectedPathData.color} className="text-sm px-3 py-1">
                    {selectedPathData.name}
                  </NBBadge>
                  <NBBadge color="cyan" className="text-sm px-3 py-1">
                    Floor {gameState.currentFloor}
                  </NBBadge>
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
          </div>

          {/* Path Progression */}
          <div className="relative">
            {/* Display all 4 floors in the path */}
            {selectedPathData.floors.map((floor, idx) => {
              const isPastFloor = gameState.completedFloors.includes(floor.floor);
              const isCurrentFloor = floor.floor === gameState.currentFloor;

              return (
                <div key={floor.floor} className="mb-8">
                  {/* Floor Badge */}
                  <div className="flex justify-center mb-4">
                    <NBBadge
                      color={isCurrentFloor ? 'yellow' : isPastFloor ? 'white' : selectedPathData.color}
                      className={`px-6 py-3 text-lg ${isCurrentFloor ? 'animate-pulse' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {isPastFloor && <CheckCircle className="w-5 h-5" />}
                        <span className="font-black uppercase">
                          Floor {floor.floor}
                        </span>
                      </div>
                    </NBBadge>
                  </div>

                  {/* Node */}
                  <div className="flex justify-center">
                    <MapNode
                      node={floor.node}
                      floor={floor.floor}
                      isSelected={selectedNode?.id === floor.node.id}
                      isCompleted={floor.node.completed}
                      isAvailable={floor.node.available}
                      onSelect={(node) => handleNodeSelect(node, floor.floor)}
                    />
                  </div>

                  {/* Connection Line */}
                  {idx < selectedPathData.floors.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <ArrowDown className="w-8 h-8 text-black" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Arrow to boss */}
            <div className="flex justify-center my-6">
              <ArrowDown className="w-10 h-10 text-black animate-bounce" />
            </div>

            {/* Boss Floor */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <NBBadge
                  color="purple"
                  className="px-8 py-4 text-xl animate-pulse"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6" />
                    <span className="font-black uppercase">
                      ACT BOSS - Floor {currentActData.bossFloor.floor}
                    </span>
                  </div>
                </NBBadge>
              </div>

              <div className="flex justify-center">
                <MapNode
                  node={currentActData.bossFloor.node}
                  floor={currentActData.bossFloor.floor}
                  isSelected={selectedNode?.id === currentActData.bossFloor.node.id}
                  isCompleted={currentActData.bossFloor.node.completed}
                  isAvailable={currentActData.bossFloor.node.available}
                  onSelect={(node) => handleNodeSelect(node, currentActData.bossFloor.floor)}
                />
              </div>
            </div>

            {/* Confirmation Panel */}
            {selectedNode && !selectedNode.completed && (
              <div className="mt-8 animate-fadeIn">
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
