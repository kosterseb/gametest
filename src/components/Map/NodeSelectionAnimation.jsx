import React, { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * NodeSelectionAnimation Component
 *
 * Handles the cinematic camera zoom and white flash transition
 * when player confirms a node selection on the map
 */

export const useCameraZoomToNode = (cameraControls, targetPosition, isActive, onComplete) => {
  const [zoomProgress, setZoomProgress] = useState(0);
  const [startPosition] = useState(() => new THREE.Vector3());
  const [startTarget] = useState(() => new THREE.Vector3());

  useFrame((state, delta) => {
    if (!isActive || !cameraControls || zoomProgress >= 1) return;

    // Capture initial camera position on first frame
    if (zoomProgress === 0) {
      state.camera.getWorldPosition(startPosition);
      if (cameraControls.target) {
        startTarget.copy(cameraControls.target);
      }
    }

    // Ease function for smooth zoom (easeInOutCubic)
    const ease = (t) => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // Increment progress (takes ~1.5 seconds to complete)
    const newProgress = Math.min(zoomProgress + delta * 0.8, 1);
    setZoomProgress(newProgress);

    const easedProgress = ease(newProgress);

    // Interpolate camera position
    const newPos = new THREE.Vector3().lerpVectors(
      startPosition,
      targetPosition,
      easedProgress
    );

    // Interpolate camera target (look-at point)
    const newTarget = new THREE.Vector3().lerpVectors(
      startTarget,
      targetPosition,
      easedProgress
    );

    // Apply to camera
    state.camera.position.copy(newPos);
    if (cameraControls.target) {
      cameraControls.target.copy(newTarget);
    }

    // Trigger completion when done
    if (newProgress >= 1 && onComplete) {
      onComplete();
    }
  });

  return zoomProgress;
};

// White Flash Overlay Component
export const WhiteFlashOverlay = ({ isActive }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setOpacity(0);
      return;
    }

    // Fade in quickly
    const fadeIn = setTimeout(() => setOpacity(1), 100);

    return () => clearTimeout(fadeIn);
  }, [isActive]);

  if (!isActive && opacity === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-white pointer-events-none"
      style={{
        zIndex: 10002,
        opacity: opacity,
        transition: 'opacity 0.8s ease-in-out'
      }}
    />
  );
};

// UI Fade Out Component
export const UIFadeOut = ({ isActive, children }) => {
  return (
    <div
      style={{
        opacity: isActive ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
        pointerEvents: isActive ? 'none' : 'auto'
      }}
    >
      {children}
    </div>
  );
};

export default { useCameraZoomToNode, WhiteFlashOverlay, UIFadeOut };
