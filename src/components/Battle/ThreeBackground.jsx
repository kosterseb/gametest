import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground = ({ enemyType = 'normal' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    // Renderer with optimizations
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable for better performance
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio for performance
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Get colors based on enemy type
    const getColors = () => {
      switch (enemyType) {
        case 'elite':
          return {
            bg: new THREE.Color(0xff9500),
            grid: new THREE.Color(0xffd580),
            fog: new THREE.Color(0xffa520)
          };
        case 'boss':
          return {
            bg: new THREE.Color(0x4d0000),
            grid: new THREE.Color(0xa00000),
            fog: new THREE.Color(0x660000)
          };
        default: // normal
          return {
            bg: new THREE.Color(0xa2cef4),
            grid: new THREE.Color(0xff8787),
            fog: new THREE.Color(0xff6b6b)
          };
      }
    };

    const colors = getColors();

    // Scene background and fog
    scene.background = colors.bg;
    scene.fog = new THREE.Fog(colors.fog, 5, 25);

    // Create simplified grid planes
    const gridSize = 20;
    const divisions = 20;

    // Bottom grid
    const gridHelper1 = new THREE.GridHelper(gridSize, divisions, colors.grid, colors.grid);
    gridHelper1.position.y = -2;
    gridHelper1.material.opacity = 0.6;
    gridHelper1.material.transparent = true;
    scene.add(gridHelper1);

    // Top grid (inverted)
    const gridHelper2 = new THREE.GridHelper(gridSize, divisions, colors.grid, colors.grid);
    gridHelper2.position.y = 2;
    gridHelper2.rotation.x = Math.PI;
    gridHelper2.material.opacity = 0.4;
    gridHelper2.material.transparent = true;
    scene.add(gridHelper2);

    // Animation
    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      time += 0.01;

      // Animate grids
      gridHelper1.position.z = (time * 2) % 2;
      gridHelper2.position.z = -(time * 2) % 2;

      // Slow rotation
      gridHelper1.rotation.y = time * 0.05;
      gridHelper2.rotation.y = -time * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose of Three.js resources
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [enemyType]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
};
