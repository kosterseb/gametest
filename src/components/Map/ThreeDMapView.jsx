import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line, Billboard, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Node type to color mapping
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

// 3D Node Component
const Node3D = ({ node, position, isSelected, isAvailable, isCompleted, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animate the node
  useFrame((state) => {
    if (!meshRef.current) return;

    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;

    // Rotate if hovered or selected
    if (hovered || isSelected) {
      meshRef.current.rotation.y += 0.02;
    }

    // Pulse animation for available nodes
    if (isAvailable && !isCompleted) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = NODE_COLORS[node.type] || '#ffffff';
  const opacity = isCompleted ? 0.3 : isAvailable ? 1.0 : 0.5;

  // Different geometry based on node type
  const geometry = useMemo(() => {
    switch (node.type) {
      case 'boss':
        return <octahedronGeometry args={[0.7, 0]} />;
      case 'elite':
        return <dodecahedronGeometry args={[0.5, 0]} />;
      case 'god':
        return <icosahedronGeometry args={[0.5, 0]} />;
      default:
        return <sphereGeometry args={[0.4, 32, 32]} />;
    }
  }, [node.type]);

  return (
    <group position={position}>
      {/* Main node mesh */}
      <mesh
        ref={meshRef}
        onClick={() => onClick && onClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : isAvailable ? 0.3 : 0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <Billboard>
          <Text
            position={[0, 0, 0]}
            fontSize={0.3}
            color="#22c55e"
            anchorX="center"
            anchorY="middle"
          >
            ✓
          </Text>
        </Billboard>
      )}

      {/* God node sparkles */}
      {node.type === 'god' && !isCompleted && (
        <Sparkles
          count={20}
          scale={2}
          size={2}
          speed={0.3}
          color="#fbbf24"
        />
      )}

      {/* Node label */}
      <Billboard position={[0, -1, 0]}>
        <Text
          fontSize={0.2}
          color={isAvailable ? '#ffffff' : '#666666'}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.type.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
};

// Animated Connection Line Component
const ConnectionLine = ({ start, end, active = false }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      // Animate the line material
      lineRef.current.material.opacity = active
        ? 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        : 0.3;
    }
  });

  const points = useMemo(() => {
    // Create a curved line between nodes
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2 - 0.5, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end)
    );
    return curve.getPoints(20);
  }, [start, end]);

  return (
    <Line
      ref={lineRef}
      points={points}
      color={active ? '#ffffff' : '#666666'}
      lineWidth={active ? 2 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
};

// Floor Label Component
const FloorLabel = ({ position, floorNumber, color }) => {
  return (
    <Billboard position={position}>
      <Text
        fontSize={0.4}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
        fontWeight="bold"
      >
        FLOOR {floorNumber}
      </Text>
    </Billboard>
  );
};

// Main 3D Scene
const MapScene = ({ selectedBiomeData, currentActData, selectedNode, onNodeSelect, availableNodeIds, completedNodeIds }) => {
  // Calculate node positions in 3D space
  const nodePositions = useMemo(() => {
    const positions = new Map();
    const floors = selectedBiomeData.floors;
    const verticalSpacing = 3;
    const horizontalSpacing = 2.5;

    floors.forEach((floor, floorIdx) => {
      const numNodes = floor.nodes.length;
      const startX = -(numNodes - 1) * horizontalSpacing / 2;

      floor.nodes.forEach((node, nodeIdx) => {
        const x = startX + nodeIdx * horizontalSpacing;
        const y = -floorIdx * verticalSpacing;
        const z = 0;
        positions.set(node.id, [x, y, z]);
      });
    });

    // Add boss position
    if (currentActData.bossFloor) {
      positions.set(currentActData.bossFloor.node.id, [0, -(floors.length) * verticalSpacing, 0]);
    }

    return positions;
  }, [selectedBiomeData, currentActData]);

  // Create connection lines
  const connections = useMemo(() => {
    const lines = [];
    selectedBiomeData.floors.forEach((floor) => {
      floor.nodes.forEach((node) => {
        if (node.childrenIds && node.childrenIds.length > 0) {
          node.childrenIds.forEach((childId) => {
            const startPos = nodePositions.get(node.id);
            const endPos = nodePositions.get(childId);
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
        const startPos = nodePositions.get(node.id);
        const endPos = nodePositions.get(currentActData.bossFloor.node.id);
        if (startPos && endPos) {
          lines.push({ start: startPos, end: endPos, active: false });
        }
      });
    }

    return lines;
  }, [selectedBiomeData, currentActData, nodePositions, availableNodeIds, completedNodeIds]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={30}
        minDistance={5}
        target={[0, -5, 0]}
      />

      {/* Connection Lines */}
      {connections.map((conn, idx) => (
        <ConnectionLine
          key={idx}
          start={conn.start}
          end={conn.end}
          active={conn.active}
        />
      ))}

      {/* Nodes */}
      {selectedBiomeData.floors.map((floor) =>
        floor.nodes.map((node) => {
          const position = nodePositions.get(node.id);
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

      {/* Boss Node */}
      {currentActData.bossFloor && (
        <Node3D
          node={currentActData.bossFloor.node}
          position={nodePositions.get(currentActData.bossFloor.node.id)}
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
          color={selectedBiomeData.color === 'yellow' ? '#eab308' : '#ffffff'}
        />
      ))}

      {/* Boss Floor Label */}
      {currentActData.bossFloor && (
        <FloorLabel
          position={[-8, -(selectedBiomeData.floors.length) * 3, 0]}
          floorNumber={currentActData.bossFloor.floor}
          color="#dc2626"
        />
      )}

      {/* Background particles */}
      <Sparkles
        count={100}
        scale={[30, 30, 30]}
        size={1}
        speed={0.1}
        opacity={0.2}
        color="#ffffff"
      />
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
  completedNodeIds
}) => {
  return (
    <div className="w-full h-screen">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={['#1a1a2e']} />
        <fog attach="fog" args={['#1a1a2e', 10, 50]} />

        <MapScene
          selectedBiomeData={selectedBiomeData}
          currentActData={currentActData}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          availableNodeIds={availableNodeIds}
          completedNodeIds={completedNodeIds}
        />
      </Canvas>
    </div>
  );
};
