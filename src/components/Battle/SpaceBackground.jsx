import React, { useEffect, useRef } from 'react';

export const SpaceBackground = ({ enemyType = 'normal' }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get color based on enemy type
    const getColors = () => {
      switch (enemyType) {
        case 'elite':
          return {
            bg: '#1a0a00',
            stars: ['#ff9500', '#ffb740', '#ffd580'],
            glow: 'rgba(255, 149, 0, 0.3)'
          };
        case 'boss':
          return {
            bg: '#0a0000',
            stars: ['#8b0000', '#a00000', '#ff0000'],
            glow: 'rgba(139, 0, 0, 0.4)'
          };
        default: // normal
          return {
            bg: '#0a0000',
            stars: ['#ff4444', '#ff6666', '#ff8888'],
            glow: 'rgba(255, 68, 68, 0.3)'
          };
      }
    };

    const colors = getColors();

    // Create stars
    const stars = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        size: Math.random() * 2,
        color: colors.stars[Math.floor(Math.random() * colors.stars.length)]
      });
    }

    // Animation
    const animate = () => {
      // Fill background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      stars.forEach((star) => {
        // Move star forward
        star.z -= 2;

        // Reset star if it's too close
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        // Calculate 3D projection
        const x = (star.x - canvas.width / 2) * (canvas.width / star.z);
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z);
        const size = star.size * (canvas.width / star.z);

        // Only draw if on screen
        if (
          x + canvas.width / 2 > 0 &&
          x + canvas.width / 2 < canvas.width &&
          y + canvas.height / 2 > 0 &&
          y + canvas.height / 2 < canvas.height
        ) {
          // Draw glow
          const gradient = ctx.createRadialGradient(
            x + canvas.width / 2,
            y + canvas.height / 2,
            0,
            x + canvas.width / 2,
            y + canvas.height / 2,
            size * 3
          );
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(
            x + canvas.width / 2,
            y + canvas.height / 2,
            size * 3,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Draw star
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(
            x + canvas.width / 2,
            y + canvas.height / 2,
            size,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enemyType]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};
