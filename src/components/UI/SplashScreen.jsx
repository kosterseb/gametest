import React, { useEffect, useRef, useState } from 'react';
import studioLogo from '../../assets/Logos/Kinda_Whimsical_Games _LOGO_TRANSPARENT_COLOR.png';

export const SplashScreen = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);
  const confettiParticles = useRef([]);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particle class
    class ConfettiParticle {
      constructor() {
        this.reset();
        // Start particles from random heights for initial spread
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.color = this.getRandomColor();
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.opacity = 1;
      }

      getRandomColor() {
        const colors = [
          '#FF6B6B', // Red
          '#4ECDC4', // Teal
          '#45B7D1', // Blue
          '#FFA07A', // Light Salmon
          '#98D8C8', // Mint
          '#F7DC6F', // Yellow
          '#BB8FCE', // Purple
          '#85C1E2', // Sky Blue
          '#F8B739', // Orange
          '#52C41A', // Green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Gravity effect
        this.speedY += 0.05;

        // Reset if off screen
        if (this.y > canvas.height + 10) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        // Draw confetti as rectangles
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);

        ctx.restore();
      }
    }

    // Create confetti particles
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
      confettiParticles.current.push(new ConfettiParticle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw all particles
      confettiParticles.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Start fade out after 4.5 seconds, complete after 5 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Studio Logo */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${
          fadeOut ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <img
          src={studioLogo}
          alt="Kinda Whimsical Games"
          className="max-w-md w-full px-8 drop-shadow-2xl animate-fadeIn"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))',
          }}
        />

        {/* Optional tagline */}
        <p className="text-white text-2xl mt-6 font-light tracking-wider animate-fadeIn opacity-80">
          Kinda Whimsical Games
        </p>
      </div>
    </div>
  );
};
