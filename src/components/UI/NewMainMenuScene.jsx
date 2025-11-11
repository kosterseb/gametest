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

// WindLine Component - Creates animated flowing lines using tubes for visibility
const WindLine = ({ color, speed = 0.003, nbrOfPoints = 5, length = 6 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const dashOffsetRef = useRef(0);
  const opacityRef = useRef(0);

  // Create the curved tube geometry (visible unlike lines)
  const geometry = useMemo(() => {
    const points = [];
    const segmentLength = length / nbrOfPoints;

    points.push(new THREE.Vector3(0, 0, 0));
    for (let i = 0; i < nbrOfPoints; i++) {
      const pos = segmentLength * i;
      points.push(
        new THREE.Vector3(
          pos - getRandomFloat(-2.1, 2.1),
          pos + segmentLength * i,
          0
        )
      );
    }

    const curve = new THREE.CatmullRomCurve3(points);
    // Use TubeGeometry for visible thick lines
    return new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
  }, [nbrOfPoints, length]);

  // Random initial position
  const position = useMemo(() => [
    getRandomFloat(-10, 10),
    getRandomFloat(-6, 5),
    getRandomFloat(-2, 10),
  ], []);

  // Animation loop
  useFrame(() => {
    if (!materialRef.current) return;

    // Animate the offset
    dashOffsetRef.current -= speed;

    // Fade in when line appears, fade out when it's near the end
    const targetOpacity = dashOffsetRef.current > -3 ? 1 : 0;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.08;

    materialRef.current.opacity = opacityRef.current;

    // Remove line when it's fully faded
    if (dashOffsetRef.current < -4 && opacityRef.current < 0.01) {
      if (meshRef.current && meshRef.current.parent) {
        meshRef.current.parent.remove(meshRef.current);
      }
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        opacity={0}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

// Wind Component - Manages multiple wind lines
const Wind = () => {
  const [lines, setLines] = React.useState([]);

  useFrame(() => {
    // Add new lines randomly
    if (Math.random() < 0.65) {
      const id = Math.random();
      const color = COLORS[getRandomInt(0, COLORS.length - 1)];
      setLines((prev) => [
        ...prev,
        {
          id,
          color,
          speed: 0.003,
          nbrOfPoints: getRandomFloat(3, 5),
          length: getRandomFloat(5, 8),
        },
      ]);
    }

    // Limit total number of lines
    setLines((prev) => prev.slice(-30));
  });

  return (
    <group>
      {lines.map((line) => (
        <WindLine key={line.id} {...line} />
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
      {/* Three.js Canvas - Wind Lines Background */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <CameraController />
        <Wind />
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
