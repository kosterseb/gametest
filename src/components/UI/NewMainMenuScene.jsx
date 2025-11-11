import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRouter } from '../../hooks/useRouter';
import { NBButton } from './NeoBrutalUI';

// Import letter logos
import logoR from '../../assets/Logos/logo-R.png';
import logoE from '../../assets/Logos/logo-E.png';
import logoT from '../../assets/Logos/logo-T.png';
import logoN from '../../assets/Logos/logo-N.png';
import logoA from '../../assets/Logos/logo-A.png';

const COLORS = ['#4062BB', '#52489C', '#59C3C3', '#F45B69'];

// Helper functions
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Card Component - Creates small flying card-like shapes
const FlyingCard = ({ color, speed = 0.05 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const lifeTimeRef = useRef(0);
  const maxLifeTime = useRef(getRandomFloat(2, 4)); // seconds

  // Card-like rectangle geometry (like a playing card)
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(0.3, 0.5); // Card proportions (width, height)
  }, []);

  // Random initial position and velocity
  const initialData = useMemo(() => ({
    position: new THREE.Vector3(
      getRandomFloat(-12, 12),
      getRandomFloat(-8, 8),
      getRandomFloat(-5, 5)
    ),
    velocity: new THREE.Vector3(
      getRandomFloat(-0.02, 0.02),
      getRandomFloat(0.03, 0.08), // Upward bias
      getRandomFloat(-0.01, 0.01)
    ),
    rotation: getRandomFloat(0, Math.PI * 2),
    rotationSpeed: getRandomFloat(-0.05, 0.05),
  }), []);

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    lifeTimeRef.current += delta;

    // Move the card
    meshRef.current.position.x += initialData.velocity.x;
    meshRef.current.position.y += initialData.velocity.y;
    meshRef.current.position.z += initialData.velocity.z;

    // Rotate the card
    meshRef.current.rotation.z += initialData.rotationSpeed;

    // Fade in quickly, then fade out at the end
    const lifeProgress = lifeTimeRef.current / maxLifeTime.current;
    let opacity;
    if (lifeProgress < 0.1) {
      opacity = lifeProgress / 0.1; // Fade in
    } else if (lifeProgress > 0.8) {
      opacity = 1 - ((lifeProgress - 0.8) / 0.2); // Fade out
    } else {
      opacity = 1;
    }

    materialRef.current.opacity = opacity;

    // Remove when life is over
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
      rotation={[0, 0, initialData.rotation]}
    >
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        opacity={0}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// CardField Component - Manages multiple flying cards
const CardField = () => {
  const [cards, setCards] = React.useState([]);

  useFrame(() => {
    // Add new cards frequently for that "flying cards" effect
    if (Math.random() < 0.3) { // 30% chance each frame
      const id = Math.random();
      const color = COLORS[getRandomInt(0, COLORS.length - 1)];
      setCards((prev) => [
        ...prev,
        {
          id,
          color,
          speed: getRandomFloat(0.03, 0.08),
        },
      ]);
    }

    // Limit total number of cards to prevent memory issues
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

// Camera Mouse Control Component
const CameraController = () => {
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
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

// Letter Logo Component with bounce animation
const LetterLogo = ({ src, delay, onComplete }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [scale, setScale] = React.useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);

      // Bounce animation
      let startTime = Date.now();
      const duration = 600;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Elastic bounce easing
        const easeOutBounce = (t) => {
          if (t < 1 / 2.75) {
            return 7.5625 * t * t;
          } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
          } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
          } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
          }
        };

        setScale(easeOutBounce(progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (onComplete) onComplete();
        }
      };

      animate();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onComplete]);

  if (!isVisible) return null;

  return (
    <img
      src={src}
      alt="Letter"
      className="w-20 h-20 md:w-32 md:h-32 object-contain"
      style={{
        transform: `scale(${scale})`,
        filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.3))',
      }}
    />
  );
};

// Main Component
export const NewMainMenuScene = () => {
  const { navigate } = useRouter();
  const [showButton, setShowButton] = React.useState(false);

  const letters = [
    { src: logoR, delay: 500 },
    { src: logoE, delay: 800 },
    { src: logoT, delay: 1100 },
    { src: logoE, delay: 1400 },
    { src: logoN, delay: 1700 },
    { src: logoT, delay: 2000 },
    { src: logoA, delay: 2300 },
  ];

  const handleLetterComplete = () => {
    // Show button after a short delay when last letter completes
    setTimeout(() => setShowButton(true), 500);
  };

  const handleStart = () => {
    navigate('/save-select');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Three.js Canvas - Flying Cards Background */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <CameraController />
        <CardField />
      </Canvas>

      {/* Foreground Content - Letters and Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* RETENTA Logo Letters */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
          {letters.map((letter, index) => (
            <LetterLogo
              key={index}
              src={letter.src}
              delay={letter.delay}
              onComplete={index === letters.length - 1 ? handleLetterComplete : undefined}
            />
          ))}
        </div>

        {/* Start Button */}
        {showButton && (
          <div
            className="pointer-events-auto animate-bounceIn"
            style={{ animationDelay: '0.2s' }}
          >
            <NBButton
              onClick={handleStart}
              variant="yellow"
              size="xl"
              className="text-2xl font-black"
            >
              START
            </NBButton>
          </div>
        )}
      </div>

      {/* Subtitle (optional) */}
      {showButton && (
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
          <p className="text-lg md:text-xl font-bold text-black nb-text" style={{
            textShadow: '2px 2px 0px rgba(255,255,255,0.8)'
          }}>
            A Roguelike Card Adventure
          </p>
        </div>
      )}
    </div>
  );
};
