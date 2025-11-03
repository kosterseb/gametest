import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TorusTunnelBackground = ({
  baseSpeed = 8, // Much faster for visible movement
  baseRotation = 0.08 // Faster rotation for visible spinning
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const tabTorusRef = useRef([]);
  const animationFrameRef = useRef(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const speedRef = useRef(baseSpeed);
  const rotationRef = useRef(baseRotation);

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
      75, // Slightly narrower FOV for better depth perception
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.z = 50; // Closer to see the tunnel effect better
    camera.position.x = 0;
    camera.position.y = 0;
    cameraRef.current = camera;

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(camera);
    sceneRef.current = scene;

    // Create torus tunnel
    const numTorus = 80;
    const tabTorus = [];

    for (let i = 0; i < numTorus; i++) {
      const f = -i * 13;
      const geometry = new THREE.TorusGeometry(50, 12, 16, 32); // Balanced size: radius 50, tube 12, smooth segments

      // Each torus gets a random color from palette
      const randomColor = getRandomColor();
      const material = new THREE.MeshBasicMaterial({ color: randomColor, wireframe: false });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = 20 * Math.cos(f); // Moderate spiral
      mesh.position.y = 20 * Math.sin(f); // Moderate spiral
      mesh.position.z = f * 3; // Spread them out more
      mesh.rotation.z = f * 0.03;

      tabTorus.push({ mesh, initialZ: mesh.position.z });
      scene.add(mesh);
    }

    tabTorusRef.current = tabTorus;

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Update refs when props change
    speedRef.current = baseSpeed;
    rotationRef.current = baseRotation;

    // Animation loop
    let frameCount = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update camera position for smooth mouse tracking
      camera.position.x += (mouseXRef.current - camera.position.x) * 0.05;
      camera.position.y += (-mouseYRef.current - camera.position.y) * 0.05;

      // Update torus positions and rotations using refs
      tabTorusRef.current.forEach((torus, i) => {
        torus.mesh.position.z += speedRef.current; // Move towards camera
        torus.mesh.rotation.z += rotationRef.current; // Rotation speed

        // Reset position when torus passes the camera
        if (torus.mesh.position.z > camera.position.z + 100) {
          torus.mesh.position.z = torus.initialZ;
        }
      });

      renderer.render(scene, camera);

      // Debug log every 60 frames (about once per second at 60fps)
      frameCount++;
      if (frameCount % 60 === 0) {
        const firstTorus = tabTorusRef.current[0];
        const lastTorus = tabTorusRef.current[tabTorusRef.current.length - 1];
        const canvasVisible = renderer.domElement && renderer.domElement.style.display !== 'none';
        console.log('🌀 Animation frame', frameCount);
        console.log('  - Torus count:', tabTorusRef.current.length, '  - Speed:', speedRef.current, '  - Rotation:', rotationRef.current);
        console.log('  - Camera pos:', camera.position.z.toFixed(1));
        console.log('  - First torus z:', firstTorus.mesh.position.z.toFixed(1), '  - Initial:', firstTorus.initialZ.toFixed(1));
        console.log('  - Last torus z:', lastTorus.mesh.position.z.toFixed(1), '  - Initial:', lastTorus.initialZ.toFixed(1));
        console.log('  - Canvas visible:', canvasVisible);
        console.log('  - Renderer size:', renderer.domElement.width, 'x', renderer.domElement.height);
      }
    };

    console.log('🌀 Starting torus tunnel animation');
    console.log('  - Speed:', baseSpeed, '  - Rotation:', baseRotation);
    console.log('  - Camera position:', camera.position.x, camera.position.y, camera.position.z);
    console.log('  - Torus count:', tabTorus.length);
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
  }, []); // Empty dependency array - only run once on mount

  // Update refs when props change without recreating the scene
  useEffect(() => {
    speedRef.current = baseSpeed;
    rotationRef.current = baseRotation;
  }, [baseSpeed, baseRotation]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};
