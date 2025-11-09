import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Line, Billboard, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Node type to color mapping - Neo-Brutal bright colors
const NODE_COLORS = {
  enemy: '#ef4444',      // red
  elite: '#f97316',      // orange
  boss: '#dc2626',       // dark red
  shop: '#eab308',       // yellow
  joker: '#8b5cf6',      // purple
  event: '#3b82f6',      // blue
  mystery: '#a855f7',    // purple
  god: '#fbbf24',        // gold
  rest: '#06b6d4'        // cyan
};

// Edge component for thick black outlines
const Edges = ({ geometry }) => {
  return (
    <lineSegments>
      <edgesGeometry args={[geometry]} />
      <lineBasicMaterial color="#000000" linewidth={3} />
    </lineSegments>
  );
};

// 3D Node Component - Neo-Brutal Style
const Node3D = ({ node, position, isSelected, isAvailable, isCompleted, onClick, highlightMode, onHoverChange }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const geometryRef = useRef();

  // Notify parent of hover changes
  React.useEffect(() => {
    if (onHoverChange) {
      onHoverChange(hovered ? { node, position } : null);
    }
  }, [hovered, node, position, onHoverChange]);

  // Subtle animations only
  useFrame((state) => {
    if (!meshRef.current) return;

    // Enhanced bounce for available nodes when highlight mode is active
    const bounceMultiplier = (highlightMode && isAvailable && !isCompleted) ? 2.5 : 1;
    const bounceSpeed = (highlightMode && isAvailable && !isCompleted) ? 3 : 2;

    // Very subtle bounce for available nodes only (local offset only, group already positioned)
    if (isAvailable && !isCompleted) {
      const bounce = Math.sin(state.clock.elapsedTime * bounceSpeed) * 0.05 * bounceMultiplier;
      meshRef.current.position.y = bounce;
    } else {
      meshRef.current.position.y = 0;
    }
  });

  const color = NODE_COLORS[node.type] || '#ffffff';
  // Opacity: completed = 0.4, unavailable = 0.3, available = 1.0
  const opacity = isCompleted ? 0.4 : (isAvailable ? 1.0 : 0.3);

  // Chunky geometric shapes for neo-brutal
  // Scale based on Z position for depth effect (things further back are slightly smaller)
  const { geometry, baseScale } = useMemo(() => {
    switch (node.type) {
      case 'boss':
        return { geometry: new THREE.BoxGeometry(1, 1, 1), baseScale: 1.2 };
      case 'elite':
        return { geometry: new THREE.BoxGeometry(0.8, 0.8, 0.8), baseScale: 1 };
      case 'god':
        return { geometry: new THREE.OctahedronGeometry(0.6), baseScale: 1 };
      default:
        return { geometry: new THREE.BoxGeometry(0.7, 0.7, 0.7), baseScale: 1 };
    }
  }, [node.type]);

  // Parallax depth scaling - objects further back (negative Z) are slightly smaller
  const depthScale = 1 + position[2] * 0.05;
  const scale = baseScale * depthScale;

  return (
    <group position={position}>
      {/* Main node mesh - Flat shading, no metallic */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        scale={isSelected ? scale * 1.2 : (hovered ? scale * 1.05 : scale)}
        onClick={(e) => {
          e.stopPropagation();
          if (isAvailable && !isCompleted && onClick) {
            onClick(node);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <meshBasicMaterial
          color={color}
          transparent={isCompleted}
          opacity={opacity}
        />
      </mesh>

      {/* Thick black outline edges - raycast disabled to not block hover */}
      <lineSegments
        scale={isSelected ? scale * 1.2 : (hovered ? scale * 1.05 : scale)}
        raycast={() => null}
      >
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial
          color="#000000"
          linewidth={4}
          transparent={!isAvailable && !isCompleted}
          opacity={!isAvailable && !isCompleted ? 0.3 : 1.0}
        />
      </lineSegments>

      {/* Selection indicator - chunky ring (rotated to face viewer) */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
          <ringGeometry args={[0.8, 1.0, 8]} />
          <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Completed checkmark - bigger and bolder */}
      {isCompleted && (
        <Billboard>
          <Text
            position={[0, 0, 0.6]}
            fontSize={0.5}
            color="#22c55e"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
            fontWeight="bold"
          >
            ✓
          </Text>
        </Billboard>
      )}

      {/* God node indicator */}
      {node.type === 'god' && !isCompleted && (
        <Billboard position={[0, 1, 0]}>
          <Text
            fontSize={0.4}
            color="#fbbf24"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            ✨
          </Text>
        </Billboard>
      )}

      {/* Node label - bold text */}
      <Billboard position={[0, -0.8, 0]}>
        <Text
          fontSize={0.25}
          color="#000000"
          anchorX="center"
          anchorY="top"
          fontWeight="black"
        >
          {node.type.toUpperCase()}
        </Text>
      </Billboard>

      {/* Highlight glow effect - only for available nodes in highlight mode */}
      {highlightMode && isAvailable && !isCompleted && (
        <pointLight
          position={[0, 0, 0]}
          color={color}
          intensity={1.5}
          distance={3}
        />
      )}
    </group>
  );
};

// Player Avatar Indicator - Shows where the player is
const PlayerAvatar = ({ position, avatarSeed }) => {
  const groupRef = useRef();

  // Bobbing animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    groupRef.current.position.y = position[1] + 1.2 + bob;
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      <Billboard>
        <Html center>
          <div className="relative">
            {/* Avatar with neo-brutal styling */}
            <div className="nb-bg-white nb-border-lg nb-shadow-xl p-1">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}`}
                alt="Player"
                className="w-12 h-12 nb-border"
              />
            </div>
            {/* Pointer arrow */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
              <div className="w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-black absolute -top-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </Html>
      </Billboard>

      {/* Subtle glow underneath */}
      <pointLight
        position={[0, -0.5, 0]}
        color="#fbbf24"
        intensity={0.8}
        distance={2}
      />
    </group>
  );
};

// Particle Trail Component for Completed Paths
const ParticleTrail = ({ start, end }) => {
  const particlesRef = useRef();
  const particleCount = 8;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      temp.push({
        offset: i / particleCount,
        speed: 0.5 + Math.random() * 0.5
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    particles.forEach((particle, i) => {
      const progress = (state.clock.elapsedTime * particle.speed + particle.offset) % 1;
      const position = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        progress
      );

      if (particlesRef.current.children[i]) {
        particlesRef.current.children[i].position.copy(position);
      }
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Neo-Brutal Connection Line Component
const ConnectionLine = ({ start, end, active = false, completed = false, highlightMode = false }) => {
  const lineRef = useRef();

  // Straight thick lines for neo-brutal aesthetic
  const points = useMemo(() => {
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ];
  }, [start, end]);

  // Determine line color: completed = gold, active = black, inactive = gray
  const lineColor = completed ? '#fbbf24' : (active ? '#000000' : '#9ca3af');
  const lineWidth = completed ? 8 : (active ? 6 : 3);

  // Pulse animation for highlight mode
  useFrame((state) => {
    if (lineRef.current && highlightMode && active && !completed) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      lineRef.current.material.opacity = pulse;
    } else if (lineRef.current) {
      lineRef.current.material.opacity = 1;
    }
  });

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        color={lineColor}
        lineWidth={lineWidth}
        transparent={highlightMode && active && !completed}
      />

      {/* Glow effect for completed paths */}
      {completed && (
        <Line
          points={points}
          color="#fde047"
          lineWidth={12}
          transparent={true}
          opacity={0.3}
        />
      )}

      {/* Enhanced glow for active paths in highlight mode */}
      {highlightMode && active && !completed && (
        <Line
          points={points}
          color="#a78bfa"
          lineWidth={10}
          transparent={true}
          opacity={0.4}
        />
      )}

      {/* Particle trail for completed paths */}
      {completed && <ParticleTrail start={start} end={end} />}
    </>
  );
};

// Floor Label Component - Neo-Brutal
const FloorLabel = ({ position, floorNumber }) => {
  return (
    <Billboard position={position}>
      <Text
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        fontWeight="black"
      >
        FLOOR {floorNumber}
      </Text>
    </Billboard>
  );
};

// Drag/Pan Camera Controller with Parallax
const DragPanCamera = ({ onCameraControlsReady }) => {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [shake, setShake] = useState({ active: false, startTime: 0 });
  const [zoom, setZoom] = useState(0); // Zoom offset from default position
  const [transition, setTransition] = useState({ active: false, startTime: 0, startPos: { x: 0, y: 0 }, targetPos: { x: 0, y: 0 }, duration: 1000 });

  // Expose camera control functions
  React.useEffect(() => {
    if (onCameraControlsReady) {
      onCameraControlsReady({
        resetCamera: () => {
          setCameraOffset({ x: 0, y: 0 });
          setZoom(0);
        },
        showOverview: () => {
          setCameraOffset({ x: 0, y: 0 });  // Center camera
          setZoom(5);  // Zoom out to see whole map
        },
        focusOnPosition: (x, y) => {
          setCameraOffset({
            x: Math.max(-8, Math.min(8, -x)),
            y: Math.max(-12, Math.min(8, -y))  // Increased downward limit to 12
          });
          setZoom(0);  // Reset zoom when focusing on position
        },
        animateToPosition: (x, y, duration = 1000) => {
          const targetX = Math.max(-8, Math.min(8, -x));
          const targetY = Math.max(-12, Math.min(8, -y));  // Increased downward limit to 12
          setTransition({
            active: true,
            startTime: Date.now(),
            startPos: { x: cameraOffset.x, y: cameraOffset.y },
            targetPos: { x: targetX, y: targetY },
            duration
          });
        },
        shake: () => setShake({ active: true, startTime: Date.now() }),
        zoomIn: () => setZoom(prev => Math.max(-6, prev - 2)),  // Move closer (min 6 units from origin)
        zoomOut: () => setZoom(prev => Math.min(6, prev + 2))   // Move farther (max 18 units from origin)
      });
    }
  }, [onCameraControlsReady, cameraOffset]);

  // Track mouse for subtle parallax when NOT dragging
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position to -1 to 1
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;

      setMouse({ x: normalizedX, y: normalizedY });

      // Handle dragging
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Convert screen space to world space movement with limits
        const newX = cameraOffset.x - deltaX * 0.01;
        const newY = cameraOffset.y + deltaY * 0.01;

        setCameraOffset({
          x: Math.max(-8, Math.min(8, newX)),   // Limit X movement
          y: Math.max(-12, Math.min(8, newY))   // Increased downward limit to 12 for better floor visibility
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, cameraOffset]);

  // Apply camera movement
  useFrame((state) => {
    // Smooth transition animation
    if (transition.active) {
      const elapsed = Date.now() - transition.startTime;
      const progress = Math.min(elapsed / transition.duration, 1);

      // Ease-in-out function for smooth animation
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const easedProgress = easeInOutCubic(progress);

      const newX = transition.startPos.x + (transition.targetPos.x - transition.startPos.x) * easedProgress;
      const newY = transition.startPos.y + (transition.targetPos.y - transition.startPos.y) * easedProgress;

      setCameraOffset({ x: newX, y: newY });

      if (progress >= 1) {
        setTransition({ ...transition, active: false });
      }
    }

    // Parallax effect (subtle) when not dragging
    const parallaxX = isDragging ? 0 : mouse.x * 0.5;
    const parallaxY = isDragging ? 0 : mouse.y * 0.3;

    // Camera shake effect
    let shakeX = 0;
    let shakeY = 0;
    if (shake.active) {
      const elapsed = Date.now() - shake.startTime;
      const shakeDuration = 500; // 0.5 seconds

      if (elapsed < shakeDuration) {
        const intensity = (1 - elapsed / shakeDuration) * 0.3; // Decay over time
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
      } else {
        setShake({ active: false, startTime: 0 });
      }
    }

    camera.position.x = cameraOffset.x + parallaxX + shakeX;
    camera.position.y = 2 + cameraOffset.y + parallaxY + shakeY;
    camera.position.z = 12 + zoom; // Apply zoom offset to Z position
  });

  return null;
};

// Screen Position Tracker - Converts 3D position to 2D screen coordinates
const ScreenPositionTracker = ({ position, onPositionUpdate }) => {
  const { camera, size } = useThree();

  useFrame(() => {
    if (!position || !onPositionUpdate) return;

    // Create a vector from the 3D position
    const vector = new THREE.Vector3(...position);

    // Project to screen space
    vector.project(camera);

    // Convert to pixel coordinates
    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (vector.y * -2.5 + 0.5) * size.height;

    onPositionUpdate({ x, y });
  });

  return null;
};

// Main 3D Scene
const MapScene = ({ selectedBiomeData, currentActData, selectedNode, onNodeSelect, availableNodeIds, completedNodeIds, onSelectedNodeScreenPosition, onCameraControlsReady, highlightPaths, onHoveredNodeChange, avatarSeed, currentNodePosition }) => {
  const [hoveredNodeData, setHoveredNodeData] = useState(null);

  // Track hovered node changes and notify parent
  React.useEffect(() => {
    if (onHoveredNodeChange) {
      onHoveredNodeChange(hoveredNodeData);
    }
  }, [hoveredNodeData, onHoveredNodeChange]);
  // Calculate CONNECTION LINE positions (true positions for path structure)
  const connectionPositions = useMemo(() => {
    const positions = new Map();
    const floors = selectedBiomeData.floors;
    const verticalSpacing = 3;  // Spacing for connection lines
    const horizontalSpacing = 1.8;

    floors.forEach((floor, floorIdx) => {
      const xPositions = floor.nodes.map(n => n.position.x);
      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      const centerOffset = (minX + maxX) / 2;

      floor.nodes.forEach((node) => {
        const x = (node.position.x - centerOffset) * horizontalSpacing;
        const y = -node.position.y * verticalSpacing;
        const z = -node.position.y * 1.2;
        positions.set(node.id, [x, y, z]);
      });
    });

    if (currentActData.bossFloor) {
      const floorCount = floors.length;
      positions.set(currentActData.bossFloor.node.id, [0, -floorCount * verticalSpacing, -floorCount * 1.2]);
    }

    return positions;
  }, [selectedBiomeData, currentActData]);

  // Calculate VISUAL NODE positions (adjustable for alignment with lines)
  const visualNodePositions = useMemo(() => {
    const positions = new Map();
    const floors = selectedBiomeData.floors;
    const verticalSpacing = 3;  // Match connection line spacing for alignment
    const horizontalSpacing = 1.8;
    const yOffset = 0; // Adjustable offset to align nodes with connection points

    floors.forEach((floor, floorIdx) => {
      const xPositions = floor.nodes.map(n => n.position.x);
      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      const centerOffset = (minX + maxX) / 2;

      floor.nodes.forEach((node) => {
        const x = (node.position.x - centerOffset) * horizontalSpacing;
        const y = -node.position.y * verticalSpacing + yOffset;
        const z = -node.position.y * 1.2;
        positions.set(node.id, [x, y, z]);
      });
    });

    if (currentActData.bossFloor) {
      const floorCount = floors.length;
      positions.set(currentActData.bossFloor.node.id, [0, -floorCount * verticalSpacing + yOffset, -floorCount * 1.2]);
    }

    return positions;
  }, [selectedBiomeData, currentActData]);

  // Create connection lines (using connectionPositions for true path structure)
  const connections = useMemo(() => {
    const lines = [];
    selectedBiomeData.floors.forEach((floor) => {
      floor.nodes.forEach((node) => {
        if (node.childrenIds && node.childrenIds.length > 0) {
          node.childrenIds.forEach((childId) => {
            const startPos = connectionPositions.get(node.id);
            const endPos = connectionPositions.get(childId);
            if (startPos && endPos) {
              const isActive = availableNodeIds.includes(childId) || completedNodeIds.includes(node.id);
              // Connection is completed if both parent and child nodes are completed
              const isCompleted = completedNodeIds.includes(node.id) && completedNodeIds.includes(childId);
              lines.push({
                start: startPos,
                end: endPos,
                active: isActive,
                completed: isCompleted
              });
            }
          });
        }
      });
    });

    // Boss connections
    const lastFloor = selectedBiomeData.floors[selectedBiomeData.floors.length - 1];
    if (lastFloor && currentActData.bossFloor) {
      lastFloor.nodes.forEach((node) => {
        const startPos = connectionPositions.get(node.id);
        const endPos = connectionPositions.get(currentActData.bossFloor.node.id);
        if (startPos && endPos) {
          const isCompleted = completedNodeIds.includes(node.id) && completedNodeIds.includes(currentActData.bossFloor.node.id);
          lines.push({
            start: startPos,
            end: endPos,
            active: false,
            completed: isCompleted
          });
        }
      });
    }

    return lines;
  }, [selectedBiomeData, currentActData, connectionPositions, availableNodeIds, completedNodeIds]);

  return (
    <>
      {/* Bright lighting for neo-brutal */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Fixed isometric camera */}
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={45} rotation={[-0.15, 0, 0]} />

      {/* Drag/Pan controls with parallax effect */}
      <DragPanCamera onCameraControlsReady={onCameraControlsReady} />

      {/* Connection Lines */}
      {connections.map((conn, idx) => (
        <ConnectionLine
          key={idx}
          start={conn.start}
          end={conn.end}
          active={conn.active}
          completed={conn.completed}
          highlightMode={highlightPaths}
        />
      ))}

      {/* Nodes (using visualNodePositions for adjustable alignment) */}
      {selectedBiomeData.floors.map((floor) =>
        floor.nodes.map((node) => {
          const position = visualNodePositions.get(node.id);
          if (!position) return null;

          return (
            <Node3D
              key={node.id}
              node={node}
              position={position}
              isSelected={selectedNode?.id === node.id}
              isAvailable={availableNodeIds.includes(node.id)}
              isCompleted={completedNodeIds.includes(node.id)}
              onClick={onNodeSelect}
              highlightMode={highlightPaths}
              onHoverChange={setHoveredNodeData}
            />
          );
        })
      )}

      {/* Boss Node (using visualNodePositions) */}
      {currentActData.bossFloor && (
        <Node3D
          node={currentActData.bossFloor.node}
          position={visualNodePositions.get(currentActData.bossFloor.node.id)}
          isSelected={selectedNode?.id === currentActData.bossFloor.node.id}
          isAvailable={availableNodeIds.includes(currentActData.bossFloor.node.id)}
          isCompleted={completedNodeIds.includes(currentActData.bossFloor.node.id)}
          onClick={onNodeSelect}
          highlightMode={highlightPaths}
          onHoverChange={setHoveredNodeData}
        />
      )}

      {/* Player Avatar Indicator */}
      {avatarSeed && completedNodeIds.length > 0 && (() => {
        // Find the last completed node to show player position
        const lastCompletedId = completedNodeIds[completedNodeIds.length - 1];
        const playerPosition = visualNodePositions.get(lastCompletedId);

        if (playerPosition) {
          return (
            <PlayerAvatar
              position={playerPosition}
              avatarSeed={avatarSeed}
            />
          );
        }
        return null;
      })()}

      {/* Screen Position Tracker for Hovered Node */}
      {hoveredNodeData && (
        <ScreenPositionTracker
          position={hoveredNodeData.position}
          onPositionUpdate={(pos) => {
            if (onHoveredNodeChange) {
              onHoveredNodeChange({ ...hoveredNodeData, screenPos: pos });
            }
          }}
        />
      )}

      {/* Floor Labels */}
      {selectedBiomeData.floors.map((floor, idx) => (
        <FloorLabel
          key={floor.floor}
          position={[-8, -idx * 3, 0]}
          floorNumber={floor.floor}
        />
      ))}

      {/* Boss Floor Label */}
      {currentActData.bossFloor && (
        <FloorLabel
          position={[-8, -(selectedBiomeData.floors.length) * 3, 0]}
          floorNumber={currentActData.bossFloor.floor}
        />
      )}

      {/* Track selected node screen position (using visualNodePositions) */}
      {selectedNode && (
        <ScreenPositionTracker
          position={visualNodePositions.get(selectedNode.id)}
          onPositionUpdate={onSelectedNodeScreenPosition}
        />
      )}
    </>
  );
};

// Main 3D Map View Component
export const ThreeDMapView = ({
  selectedBiomeData,
  currentActData,
  selectedNode,
  onNodeSelect,
  availableNodeIds,
  completedNodeIds,
  onSelectedNodeScreenPosition,
  onCameraControlsReady,
  highlightPaths,
  onHoveredNodeChange,
  avatarSeed,
  currentNodePosition
}) => {
  const containerRef = React.useRef(null);

  // Disable scroll wheel to prevent accidental zooming/scrolling
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventWheel = (e) => {
      e.preventDefault();
    };

    container.addEventListener('wheel', preventWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', preventWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        {/* Biome-specific neo-brutal background colors */}
        <color attach="background" args={[
          selectedBiomeData.color === 'red' ? '#fca5a5' :
          selectedBiomeData.color === 'orange' ? '#fdba74' :
          selectedBiomeData.color === 'yellow' ? '#fde047' :
          selectedBiomeData.color === 'green' ? '#86efac' :
          selectedBiomeData.color === 'cyan' ? '#67e8f9' :
          selectedBiomeData.color === 'blue' ? '#93c5fd' :
          selectedBiomeData.color === 'purple' ? '#c4b5fd' :
          selectedBiomeData.color === 'pink' ? '#f9a8d4' :
          '#a78bfa'  // default purple
        ]} />

        <MapScene
          selectedBiomeData={selectedBiomeData}
          currentActData={currentActData}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          availableNodeIds={availableNodeIds}
          completedNodeIds={completedNodeIds}
          onSelectedNodeScreenPosition={onSelectedNodeScreenPosition}
          onCameraControlsReady={onCameraControlsReady}
          highlightPaths={highlightPaths}
          onHoveredNodeChange={onHoveredNodeChange}
          avatarSeed={avatarSeed}
          currentNodePosition={currentNodePosition}
        />
      </Canvas>
    </div>
  );
};
