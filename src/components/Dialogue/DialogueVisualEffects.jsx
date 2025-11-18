import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * DialogueVisualEffects Component
 *
 * 3D visual effects that react to dialogue choices and story moments
 * Provides atmospheric particles, character silhouettes, and environmental effects
 */

// Particle System for Dialogue Atmosphere
const DialogueParticles = ({ stance = 'neutral' }) => {
  const particlesRef = useRef();
  const particleCount = 200;

  // Color schemes based on dialogue stance
  const colorSchemes = {
    energized: { primary: '#10b981', secondary: '#fbbf24', speed: 0.02 },
    cautious: { primary: '#3b82f6', secondary: '#8b5cf6', speed: 0.01 },
    aggressive: { primary: '#ef4444', secondary: '#f97316', speed: 0.03 },
    tactical: { primary: '#06b6d4', secondary: '#14b8a6', speed: 0.015 },
    neutral: { primary: '#ffffff', secondary: '#9ca3af', speed: 0.01 }
  };

  const scheme = colorSchemes[stance] || colorSchemes.neutral;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 10 + Math.random() * 5;

      temp.push({
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        size: Math.random() * 0.1 + 0.05,
        color: i % 2 === 0 ? scheme.primary : scheme.secondary
      });
    }
    return temp;
  }, [stance]);

  useFrame(() => {
    if (!particlesRef.current) return;

    particles.forEach((particle, i) => {
      // Update position
      particle.position.add(particle.velocity);

      // Orbit motion
      const angle = Date.now() * scheme.speed * 0.001 + i * 0.1;
      const radius = 8 + Math.sin(Date.now() * 0.001 + i) * 2;
      particle.position.x = radius * Math.cos(angle);
      particle.position.z = radius * Math.sin(angle);
      particle.position.y += Math.sin(Date.now() * 0.002 + i) * 0.01;

      // Update mesh
      const mesh = particlesRef.current.children[i];
      if (mesh) {
        mesh.position.copy(particle.position);
      }
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

// Character Silhouette/Avatar
const CharacterSilhouette = ({ character = 'neutral', position = [0, 0, 0] }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;

    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;

    // Subtle rotation
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  // Character color based on who's speaking
  const characterColors = {
    stijn: '#10b981',  // Green - friendly guide
    reed: '#ef4444',   // Red - antagonist
    player: '#3b82f6', // Blue - player
    neutral: '#9ca3af' // Gray - neutral
  };

  const color = characterColors[character.toLowerCase()] || characterColors.neutral;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {/* Simple humanoid silhouette */}
        <capsuleGeometry args={[0.5, 2, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* Glow effect */}
      <pointLight position={[0, 1, 0]} color={color} intensity={2} distance={5} />
    </group>
  );
};

// Floating Choice Indicators
const ChoiceIndicators = ({ choiceType = 'neutral', show = false }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || !show) return;

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  const indicatorShapes = {
    confident: { geometry: 'octahedron', color: '#10b981', scale: 1.2 },
    humble: { geometry: 'sphere', color: '#3b82f6', scale: 1.0 },
    defiant: { geometry: 'tetrahedron', color: '#ef4444', scale: 1.3 },
    diplomatic: { geometry: 'torus', color: '#06b6d4', scale: 1.1 },
    neutral: { geometry: 'sphere', color: '#9ca3af', scale: 1.0 }
  };

  const indicator = indicatorShapes[choiceType] || indicatorShapes.neutral;

  if (!show) return null;

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      {indicator.geometry === 'octahedron' && (
        <mesh scale={indicator.scale}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={indicator.color}
            emissive={indicator.color}
            emissiveIntensity={0.5}
            wireframe
          />
        </mesh>
      )}

      {indicator.geometry === 'sphere' && (
        <mesh scale={indicator.scale}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={indicator.color}
            emissive={indicator.color}
            emissiveIntensity={0.5}
            wireframe
          />
        </mesh>
      )}

      {indicator.geometry === 'tetrahedron' && (
        <mesh scale={indicator.scale}>
          <tetrahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={indicator.color}
            emissive={indicator.color}
            emissiveIntensity={0.5}
            wireframe
          />
        </mesh>
      )}

      {indicator.geometry === 'torus' && (
        <mesh scale={indicator.scale} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.15, 16, 32]} />
          <meshStandardMaterial
            color={indicator.color}
            emissive={indicator.color}
            emissiveIntensity={0.5}
            wireframe
          />
        </mesh>
      )}

      {/* Orbital rings */}
      {[1, 1.5, 2].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.5]}>
          <torusGeometry args={[radius, 0.02, 8, 32]} />
          <meshBasicMaterial color={indicator.color} transparent opacity={0.3 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
};

// Main Scene Component
const DialogueScene = ({ stance, character, showChoiceIndicator, choiceType }) => {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />

      {/* Directional light */}
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      {/* Atmospheric particles */}
      <DialogueParticles stance={stance} />

      {/* Environment */}
      <Environment preset="night" />
    </>
  );
};

// Main exported component
export const DialogueVisualEffects = ({
  stance = 'neutral',
  character = null,
  showChoiceIndicator = false,
  choiceType = 'neutral',
  enabled = true,
  className = ''
}) => {
  // Don't render if disabled
  if (!enabled) return null;

  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 45, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none' }}
      >
        <DialogueScene
          stance={stance}
          character={character}
          showChoiceIndicator={showChoiceIndicator}
          choiceType={choiceType}
        />
      </Canvas>
    </div>
  );
};

export default DialogueVisualEffects;
