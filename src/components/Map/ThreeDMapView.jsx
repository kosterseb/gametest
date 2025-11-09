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

// Confetti Burst Effect - Triggered on node completion
const ConfettiBurst = ({ color }) => {
  const confettiRef = useRef();
  const confettiPieces = useMemo(() => {
    const pieces = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pieces.push({
        id: i,
        angle,
        speed: 2 + Math.random() * 2,
        rotationSpeed: 2 + Math.random() * 3,
        shape: ['box', 'pyramid', 'octahedron'][Math.floor(Math.random() * 3)]
      });
    }
    return pieces;
  }, []);

  useFrame((state) => {
    if (!confettiRef.current) return;

    confettiPieces.forEach((piece, i) => {
      const child = confettiRef.current.children[i];
      if (!child) return;

      const t = state.clock.elapsedTime;
      const radius = piece.speed * t * 0.5;
      const x = Math.cos(piece.angle) * radius;
      const z = Math.sin(piece.angle) * radius;
      const y = 1.5 + t * 0.5 - (t * t) * 0.3; // Gravity

      child.position.set(x, y, z);
      child.rotation.x = t * piece.rotationSpeed;
      child.rotation.y = t * piece.rotationSpeed * 0.7;

      // Fade out
      if (child.material) {
        child.material.opacity = Math.max(0, 1 - t * 0.5);
      }
    });
  });

  const getGeometry = (shape) => {
    switch (shape) {
      case 'box': return <boxGeometry args={[0.15, 0.15, 0.15]} />;
      case 'pyramid': return <coneGeometry args={[0.1, 0.2, 4]} />;
      case 'octahedron': return <octahedronGeometry args={[0.1]} />;
      default: return <boxGeometry args={[0.15, 0.15, 0.15]} />;
    }
  };

  return (
    <group ref={confettiRef}>
      {confettiPieces.map((piece) => (
        <mesh key={piece.id}>
          {getGeometry(piece.shape)}
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
};

// Star Sparkles - For special nodes (god/joker)
const StarSparkles = ({ color }) => {
  const sparklesRef = useRef();

  const sparkles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 6; i++) {
      temp.push({
        angle: (i / 6) * Math.PI * 2,
        offset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!sparklesRef.current) return;

    sparkles.forEach((sparkle, i) => {
      const child = sparklesRef.current.children[i];
      if (!child) return;

      const t = state.clock.elapsedTime * sparkle.speed + sparkle.offset;
      const radius = 0.8 + Math.sin(t * 2) * 0.2;
      const x = Math.cos(sparkle.angle + t * 0.5) * radius;
      const z = Math.sin(sparkle.angle + t * 0.5) * radius;
      const y = Math.sin(t * 3) * 0.3;

      child.position.set(x, y, z);
      child.rotation.z = t * 2;

      // Pulsing opacity
      if (child.material) {
        child.material.opacity = 0.7 + Math.sin(t * 4) * 0.3;
      }
    });
  });

  return (
    <group ref={sparklesRef}>
      {sparkles.map((_, i) => (
        <mesh key={i}>
          {/* Hard-edged 4-pointed star using diamond/octahedron */}
          <octahedronGeometry args={[0.12]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
};

// Selection Ring - Thick, rotating, dramatic indicator
const SelectionRing = ({ position, color }) => {
  const outerRingRef = useRef();
  const innerRingRef = useRef();

  useFrame((state) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer thick black ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[1.0, 1.3, 6]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>

      {/* Inner colored ring - slightly offset for depth */}
      <mesh ref={innerRingRef} position={[0, 0, 0.05]}>
        <ringGeometry args={[0.85, 1.05, 8]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* Corner accent triangles on the ring */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 1.15;
        const y = Math.sin(angle) * 1.15;
        return (
          <mesh key={i} position={[x, y, 0.1]} rotation={[0, 0, angle]}>
            <coneGeometry args={[0.12, 0.2, 3]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        );
      })}
    </group>
  );
};

// 3D Node Component - Neo-Brutal Style
const Node3D = ({ node, position, isSelected, isAvailable, isCompleted, isRecentlyCompleted, onClick, highlightMode, onHoverChange }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const geometryRef = useRef();

  // Notify parent of hover changes
  React.useEffect(() => {
    if (onHoverChange) {
      onHoverChange(hovered ? { node, position } : null);
    }
  }, [hovered, node, position, onHoverChange]);

  // Pulse, bounce, and DRAMATIC hover animations
  useFrame((state) => {
    if (!meshRef.current) return;

    // Enhanced bounce for available nodes when highlight mode is active
    const bounceMultiplier = (highlightMode && isAvailable && !isCompleted) ? 2.5 : 1;
    const bounceSpeed = (highlightMode && isAvailable && !isCompleted) ? 3 : 2;

    // DRAMATIC rotation on hover
    if (hovered && isAvailable && !isCompleted) {
      const rotationSpeed = 1.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * rotationSpeed) * 0.2;
    } else {
      // Gentle idle rotation for available nodes
      if (isAvailable && !isCompleted) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      } else {
        meshRef.current.rotation.y = 0;
        meshRef.current.rotation.x = 0;
      }
    }

    // Bounce animation for available nodes
    if (isAvailable && !isCompleted) {
      const bounce = Math.sin(state.clock.elapsedTime * bounceSpeed) * 0.05 * bounceMultiplier;
      meshRef.current.position.y = bounce;

      // Pulse scale effect - BIGGER on hover
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      meshRef.current.scale.setScalar(isSelected ? pulseScale * 1.2 : (hovered ? pulseScale * 1.15 : pulseScale));
    } else {
      meshRef.current.position.y = 0;
      meshRef.current.scale.setScalar(isSelected ? 1.2 : (hovered ? 1.1 : 1));
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

  // Node type icons (emoji representations)
  const nodeIcon = useMemo(() => {
    switch (node.type) {
      case 'enemy': return '⚔️';
      case 'elite': return '🛡️';
      case 'boss': return '👑';
      case 'shop': return '🏪';
      case 'joker': return '🃏';
      case 'event': return '📜';
      case 'mystery': return '❓';
      case 'god': return '✨';
      case 'rest': return '💤';
      default: return '◆';
    }
  }, [node.type]);

  return (
    <group position={position}>
      {/* Hard drop shadow - offset black mesh behind main node */}
      <mesh
        geometry={geometry}
        position={[0.15, -0.15, -0.05]}
        scale={isSelected ? scale * 1.2 : (hovered ? scale * 1.05 : scale)}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.4}
        />
      </mesh>

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

      {/* Thick black outline - wireframe approach for visibility */}
      <mesh
        geometry={geometry}
        scale={isSelected ? scale * 1.22 : (hovered ? scale * 1.07 : scale * 1.02)}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#000000"
          wireframe
          transparent={!isAvailable && !isCompleted}
          opacity={!isAvailable && !isCompleted ? 0.3 : 1.0}
        />
      </mesh>

      {/* Corner geometric details - small triangular corners */}
      {['boss', 'elite', 'god'].includes(node.type) && (
        <>
          {/* Top-left corner */}
          <mesh position={[-0.5 * scale, 0.5 * scale, 0.5]} raycast={() => null}>
            <coneGeometry args={[0.1, 0.15, 3]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Top-right corner */}
          <mesh position={[0.5 * scale, 0.5 * scale, 0.5]} rotation={[0, 0, Math.PI / 2]} raycast={() => null}>
            <coneGeometry args={[0.1, 0.15, 3]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Bottom-left corner */}
          <mesh position={[-0.5 * scale, -0.5 * scale, 0.5]} rotation={[0, 0, -Math.PI / 2]} raycast={() => null}>
            <coneGeometry args={[0.1, 0.15, 3]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Bottom-right corner */}
          <mesh position={[0.5 * scale, -0.5 * scale, 0.5]} rotation={[0, 0, Math.PI]} raycast={() => null}>
            <coneGeometry args={[0.1, 0.15, 3]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </>
      )}

      {/* Node type icon - pops out when selected */}
      <Billboard>
        <Text
          position={[0, 0, isSelected ? 0.9 : (hovered ? 0.65 : 0.5)]}
          fontSize={isSelected ? 0.55 : (hovered ? 0.5 : 0.45)}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          {nodeIcon}
        </Text>
      </Billboard>

      {/* REDESIGNED selection ring - thick, rotating, dramatic */}
      {isSelected && <SelectionRing position={[0, -0.8, 0]} color={color} />}

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

      {/* DRAMATIC hover glow - bright color burst on hover */}
      {hovered && isAvailable && !isCompleted && (
        <pointLight
          position={[0, 0, 0]}
          color={color}
          intensity={2.5}
          distance={4}
        />
      )}

      {/* Star sparkles for special nodes (god/joker) */}
      {(node.type === 'god' || node.type === 'joker') && !isCompleted && (
        <StarSparkles color={color} />
      )}

      {/* Confetti burst on recently completed nodes only */}
      {isRecentlyCompleted && (
        <ConfettiBurst color={color} />
      )}
    </group>
  );
};

// Player Avatar Indicator - Shows where the player is
const PlayerAvatar = ({ position, avatarSeed }) => {
  const avatarRef = useRef();

  // Bobbing animation - relative to the avatar's base position
  useFrame((state) => {
    if (!avatarRef.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    avatarRef.current.position.y = 1.5 + bob; // Offset relative to parent group
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      <group ref={avatarRef}>
      <Billboard>
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="relative" style={{ width: '60px', height: '60px' }}>
            {/* Avatar with neo-brutal styling */}
            <div className="nb-bg-white nb-border-lg nb-shadow-xl p-1">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}`}
                alt="Player"
                className="w-12 h-12 nb-border"
                style={{ display: 'block' }}
              />
            </div>
            {/* Pointer arrow */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black absolute -top-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </Html>
      </Billboard>

      {/* Subtle glow underneath */}
      <pointLight
        position={[0, -0.5, 0]}
        color="#fbbf24"
        intensity={1.2}
        distance={2.5}
      />
      </group>
    </group>
  );
};

// Particle Trail Component for Completed Paths - Neo-brutal geometric shapes
const ParticleTrail = ({ start, end }) => {
  const particlesRef = useRef();
  const particleCount = 8;

  const particles = useMemo(() => {
    const temp = [];
    const shapeTypes = ['box', 'pyramid', 'octahedron', 'star'];
    for (let i = 0; i < particleCount; i++) {
      temp.push({
        offset: i / particleCount,
        speed: 0.5 + Math.random() * 0.5,
        shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        rotationSpeed: 1 + Math.random() * 2
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
        const child = particlesRef.current.children[i];
        child.position.copy(position);
        // Rotate particles for more dynamic feel
        child.rotation.x = state.clock.elapsedTime * particle.rotationSpeed;
        child.rotation.y = state.clock.elapsedTime * particle.rotationSpeed * 0.7;
      }
    });
  });

  // Get geometry for particle shape
  const getParticleGeometry = (shape) => {
    switch (shape) {
      case 'box':
        return <boxGeometry args={[0.12, 0.12, 0.12]} />;
      case 'pyramid':
        return <coneGeometry args={[0.08, 0.15, 4]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.08]} />;
      case 'star':
        return <octahedronGeometry args={[0.1]} />;
      default:
        return <boxGeometry args={[0.1, 0.1, 0.1]} />;
    }
  };

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i}>
          {getParticleGeometry(particle.shape)}
          <meshBasicMaterial
            color={particle.shape === 'star' ? '#fbbf24' : '#fde047'}
            transparent
            opacity={0.9}
          />
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

// Background Pattern - Neo-brutal geometric patterns in 3D
const BackgroundPattern = ({ patternType, biomeColor }) => {
  // Create pattern elements based on type
  const patternElements = useMemo(() => {
    const elements = [];
    const spacing = 2;
    const range = 10;

    for (let x = -range; x <= range; x += spacing) {
      for (let y = -range; y <= range; y += spacing) {
        elements.push({ x, y, id: `${x}-${y}` });
      }
    }
    return elements;
  }, []);

  const renderPattern = (x, y, id) => {
    const position = [x, y, -15]; // Far behind the scene

    switch (patternType) {
      case 'stripes':
        // Diagonal lines
        if ((x + y) % 4 === 0) {
          return (
            <Line
              key={id}
              points={[[x - 0.5, y - 0.5, -15], [x + 0.5, y + 0.5, -15]]}
              color="#000000"
              lineWidth={2}
              transparent
              opacity={0.15}
            />
          );
        }
        return null;

      case 'dots':
        return (
          <mesh key={id} position={position}>
            <circleGeometry args={[0.15, 16]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.15} />
          </mesh>
        );

      case 'triangles':
        if ((x + y) % 4 === 0) {
          return (
            <mesh key={id} position={position} rotation={[0, 0, Math.random() * Math.PI]}>
              <coneGeometry args={[0.3, 0.5, 3]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.15} />
            </mesh>
          );
        }
        return null;

      case 'grid':
        if (x % 4 === 0 || y % 4 === 0) {
          return (
            <mesh key={id} position={position}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.15} />
            </mesh>
          );
        }
        return null;

      case 'zigzag':
        if (y % 2 === 0 && x % 2 === 0) {
          const offset = (y / 2) % 2 === 0 ? 0.5 : -0.5;
          return (
            <Line
              key={id}
              points={[[x + offset, y, -15], [x + offset + 0.5, y + 0.5, -15]]}
              color="#000000"
              lineWidth={2}
              transparent
              opacity={0.15}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <group>
      {patternElements.map(({ x, y, id }) => renderPattern(x, y, id))}
    </group>
  );
};

// Floating Geometric Shapes - Background decoration
const FloatingShapes = ({ biomeColor }) => {
  const shapesData = useMemo(() => {
    const shapes = [];
    const count = 15;

    for (let i = 0; i < count; i++) {
      const type = ['box', 'pyramid', 'octahedron'][Math.floor(Math.random() * 3)];
      shapes.push({
        type,
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 8 - 10 // Behind the main scene
        ],
        scale: 0.3 + Math.random() * 0.5,
        rotationSpeed: 0.2 + Math.random() * 0.3,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2
      });
    }
    return shapes;
  }, []);

  return (
    <>
      {shapesData.map((shape, idx) => (
        <FloatingShape key={idx} {...shape} biomeColor={biomeColor} />
      ))}
    </>
  );
};

const FloatingShape = ({ type, position, scale, rotationSpeed, floatSpeed, floatOffset, biomeColor }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;

    // Rotation
    meshRef.current.rotation.x = state.clock.elapsedTime * rotationSpeed;
    meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed * 0.7;

    // Floating
    const float = Math.sin(state.clock.elapsedTime * floatSpeed + floatOffset) * 0.5;
    meshRef.current.position.y = position[1] + float;
  });

  const geometry = useMemo(() => {
    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'pyramid':
        return new THREE.ConeGeometry(0.5, 1, 4);
      case 'octahedron':
        return new THREE.OctahedronGeometry(0.6);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [type]);

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Hard shadow behind shape */}
      <mesh
        geometry={geometry}
        position={[0.1, -0.1, -0.05]}
        scale={scale}
        raycast={() => null}
      >
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      {/* Main shape */}
      <mesh ref={meshRef} geometry={geometry} scale={scale} raycast={() => null}>
        <meshBasicMaterial color={biomeColor} transparent opacity={0.15} />
      </mesh>

      {/* Black edges */}
      <lineSegments scale={scale} raycast={() => null}>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#000000" transparent opacity={0.3} linewidth={2} />
      </lineSegments>
    </group>
  );
};

// Floor Label Component - Neo-Brutal with PERSONALITY
const FloorLabel = ({ position, floorNumber }) => {
  const labelRef = useRef();

  // Gentle floating animation
  useFrame((state) => {
    if (!labelRef.current) return;
    const float = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    labelRef.current.position.y = float;
  });

  return (
    <group position={position} ref={labelRef}>
      <Billboard>
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="relative" style={{ width: '200px' }}>
            {/* Main label box */}
            <div className="nb-bg-white nb-border-xl nb-shadow-xl px-6 py-3 relative">
              {/* Decorative corner triangles */}
              <div className="absolute -top-2 -left-2 w-0 h-0" style={{
                borderLeft: '16px solid black',
                borderTop: '16px solid black',
                borderRight: '16px solid transparent',
                borderBottom: '16px solid transparent'
              }}></div>
              <div className="absolute -top-2 -right-2 w-0 h-0" style={{
                borderRight: '16px solid black',
                borderTop: '16px solid black',
                borderLeft: '16px solid transparent',
                borderBottom: '16px solid transparent'
              }}></div>

              {/* Floor text */}
              <div className="text-center">
                <div className="text-xs font-black text-purple-600 uppercase tracking-wider mb-1">
                  Floor
                </div>
                <div className="text-4xl font-black text-black leading-none" style={{
                  textShadow: '3px 3px 0 rgba(0,0,0,0.1)'
                }}>
                  {floorNumber}
                </div>
              </div>

              {/* Decorative bottom stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
            </div>

            {/* Offset shadow for depth */}
            <div className="absolute top-2 left-2 w-full h-full bg-black -z-10 nb-border-xl"></div>
          </div>
        </Html>
      </Billboard>
    </group>
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
              // Connection is active only if child is available or if both nodes are completed
              const isActive = availableNodeIds.includes(childId) || (completedNodeIds.includes(node.id) && completedNodeIds.includes(childId));
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

      {/* Floating geometric shapes in background */}
      <FloatingShapes biomeColor={
        selectedBiomeData.color === 'red' ? '#ef4444' :
        selectedBiomeData.color === 'orange' ? '#f97316' :
        selectedBiomeData.color === 'yellow' ? '#eab308' :
        selectedBiomeData.color === 'green' ? '#22c55e' :
        selectedBiomeData.color === 'cyan' ? '#06b6d4' :
        selectedBiomeData.color === 'blue' ? '#3b82f6' :
        selectedBiomeData.color === 'purple' ? '#8b5cf6' :
        selectedBiomeData.color === 'pink' ? '#ec4899' :
        '#a78bfa'
      } />

      {/* Background geometric patterns in 3D */}
      <BackgroundPattern
        patternType={
          selectedBiomeData.color === 'red' ? 'stripes' :
          selectedBiomeData.color === 'orange' ? 'triangles' :
          selectedBiomeData.color === 'yellow' ? 'dots' :
          selectedBiomeData.color === 'green' ? 'zigzag' :
          selectedBiomeData.color === 'cyan' ? 'grid' :
          selectedBiomeData.color === 'blue' ? 'zigzag' :
          selectedBiomeData.color === 'purple' ? 'dots' :
          selectedBiomeData.color === 'pink' ? 'stripes' :
          'grid'
        }
        biomeColor={selectedBiomeData.color}
      />

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
              isRecentlyCompleted={completedNodeIds.length > 0 && completedNodeIds[completedNodeIds.length - 1] === node.id}
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
          isRecentlyCompleted={completedNodeIds.length > 0 && completedNodeIds[completedNodeIds.length - 1] === currentActData.bossFloor.node.id}
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
    <div ref={containerRef} className="w-full h-full relative">
      {/* Hard-stop Gradient Bands - Neo-brutal background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.25 }}
      >
        <defs>
          <linearGradient id="hardStopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            {/* Hard stops - no smooth transitions */}
            <stop offset="0%" stopColor={
              selectedBiomeData.color === 'red' ? '#fca5a5' :
              selectedBiomeData.color === 'orange' ? '#fdba74' :
              selectedBiomeData.color === 'yellow' ? '#fde047' :
              selectedBiomeData.color === 'green' ? '#86efac' :
              selectedBiomeData.color === 'cyan' ? '#67e8f9' :
              selectedBiomeData.color === 'blue' ? '#93c5fd' :
              selectedBiomeData.color === 'purple' ? '#c4b5fd' :
              selectedBiomeData.color === 'pink' ? '#f9a8d4' :
              '#a78bfa'
            } />
            <stop offset="20%" stopColor={
              selectedBiomeData.color === 'red' ? '#fca5a5' :
              selectedBiomeData.color === 'orange' ? '#fdba74' :
              selectedBiomeData.color === 'yellow' ? '#fde047' :
              selectedBiomeData.color === 'green' ? '#86efac' :
              selectedBiomeData.color === 'cyan' ? '#67e8f9' :
              selectedBiomeData.color === 'blue' ? '#93c5fd' :
              selectedBiomeData.color === 'purple' ? '#c4b5fd' :
              selectedBiomeData.color === 'pink' ? '#f9a8d4' :
              '#a78bfa'
            } />
            <stop offset="20%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={
              selectedBiomeData.color === 'red' ? '#dc2626' :
              selectedBiomeData.color === 'orange' ? '#ea580c' :
              selectedBiomeData.color === 'yellow' ? '#ca8a04' :
              selectedBiomeData.color === 'green' ? '#16a34a' :
              selectedBiomeData.color === 'cyan' ? '#0891b2' :
              selectedBiomeData.color === 'blue' ? '#2563eb' :
              selectedBiomeData.color === 'purple' ? '#7c3aed' :
              selectedBiomeData.color === 'pink' ? '#db2777' :
              '#8b5cf6'
            } />
            <stop offset="60%" stopColor={
              selectedBiomeData.color === 'red' ? '#dc2626' :
              selectedBiomeData.color === 'orange' ? '#ea580c' :
              selectedBiomeData.color === 'yellow' ? '#ca8a04' :
              selectedBiomeData.color === 'green' ? '#16a34a' :
              selectedBiomeData.color === 'cyan' ? '#0891b2' :
              selectedBiomeData.color === 'blue' ? '#2563eb' :
              selectedBiomeData.color === 'purple' ? '#7c3aed' :
              selectedBiomeData.color === 'pink' ? '#db2777' :
              '#8b5cf6'
            } />
            <stop offset="60%" stopColor="#fef3c7" />
            <stop offset="80%" stopColor="#fef3c7" />
            <stop offset="80%" stopColor={
              selectedBiomeData.color === 'red' ? '#fca5a5' :
              selectedBiomeData.color === 'orange' ? '#fdba74' :
              selectedBiomeData.color === 'yellow' ? '#fde047' :
              selectedBiomeData.color === 'green' ? '#86efac' :
              selectedBiomeData.color === 'cyan' ? '#67e8f9' :
              selectedBiomeData.color === 'blue' ? '#93c5fd' :
              selectedBiomeData.color === 'purple' ? '#c4b5fd' :
              selectedBiomeData.color === 'pink' ? '#f9a8d4' :
              '#a78bfa'
            } />
            <stop offset="100%" stopColor={
              selectedBiomeData.color === 'red' ? '#fca5a5' :
              selectedBiomeData.color === 'orange' ? '#fdba74' :
              selectedBiomeData.color === 'yellow' ? '#fde047' :
              selectedBiomeData.color === 'green' ? '#86efac' :
              selectedBiomeData.color === 'cyan' ? '#67e8f9' :
              selectedBiomeData.color === 'blue' ? '#93c5fd' :
              selectedBiomeData.color === 'purple' ? '#c4b5fd' :
              selectedBiomeData.color === 'pink' ? '#f9a8d4' :
              '#a78bfa'
            } />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hardStopGradient)" />
      </svg>

      {/* Geometric Pattern Overlay - Biome specific */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.15 }}
      >
        <defs>
          {/* Diagonal Stripes Pattern */}
          <pattern id="stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="20" height="40" fill="#000000" />
          </pattern>

          {/* Grid Pattern */}
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#000000" strokeWidth="3" />
          </pattern>

          {/* Dots Pattern */}
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="8" fill="#000000" />
          </pattern>

          {/* Zigzag Pattern */}
          <pattern id="zigzag" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 L 10 0 L 20 10 L 30 0 L 40 10 L 40 20 L 30 10 L 20 20 L 10 10 L 0 20 Z" fill="#000000" />
          </pattern>

          {/* Triangles Pattern */}
          <pattern id="triangles" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="20,0 40,40 0,40" fill="#000000" />
          </pattern>

          {/* Waves Pattern */}
          <pattern id="waves" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M 0 15 Q 15 0, 30 15 T 60 15" fill="none" stroke="#000000" strokeWidth="4" />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill={`url(#${
            selectedBiomeData.color === 'red' ? 'stripes' :
            selectedBiomeData.color === 'orange' ? 'triangles' :
            selectedBiomeData.color === 'yellow' ? 'dots' :
            selectedBiomeData.color === 'green' ? 'waves' :
            selectedBiomeData.color === 'cyan' ? 'grid' :
            selectedBiomeData.color === 'blue' ? 'zigzag' :
            selectedBiomeData.color === 'purple' ? 'dots' :
            selectedBiomeData.color === 'pink' ? 'waves' :
            'grid'
          })`}
        />
      </svg>

      <Canvas
        gl={{ antialias: true }}
        dpr={[1, 2]}
        className="relative z-10"
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
