import React, { useEffect, useState, useRef } from 'react';

export const CardPlayParticles = ({ x, y, color = 'blue', onComplete }) => {
  const [particles, setParticles] = useState([]);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Generate fewer particles - REDUCED from 50 to 15 for better performance
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: x,
      y: y,
      angle: (Math.PI * 2 * i) / 15 + (Math.random() - 0.5) * 0.3,
      speed: 2 + Math.random() * 4, // Reduced speed range
      size: 4 + Math.random() * 8, // Reduced size range
      life: 1,
      decay: 0.02 + Math.random() * 0.01,
    }));

    setParticles(newParticles);
    startTimeRef.current = Date.now();

    // Use requestAnimationFrame for better performance than setInterval
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed > 1200) { // Reduced duration from 1500ms to 1200ms
        if (onComplete) onComplete();
        return;
      }

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed - 1.5,
            speed: p.speed * 0.96,
            life: p.life - p.decay,
            size: p.size * 0.95,
          }))
          .filter((p) => p.life > 0)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [x, y, onComplete]);

  const getColorClass = () => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-white';
    }
  };

  const colorClass = getColorClass(); // Memoize color class

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${colorClass}`}
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px) translate(-50%, -50%)`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.life,
            willChange: 'transform, opacity', // Optimize GPU rendering
          }}
        />
      ))}
    </div>
  );
};
