import React, { useEffect, useState } from 'react';

export const CardPlayParticles = ({ x, y, color = 'blue', onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles - INCREASED from 20 to 50
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: x,
      y: y,
      angle: (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.3, // Add randomness to angle
      speed: 3 + Math.random() * 8, // INCREASED speed from 2-5 to 3-11
      size: 6 + Math.random() * 12, // INCREASED size from 4-12 to 6-18
      life: 1,
      decay: 0.015 + Math.random() * 0.01, // Variable decay rate
    }));

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed,
          y: p.y + Math.sin(p.angle) * p.speed - 2, // Add upward drift
          speed: p.speed * 0.97, // Slightly slower deceleration
          life: p.life - p.decay,
          size: p.size * 0.96,
        })).filter((p) => p.life > 0)
      );
    }, 16);

    // Cleanup after animation
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onComplete) onComplete();
    }, 1500); // Increased from 1000 to 1500ms for longer explosion

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
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

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${getColorClass()} shadow-lg`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.life,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.016s linear',
          }}
        />
      ))}
    </div>
  );
};
