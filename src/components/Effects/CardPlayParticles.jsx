import React, { useEffect, useState } from 'react';

export const CardPlayParticles = ({ x, y, color = 'blue', onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: x,
      y: y,
      angle: (Math.PI * 2 * i) / 20, // Evenly distributed in a circle
      speed: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
      life: 1,
    }));

    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed,
          y: p.y + Math.sin(p.angle) * p.speed,
          life: p.life - 0.02,
          size: p.size * 0.98,
        })).filter((p) => p.life > 0)
      );
    }, 16);

    // Cleanup after animation
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onComplete) onComplete();
    }, 1000);

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
