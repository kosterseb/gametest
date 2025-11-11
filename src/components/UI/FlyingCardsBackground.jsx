import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = ['#6B8FDB', '#7B6FBC', '#79D9D9', '#F97F89'];

// Helper functions
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Flying Card Component
const FlyingCard = ({ color }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const lifeTimeRef = useRef(0);
  const maxLifeTime = useRef(getRandomFloat(2, 4));

  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(0.21, 0.35, 0.014); // 30% smaller cards
  }, []);

  const initialData = useMemo(() => ({
    position: new THREE.Vector3(
      getRandomFloat(-12, 12),
      getRandomFloat(-8, 8),
      getRandomFloat(-5, 5)
    ),
    velocity: new THREE.Vector3(
      getRandomFloat(-0.02, 0.02),
      getRandomFloat(0.03, 0.08),
      getRandomFloat(-0.01, 0.01)
    ),
    rotation: new THREE.Vector3(
      getRandomFloat(0, Math.PI * 2),
      getRandomFloat(0, Math.PI * 2),
      getRandomFloat(0, Math.PI * 2)
    ),
    rotationSpeed: new THREE.Vector3(
      getRandomFloat(-0.03, 0.03),
      getRandomFloat(-0.04, 0.04),
      getRandomFloat(-0.02, 0.02)
    ),
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    lifeTimeRef.current += delta;

    meshRef.current.position.x += initialData.velocity.x;
    meshRef.current.position.y += initialData.velocity.y;
    meshRef.current.position.z += initialData.velocity.z;

    meshRef.current.rotation.x += initialData.rotationSpeed.x;
    meshRef.current.rotation.y += initialData.rotationSpeed.y;
    meshRef.current.rotation.z += initialData.rotationSpeed.z;

    const wobble = Math.sin(lifeTimeRef.current * 3) * 0.1;
    meshRef.current.rotation.x += wobble * 0.01;
    meshRef.current.rotation.y += wobble * 0.015;

    const lifeProgress = lifeTimeRef.current / maxLifeTime.current;
    let opacity;
    if (lifeProgress < 0.1) {
      opacity = lifeProgress / 0.1;
    } else if (lifeProgress > 0.8) {
      opacity = 1 - ((lifeProgress - 0.8) / 0.2);
    } else {
      opacity = 1;
    }

    materialRef.current.opacity = opacity;

    if (lifeTimeRef.current > maxLifeTime.current) {
      if (meshRef.current.parent) {
        meshRef.current.parent.remove(meshRef.current);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={initialData.position}
      rotation={[initialData.rotation.x, initialData.rotation.y, initialData.rotation.z]}
    >
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        opacity={0}
        transparent
        depthWrite={false}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

// Card Field Manager
const CardField = () => {
  const [cards, setCards] = React.useState([]);

  useFrame(() => {
    if (Math.random() < 0.3) {
      const id = Math.random();
      const color = COLORS[getRandomInt(0, COLORS.length - 1)];
      setCards((prev) => [
        ...prev,
        {
          id,
          color,
        },
      ]);
    }

    setCards((prev) => prev.slice(-50));
  });

  return (
    <group>
      {cards.map((card) => (
        <FlyingCard key={card.id} {...card} />
      ))}
    </group>
  );
};

// Camera Controller
const CameraController = () => {
  const targetPosition = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (event) => {
      targetPosition.current.x = -((event.clientX / window.innerWidth) - 0.5) * 8;
      targetPosition.current.y = ((event.clientY / window.innerHeight) - 0.5) * 4;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(({ camera }) => {
    camera.position.x += (targetPosition.current.x - camera.position.x) * 0.05;
    camera.position.y += (targetPosition.current.y - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Reusable Background Component
export const FlyingCardsBackground = () => {
  return (
    <div className="fixed inset-0 bg-white" style={{ zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <CameraController />
        <CardField />
      </Canvas>
    </div>
  );
};
