import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Line, Billboard, Text } from '@react-three/drei';
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
const Node3D = ({ node, position, isSelected, isAvailable, isCompleted, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const geometryRef = useRef();

  // Subtle animations only
  useFrame((state) => {
    if (!meshRef.current) return;

    // Very subtle bounce for available nodes only (local offset only, group already positioned)
    if (isAvailable && !isCompleted) {
      const bounce = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.position.y = bounce;
    } else {
      meshRef.current.position.y = 0;
    }
  });

  const color = NODE_COLORS[node.type] || '#ffffff';
  const opacity = isCompleted ? 0.4 : 1.0;

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
        scale={isSelected ? scale * 1.2 : scale}
        onClick={() => onClick && onClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial
          color={color}
          transparent={isCompleted}
          opacity={opacity}
        />
      </mesh>

      {/* Thick black outline edges */}
      <lineSegments
        scale={isSelected ? scale * 1.2 : scale}
      >
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#000000" linewidth={4} />
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
    </group>
  );
};

// Neo-Brutal Connection Line Component
const ConnectionLine = ({ start, end, active = false }) => {
  // Straight thick lines for neo-brutal aesthetic
  const points = useMemo(() => {
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ];
  }, [start, end]);

  return (
    <Line
      points={points}
      color="#000000"
      lineWidth={active ? 6 : 3}
      transparent={false}
    />
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
const DragPanCamera = () => {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

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

        // Convert screen space to world space movement
        setCameraOffset({
          x: cameraOffset.x - deltaX * 0.01,
          y: cameraOffset.y + deltaY * 0.01
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
  useFrame(() => {
    // Parallax effect (subtle) when not dragging
    const parallaxX = isDragging ? 0 : mouse.x * 0.5;
    const parallaxY = isDragging ? 0 : mouse.y * 0.3;

    camera.position.x = cameraOffset.x + parallaxX;
    camera.position.y = 2 + cameraOffset.y + parallaxY;
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
const MapScene = ({ selectedBiomeData, currentActData, selectedNode, onNodeSelect, availableNodeIds, completedNodeIds, onSelectedNodeScreenPosition }) => {
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
              lines.push({ start: startPos, end: endPos, active: isActive });
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
          lines.push({ start: startPos, end: endPos, active: false });
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
      <DragPanCamera />

      {/* Connection Lines */}
      {connections.map((conn, idx) => (
        <ConnectionLine
          key={idx}
          start={conn.start}
          end={conn.end}
          active={conn.active}
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
  onSelectedNodeScreenPosition
}) => {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        {/* Bright neo-brutal background */}
        <color attach="background" args={['#a78bfa']} />

        <MapScene
          selectedBiomeData={selectedBiomeData}
          currentActData={currentActData}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          availableNodeIds={availableNodeIds}
          completedNodeIds={completedNodeIds}
          onSelectedNodeScreenPosition={onSelectedNodeScreenPosition}
        />
      </Canvas>
    </div>
  );
};
