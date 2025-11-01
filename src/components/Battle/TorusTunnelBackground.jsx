import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const TorusTunnelBackground = ({
  enemyType = 'normal', // 'normal', 'elite', 'boss'
  isPlayerAttacking = false,
  isPlayerHealing = false,
  isPlayerDamaged = false,
  isEnemyAttacking = false,
  isEnemyHealing = false,
  isEnemyDamaged = false,
  baseSpeed = 2,
  baseRotation = 0
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const tabTorusRef = useRef([]);
  const animationFrameRef = useRef(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  // Store original colors for each torus
  const originalColorsRef = useRef([]);

  // Speed and rotation refs for smooth interpolation
  const currentSpeedRef = useRef(baseSpeed);
  const currentRotationRef = useRef(baseRotation);
  const targetSpeedRef = useRef(baseSpeed);
  const targetRotationRef = useRef(baseRotation);

  const [currentColor, setCurrentColor] = useState(null);

  // Color palette - different shades of blue, red, and green
  const colorPalette = [
    // Blues
    new THREE.Color(0x0088ff), // Bright blue
    new THREE.Color(0x0066cc), // Medium blue
    new THREE.Color(0x004499), // Deep blue
    new THREE.Color(0x00ccff), // Cyan blue
    new THREE.Color(0x0055aa), // Royal blue
    // Reds
    new THREE.Color(0xff0044), // Bright red
    new THREE.Color(0xcc0033), // Deep red
    new THREE.Color(0xff3366), // Pink red
    new THREE.Color(0xaa0022), // Dark red
    new THREE.Color(0xff6688), // Light red
    // Greens
    new THREE.Color(0x00ff66), // Bright green
    new THREE.Color(0x00cc55), // Medium green
    new THREE.Color(0x00aa44), // Deep green
    new THREE.Color(0x44ff88), // Light green
    new THREE.Color(0x22cc66), // Forest green
  ];

  // Get random color from palette
  const getRandomColor = () => {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)].clone();
  };

  // Handle combat effects - Player Actions
  useEffect(() => {
    if (isPlayerAttacking) {
      // Player attacking - orange flash, speed up, intense rotation
      setCurrentColor(new THREE.Color(0xff4500)); // Orange-red
      targetSpeedRef.current = baseSpeed * 2.5;
      targetRotationRef.current = baseRotation + 8;

      const timer = setTimeout(() => {
        setCurrentColor(null);
        targetSpeedRef.current = baseSpeed;
        targetRotationRef.current = baseRotation;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPlayerAttacking, baseSpeed, baseRotation]);

  useEffect(() => {
    if (isPlayerHealing) {
      // Player healing - green flash, slow gentle rotation
      setCurrentColor(new THREE.Color(0x00ff66)); // Bright green
      targetSpeedRef.current = baseSpeed * 0.8;
      targetRotationRef.current = baseRotation + 3;

      const timer = setTimeout(() => {
        setCurrentColor(null);
        targetSpeedRef.current = baseSpeed;
        targetRotationRef.current = baseRotation;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPlayerHealing, baseSpeed, baseRotation]);

  useEffect(() => {
    if (isPlayerDamaged) {
      // Player damaged - red flash, shake effect
      setCurrentColor(new THREE.Color(0xff0000)); // Red
      targetSpeedRef.current = baseSpeed * 1.5;
      targetRotationRef.current = baseRotation + 10;

      const timer = setTimeout(() => {
        setCurrentColor(null);
        targetSpeedRef.current = baseSpeed;
        targetRotationRef.current = baseRotation;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPlayerDamaged, baseSpeed, baseRotation]);

  // Handle combat effects - Enemy Actions
  useEffect(() => {
    if (isEnemyAttacking) {
      // Enemy attacking - dark red flash, moderate speed boost
      setCurrentColor(new THREE.Color(0xcc0000)); // Dark red
      targetSpeedRef.current = baseSpeed * 2;
      targetRotationRef.current = baseRotation + 7;

      const timer = setTimeout(() => {
        setCurrentColor(null);
        targetSpeedRef.current = baseSpeed;
        targetRotationRef.current = baseRotation;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isEnemyAttacking, baseSpeed, baseRotation]);

  useEffect(() => {
    if (isEnemyHealing) {
      // Enemy healing - yellow-green flash, gentle motion
      setCurrentColor(new THREE.Color(0x88ff00)); // Yellow-green
      targetSpeedRef.current = baseSpeed * 0.9;
      targetRotationRef.current = baseRotation + 2;

      const timer = setTimeout(() => {
        setCurrentColor(null);
        targetSpeedRef.current = baseSpeed;
        targetRotationRef.current = baseRotation;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isEnemyHealing, baseSpeed, baseRotation]);

  useEffect(() => {
    if (isEnemyDamaged) {
      // Enemy damaged - blue flash, strong speed boost
      setCurrentColor(new THREE.Color(0x0088ff)); // Blue
      targetSpeedRef.current = baseSpeed * 2.2;
      targetRotationRef.current = baseRotation + 9;

      const timer = setTimeout(() => {
        setCurrentColor(null);
        targetSpeedRef.current = baseSpeed;
        targetRotationRef.current = baseRotation;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isEnemyDamaged, baseSpeed, baseRotation]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    cameraRef.current = camera;

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(camera);
    sceneRef.current = scene;

    // Create torus tunnel
    const numTorus = 80;
    const tabTorus = [];
    const originalColors = [];

    for (let i = 0; i < numTorus; i++) {
      const f = -i * 13;
      const geometry = new THREE.TorusGeometry(160, 75, 2, 13);

      // Assign random color from palette
      const randomColor = getRandomColor();
      originalColors.push(randomColor);

      const material = new THREE.MeshBasicMaterial({ color: randomColor });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = 57 * Math.cos(f);
      mesh.position.y = 57 * Math.sin(f);
      mesh.position.z = f * 1.25;
      mesh.rotation.z = f * 0.03;

      tabTorus.push({ mesh, initialZ: mesh.position.z });
      scene.add(mesh);
    }

    tabTorusRef.current = tabTorus;
    originalColorsRef.current = originalColors;

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Smooth interpolation for speed and rotation
      const lerpFactor = 0.05; // Smoothness factor (lower = smoother but slower)
      currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * lerpFactor;
      currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * lerpFactor;

      // Update camera position for smooth mouse tracking
      camera.position.x += (mouseXRef.current - camera.position.x) * 0.05;
      camera.position.y += (-mouseYRef.current - camera.position.y) * 0.05;

      // Update torus positions and rotations
      tabTorusRef.current.forEach((torus, i) => {
        torus.mesh.position.z += currentSpeedRef.current;
        torus.mesh.rotation.z += i * currentRotationRef.current / 10000;

        if (torus.mesh.position.z > 0) {
          torus.mesh.position.z = -1000;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      tabTorusRef.current.forEach(torus => {
        torus.mesh.geometry.dispose();
        torus.mesh.material.dispose();
        scene.remove(torus.mesh);
      });

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, []); // Only run once on mount

  // Update materials when color changes
  useEffect(() => {
    if (!sceneRef.current || tabTorusRef.current.length === 0) return;

    tabTorusRef.current.forEach((torus, index) => {
      const oldMaterial = torus.mesh.material;

      if (currentColor) {
        // Combat effect - flash all tori to the same combat color
        torus.mesh.material = new THREE.MeshBasicMaterial({ color: currentColor });
      } else {
        // Return to original individual colors
        const originalColor = originalColorsRef.current[index];
        torus.mesh.material = new THREE.MeshBasicMaterial({ color: originalColor });
      }

      oldMaterial.dispose();
    });
  }, [currentColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};
