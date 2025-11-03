import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TorusTunnelBackground = ({
  baseSpeed = 1, // Half speed of original (was 2)
  baseRotation = 0 // Original default rotation
}) => {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const speedRef = useRef(baseSpeed);
  const rotationRef = useRef(baseRotation);

  // Initialize Three.js scene - converted from original CodePen
  useEffect(() => {
    console.log('🌀 TorusTunnelBackground useEffect triggered');
    console.log('🌀 containerRef.current:', containerRef.current);

    if (!containerRef.current) {
      console.log('❌ Container ref not available, skipping initialization');
      return;
    }

    console.log('✅ Starting torus tunnel initialization...');

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Check if container already has a canvas
    if (containerRef.current.children.length > 0) {
      console.log('⚠️ Container already has children, clearing...');
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    containerRef.current.appendChild(renderer.domElement);
    console.log('✅ Renderer added to DOM');

    // Setup camera (original settings)
    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 0; // Original camera position

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(camera);

    // Normal material (original used MeshNormalMaterial)
    const normalMaterial = new THREE.MeshNormalMaterial({});

    // Create torus tunnel (original implementation)
    const numTorus = 80;
    const tabTorus = [];

    for (let i = 0; i < numTorus; i++) {
      const f = -i * 13;
      const geometry = new THREE.TorusGeometry(160, 75, 2, 13); // Original geometry
      const mesh = new THREE.Mesh(geometry, normalMaterial);

      // Original positioning
      mesh.position.x = 57 * Math.cos(f);
      mesh.position.y = 57 * Math.sin(f);
      mesh.position.z = f * 1.25;
      mesh.rotation.z = f * 0.03;

      tabTorus.push(mesh);
      scene.add(mesh);
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop (original implementation)
    let frameCount = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update camera position for smooth mouse tracking
      camera.position.x += (mouseXRef.current - camera.position.x) * 0.05;
      camera.position.y += (-mouseYRef.current - camera.position.y) * 0.05;

      // Update torus positions (original update logic)
      for (let i = 0; i < numTorus; i++) {
        tabTorus[i].position.z += speedRef.current; // Move towards camera
        tabTorus[i].rotation.z += i * rotationRef.current / 10000; // Original rotation calculation

        // Reset position when torus passes camera (original logic)
        if (tabTorus[i].position.z > 0) {
          tabTorus[i].position.z = -1000;
        }
      }

      renderer.render(scene, camera);

      // Debug every 60 frames
      frameCount++;
      if (frameCount % 60 === 0) {
        console.log('🌀 Frame', frameCount, '- First torus Z:', tabTorus[0].position.z.toFixed(1), '- Speed:', speedRef.current);
      }
    };

    console.log('🌀 Torus tunnel initialized - Speed:', speedRef.current, 'Rotation:', rotationRef.current);
    console.log('🌀 Starting animation loop...');
    animate();
    console.log('✅ Animation loop started!');

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up torus tunnel...');
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        console.log('🛑 Cancelling animation frame:', animationFrameRef.current);
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      tabTorus.forEach(mesh => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        scene.remove(mesh);
      });

      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.log('⚠️ Error removing canvas:', e.message);
        }
      }

      renderer.dispose();
      console.log('✅ Cleanup complete');
    };
  }, []); // Only initialize once

  // Update speed/rotation refs when props change
  useEffect(() => {
    speedRef.current = baseSpeed;
    rotationRef.current = baseRotation;
    console.log('🌀 Updated speed:', baseSpeed, 'rotation:', baseRotation);
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
