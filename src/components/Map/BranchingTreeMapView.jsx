import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { generateBranchingMap } from '../../utils/mapGenerator';
import { PageTransition } from '../UI/PageTransition';
import { MapNode } from './MapNode';
import { NBButton, NBHeading, NBBadge } from '../UI/NeoBrutalUI';
import { Heart, Coins, ArrowDown, CheckCircle, MapIcon, Lightbulb } from 'lucide-react';
import { BattleRecapPopup } from '../UI/BattleRecapPopup';
import { ThreeDMapView } from './ThreeDMapView';
import { MapNavigationDashboard } from './MapNavigationDashboard';
import { MiniMap } from './MiniMap';
import { TutorialOverlay } from '../Tutorial/TutorialOverlay';
import { MAP_TUTORIAL_STEPS, getNextMapTutorialStep } from '../../data/mapTutorialSteps';

// Biome Selection Screen
const BiomeSelectionScreen = ({ actData, onSelectBiome }) => {
  const [selectedBiomeId, setSelectedBiomeId] = useState(null);

  const handleConfirm = () => {
    if (selectedBiomeId) {
      onSelectBiome(selectedBiomeId);
    }
  };

  // Safety check for actData structure
  if (!actData || !actData.biomeOptions || actData.biomeOptions.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">No biomes available...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

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

                    {/* Biome Stats */}
                    <div className="space-y-3">
                      <div className="nb-bg-white nb-border nb-shadow px-4 py-3">
                        <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Total Floors</div>
                        <div className="text-2xl font-black text-black">{biome.floors.length}</div>
                      </div>

                      <div className="nb-bg-white nb-border nb-shadow px-4 py-3">
                        <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Boss Floor</div>
                        <div className="text-2xl font-black text-black">{actData.bossFloor.floor}</div>
                      </div>

                      <div className="nb-bg-white nb-border nb-shadow px-4 py-3">
                        <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Difficulty</div>
                        <div className="text-lg font-black text-black uppercase">{biome.theme}</div>
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
  const { navigate, routeParams } = useRouter();
  const [showRecap, setShowRecap] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeScreenPos, setSelectedNodeScreenPos] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [cameraControls, setCameraControls] = useState(null);
  const [highlightPaths, setHighlightPaths] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  // 📚 Map Tutorial State
  const [showMapTutorial, setShowMapTutorial] = useState(false);
  const [currentMapTutorialStep, setCurrentMapTutorialStep] = useState(null);
  const [mapTutorialCompleted, setMapTutorialCompleted] = useState(
    gameState.mapTutorialCompleted || false
  );

  // 📚 Tutorial Mode - when true, interactions are controlled by tutorial
  const isInTutorialMode = showMapTutorial && !mapTutorialCompleted;

  // Use state from GameContext instead of local state
  const is3DView = gameState.prefer3DView;

  const handleCameraControlsReady = (controls) => {
    setCameraControls(controls);
  };

  const handleSelectedNodeScreenPosition = (pos) => {
    setSelectedNodeScreenPos(pos);
  };

  const handleHoveredNodeChange = (nodeData) => {
    setHoveredNode(nodeData);
  };

  // Get current act data and selected biome (must be before useEffects that reference them)
  const currentActData = gameState.branchingMap[gameState.currentAct - 1];
  const selectedBiomeData = currentActData?.biomeOptions.find(b => b.biomeId === gameState.selectedBiome);

  const currentNodePosition = React.useMemo(() => {
    if (!selectedBiomeData || !gameState.completedNodeIds || gameState.completedNodeIds.length === 0) {
      return { x: 0, y: 0 }; // Starting position
    }
    // Find the last completed node
    const lastCompletedId = gameState.completedNodeIds[gameState.completedNodeIds.length - 1];
    const allNodes = [...selectedBiomeData.floors.flatMap(f => f.nodes), currentActData?.bossFloor?.node].filter(Boolean);
    const lastNode = allNodes.find(n => n.id === lastCompletedId);
    return lastNode?.position || { x: 0, y: 0 };
  }, [gameState.completedNodeIds, selectedBiomeData, currentActData]);

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

  // Trigger floor transition animation when new nodes become available
  const prevAvailableCountRef = React.useRef(gameState.availableNodeIds.length);

  useEffect(() => {
    // Only trigger if the count actually increased (new nodes became available)
    if (!is3DView || !cameraControls?.animateToPosition || !selectedBiomeData) return;

    const currentCount = gameState.availableNodeIds.length;
    const prevCount = prevAvailableCountRef.current;

    // Only animate if count increased (not on initial load or when count stays same)
    if (currentCount > prevCount && prevCount > 0) {
      // Get the newly available nodes
      const availableNodes = gameState.availableNodeIds
        .map(id => {
          const allNodes = [
            ...selectedBiomeData.floors.flatMap(f => f.nodes),
            currentActData?.bossFloor?.node
          ].filter(Boolean);
          return allNodes.find(n => n.id === id);
        })
        .filter(Boolean);

      if (availableNodes.length > 0) {
        // Calculate average position of available nodes
        const avgX = availableNodes.reduce((sum, node) => sum + node.position.x, 0) / availableNodes.length;
        const avgY = availableNodes.reduce((sum, node) => sum + node.position.y, 0) / availableNodes.length;

        // Animate camera to focus on available nodes
        cameraControls.animateToPosition(avgX, avgY, 800);
      }
    }

    // Update the ref for next time
    prevAvailableCountRef.current = currentCount;
  }, [gameState.availableNodeIds.length, is3DView]);

  // 📚 Start map tutorial if requested via route params
  useEffect(() => {
    if (routeParams?.startMapTutorial && !mapTutorialCompleted) {
      console.log('📚 Starting map tutorial from route params!');
      setTimeout(() => {
        setCurrentMapTutorialStep(MAP_TUTORIAL_STEPS[0]);
        setShowMapTutorial(true);
      }, 500);
    }
  }, [routeParams?.startMapTutorial, mapTutorialCompleted]);

  // 📚 Tutorial progression handlers
  const advanceMapTutorial = useCallback(() => {
    if (!currentMapTutorialStep || mapTutorialCompleted) return;

    const nextStep = getNextMapTutorialStep(currentMapTutorialStep.id);
    if (nextStep) {
      setCurrentMapTutorialStep(nextStep);
    } else {
      // Tutorial complete - navigate to inventory intro dialogue
      setMapTutorialCompleted(true);
      setShowMapTutorial(false);
      dispatch({ type: 'SET_MAP_TUTORIAL_COMPLETED', completed: true });

      console.log('📚 Map tutorial complete! Navigating to inventory intro');
      setTimeout(() => {
        navigate('/dialogue', { scene: 'post_map_tutorial' });
      }, 500);
    }
  }, [currentMapTutorialStep, mapTutorialCompleted, dispatch, navigate]);

  const handleMapTutorialNext = useCallback(() => {
    advanceMapTutorial();
  }, [advanceMapTutorial]);

  const handleMapTutorialSkip = useCallback(() => {
    setMapTutorialCompleted(true);
    setShowMapTutorial(false);
    dispatch({ type: 'SET_MAP_TUTORIAL_COMPLETED', completed: true });
  }, [dispatch]);

  // 📚 Tutorial event checker
  const checkMapTutorialProgress = useCallback((eventType) => {
    if (!showMapTutorial || !currentMapTutorialStep || mapTutorialCompleted) return;

    // Check if current step is waiting for this event
    if (currentMapTutorialStep.waitFor === eventType && currentMapTutorialStep.autoAdvance) {
      console.log('📚 Map tutorial event triggered:', eventType);
      advanceMapTutorial();
    }
  }, [showMapTutorial, currentMapTutorialStep, mapTutorialCompleted, advanceMapTutorial]);

  const handleBiomeSelection = (biomeId) => {
    dispatch({ type: 'SELECT_BIOME', biomeId });
  };

  const handleRecapContinue = () => {
    setShowRecap(false);
    dispatch({ type: 'CLEAR_BATTLE_RECAP' });

    // 📚 Check if we should start map tutorial after closing recap
    console.log('📚 Recap closed - checking map tutorial trigger:', {
      tutorialCompleted: gameState.tutorialCompleted,
      mapTutorialCompleted
    });

    if (gameState.tutorialCompleted && !mapTutorialCompleted) {
      console.log('📚 Starting map tutorial after recap!');
      setTimeout(() => {
        setCurrentMapTutorialStep(MAP_TUTORIAL_STEPS[0]);
        setShowMapTutorial(true);
      }, 500);
    }
  };

  const handleNodeSelect = (node) => {
    if (!node.available || node.completed) return;
    setSelectedNode(node);
    setSelectedNodeScreenPos(null); // Reset screen position when selecting new node

    // Trigger camera shake for boss nodes
    if (node.type === 'boss' && cameraControls?.shake) {
      cameraControls.shake();
    }

    // 📚 Tutorial: Check if node was selected
    checkMapTutorialProgress('node_selected');
  };

  const handleConfirmSelection = () => {
    if (!selectedNode) return;

    // 📚 Tutorial: Check if node was confirmed
    checkMapTutorialProgress('node_confirmed');

    // 📚 Tutorial Mode: Prevent actual navigation during tutorial
    if (isInTutorialMode) {
      console.log('📚 Tutorial mode: Node confirmation blocked. Complete tutorial first!');
      // Deselect node but don't navigate
      setSelectedNode(null);
      return;
    }

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
    setSelectedNodeScreenPos(null);
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

  // Guard: Check if act data is available
  if (!currentActData) {
    console.log('⚠️ BranchingTreeMapView: No currentActData. branchingMapLength:', gameState.branchingMap?.length, 'currentAct:', gameState.currentAct);
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-purple flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Loading Act Data...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Show biome selection if no biome is selected yet
  if (!gameState.biomeLocked) {
    console.log('🗺️ BranchingTreeMapView: Showing biome selection. actData:', {
      actNumber: currentActData.actNumber,
      biomeCount: currentActData.biomeOptions?.length
    });
    return <BiomeSelectionScreen actData={currentActData} onSelectBiome={handleBiomeSelection} />;
  }

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
      <div className="h-screen relative overflow-hidden">
        {/* 3D View - Fills entire screen */}
        {is3DView && (
          <div className="absolute inset-0">
            <ThreeDMapView
              selectedBiomeData={selectedBiomeData}
              currentActData={currentActData}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
              availableNodeIds={gameState.availableNodeIds}
              completedNodeIds={gameState.completedNodeIds}
              onSelectedNodeScreenPosition={handleSelectedNodeScreenPosition}
              onCameraControlsReady={handleCameraControlsReady}
              highlightPaths={highlightPaths}
              onHoveredNodeChange={handleHoveredNodeChange}
              avatarSeed={gameState.profile?.avatarSeed}
              currentNodePosition={currentNodePosition}
            />
          </div>
        )}

        {/* Header - Player Stats - Fixed on top with backdrop */}
        <div className="absolute top-0 left-0 right-0 p-6 z-40 pointer-events-none">
            <div className="flex justify-between items-center pointer-events-auto">
              {/* Act + Biome Info - White Box */}
              <div className="nb-bg-white nb-border-xl nb-shadow-xl p-4">
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

              {/* Player Stats */}
              <div className="flex gap-3 items-center">
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

            {/* 📚 Tutorial Mode Banner */}
            {isInTutorialMode && (
              <div className="mt-4 pointer-events-auto">
                <div className="nb-bg-orange nb-border-xl nb-shadow-xl p-4 animate-pulse">
                  <div className="flex items-center justify-center gap-2">
                    <Lightbulb className="w-6 h-6 text-black" />
                    <span className="text-black font-black text-lg uppercase">Tutorial Mode - Learn the Map!</span>
                  </div>
                  <div className="text-center text-black font-bold text-sm mt-1">
                    Navigation is disabled during tutorial
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Navigation Button - Left Side (only in 3D view, hidden during tutorial) */}
        {is3DView && !isInTutorialMode && (
          <div className="absolute left-4 top-48 z-40">
              <NBButton
                onClick={() => setIsDashboardOpen(true)}
                variant="white"
                size="md"
                className="w-16 h-16 flex items-center justify-center p-0"
                aria-label="Open navigation dashboard"
              >
                <MapIcon className="w-8 h-8" />
              </NBButton>
          </div>
        )}

        {/* 2D View - Branching Tree Display with scrolling */}
        {!is3DView && (
          <div className="flex-1 overflow-y-auto px-8">
            <div className="relative max-w-6xl mx-auto">
              {/* SVG Connection Lines Overlay */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {selectedBiomeData.floors.map((floor) =>
                  floor.nodes.map((node) => {
                    if (!node.childrenIds || node.childrenIds.length === 0) return null;

                    return node.childrenIds.map((childId) => {
                      // Find the child node
                      const childNode = selectedBiomeData.floors
                        .flatMap(f => f.nodes)
                        .find(n => n.id === childId);

                      if (!childNode) return null;

                      // Calculate approximate positions
                      const parentFloorIdx = selectedBiomeData.floors.findIndex(f =>
                        f.nodes.some(n => n.id === node.id)
                      );
                      const childFloorIdx = selectedBiomeData.floors.findIndex(f =>
                        f.nodes.some(n => n.id === childId)
                      );

                      const parentNodeIdx = selectedBiomeData.floors[parentFloorIdx].nodes.findIndex(n => n.id === node.id);
                      const childNodeIdx = selectedBiomeData.floors[childFloorIdx].nodes.findIndex(n => n.id === childId);

                      const parentFloorNodes = selectedBiomeData.floors[parentFloorIdx].nodes.length;
                      const childFloorNodes = selectedBiomeData.floors[childFloorIdx].nodes.length;

                      // Approximate center positions
                      const parentX = 50 + (parentNodeIdx - (parentFloorNodes - 1) / 2) * 15;
                      const parentY = parentFloorIdx * 180 + 150;
                      const childX = 50 + (childNodeIdx - (childFloorNodes - 1) / 2) * 15;
                      const childY = childFloorIdx * 180 + 100;

                      const isActive = gameState.availableNodeIds.includes(childId) ||
                                     gameState.completedNodeIds.includes(node.id);

                      return (
                        <line
                          key={`${node.id}-${childId}`}
                          x1={`${parentX}%`}
                          y1={parentY}
                          x2={`${childX}%`}
                          y2={childY}
                          stroke="#000000"
                          strokeWidth={isActive ? 4 : 2}
                          opacity={isActive ? 1 : 0.3}
                        />
                      );
                    });
                  })
                )}

                {/* Lines to boss */}
                {selectedBiomeData.floors[selectedBiomeData.floors.length - 1]?.nodes.map((node) => {
                  const lastFloorIdx = selectedBiomeData.floors.length - 1;
                  const nodeIdx = selectedBiomeData.floors[lastFloorIdx].nodes.findIndex(n => n.id === node.id);
                  const floorNodes = selectedBiomeData.floors[lastFloorIdx].nodes.length;

                  const startX = 50 + (nodeIdx - (floorNodes - 1) / 2) * 15;
                  const startY = lastFloorIdx * 180 + 150;
                  const endX = 50;
                  const endY = (lastFloorIdx + 1) * 180 + 100;

                  return (
                    <line
                      key={`${node.id}-boss`}
                      x1={`${startX}%`}
                      y1={startY}
                      x2={`${endX}%`}
                      y2={endY}
                      stroke="#000000"
                      strokeWidth={2}
                      opacity={0.3}
                    />
                  );
                })}
              </svg>

              {/* Display tree floor by floor */}
              {selectedBiomeData.floors.map((floor, floorIdx) => (
              <div key={floor.floor} className="mb-12 relative" style={{ zIndex: 1 }}>
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
              </div>
            ))}

            {/* Boss Floor */}
            <div className="mb-8 mt-12 relative" style={{ zIndex: 1 }}>
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
          </div>
        )}

        {/* Confirmation Panel - Show in both 2D and 3D */}
          {selectedNode && !selectedNode.completed && (
            <div
              className="animate-fadeIn fixed z-50"
              style={is3DView && selectedNodeScreenPos ? {
                left: `${Math.min(selectedNodeScreenPos.x + 80, window.innerWidth - 400)}px`, // Position beside with bounds check
                top: `${Math.max(180, Math.min(selectedNodeScreenPos.y, window.innerHeight - 200))}px`, // Keep away from header (180px) and bottom
                transform: 'translateY(-50%)'
              } : {
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '2rem'
              }}
            >
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
                      variant={isInTutorialMode ? 'cyan' :
                        (selectedNode.type === 'boss' ? 'danger' :
                        selectedNode.type === 'elite' ? 'orange' : 'success')}
                      size="lg"
                      className="px-8 py-4 text-xl"
                    >
                      {isInTutorialMode ? '✓ PRACTICE SELECT' : 'CONFIRM'}
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

        {/* Hover Tooltip - Node Preview */}
        {is3DView && hoveredNode && hoveredNode.screenPos && !selectedNode && (
          <div
            className="fixed z-45 pointer-events-none"
            style={{
              left: `${hoveredNode.screenPos.x + 60}px`,
              top: `${hoveredNode.screenPos.y}px`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="nb-bg-white nb-border-lg nb-shadow-lg p-3 animate-fadeIn">
              <div className="font-black text-sm text-black uppercase mb-1">
                {hoveredNode.node.type}
              </div>
              {(hoveredNode.node.type === 'enemy' || hoveredNode.node.type === 'elite' || hoveredNode.node.type === 'boss') && hoveredNode.node.enemyData && (
                <div className="text-xs">
                  <div className="font-bold text-black">{hoveredNode.node.enemyData.name}</div>
                  <div className="text-gray-700 font-semibold">
                    HP: {hoveredNode.node.enemyData.health} | Gold: {hoveredNode.node.enemyData.goldReward[0]}-{hoveredNode.node.enemyData.goldReward[1]}
                  </div>
                </div>
              )}
              {hoveredNode.node.type === 'shop' && (
                <div className="text-xs font-semibold text-gray-700">Buy cards & items</div>
              )}
              {hoveredNode.node.type === 'joker' && (
                <div className="text-xs font-semibold text-gray-700">Mystery event</div>
              )}
            </div>
          </div>
        )}

        {/* Map Navigation Dashboard */}
        {is3DView && (
          <MapNavigationDashboard
            isOpen={isDashboardOpen}
            onClose={() => setIsDashboardOpen(false)}
            cameraControls={cameraControls}
            currentNodePosition={currentNodePosition}
            highlightPaths={highlightPaths}
            onToggleHighlight={() => setHighlightPaths(!highlightPaths)}
          />
        )}

        {/* Mini-Map */}
        {is3DView && (
          <MiniMap
            selectedBiomeData={selectedBiomeData}
            currentActData={currentActData}
            availableNodeIds={gameState.availableNodeIds}
            completedNodeIds={gameState.completedNodeIds}
          />
        )}

        {/* Map Tutorial Overlay */}
        {showMapTutorial && currentMapTutorialStep && (
          <TutorialOverlay
            message={currentMapTutorialStep.message}
            onNext={currentMapTutorialStep.autoAdvance ? null : handleMapTutorialNext}
            onSkip={handleMapTutorialSkip}
            showNext={!currentMapTutorialStep.autoAdvance}
            showSkip={false}
            highlightArea={currentMapTutorialStep.highlightArea}
            position={currentMapTutorialStep.position || 'bottom-left'}
          />
        )}
      </div>
    </PageTransition>
  );
};
