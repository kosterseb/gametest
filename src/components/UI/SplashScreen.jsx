import React, { useEffect, useRef, useState } from 'react';
import studioLogo from '../../assets/Logos/Kinda_Whimsical_Games _LOGO_TRANSPARENT_COLOR.png';

export const SplashScreen = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoScale, setLogoScale] = useState(0.1);
  const [logoBop, setLogoBop] = useState(0);
  const [backgroundExpansion, setBackgroundExpansion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiParticles = useRef([]);
  const animationFrameId = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particle class - explodes from center
    class ConfettiParticle {
      constructor(centerX, centerY) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.reset();
      }

      reset() {
        // Start from center
        this.x = this.centerX;
        this.y = this.centerY;

        // Random angle for explosion
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 8 + 4;

        this.speedX = Math.cos(angle) * velocity;
        this.speedY = Math.sin(angle) * velocity;

        this.size = Math.random() * 10 + 5;
        this.color = this.getRandomColor();
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 15 - 7.5;
        this.opacity = 1;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.01;
      }

      getRandomColor() {
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
          '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
          '#F8B739', '#52C41A', '#FF1493', '#00CED1',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Gravity
        this.speedY += 0.3;

        // Air resistance
        this.speedX *= 0.99;

        // Fade out over time
        this.life -= this.decay;
        this.opacity = Math.max(0, this.life);
      }

      draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        // Draw confetti as rectangles
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 2);

        ctx.restore();
      }

      isAlive() {
        return this.life > 0;
      }
    }

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw confetti
      if (showConfetti) {
        confettiParticles.current = confettiParticles.current.filter(particle => {
          particle.update();
          particle.draw(ctx);
          return particle.isAlive();
        });
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // Logo animation with rubberband effect
    const logoAnimationDuration = 1000; // 1 second for growth
    const animateLogo = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / logoAnimationDuration, 1);

      // Rubberband easing function
      const rubberBand = (t) => {
        if (t < 0.5) {
          // Grow quickly
          return Math.pow(t * 2, 2);
        } else {
          // Overshoot and bounce back
          const x = (t - 0.5) * 2;
          return 1 + Math.sin(x * Math.PI * 2) * 0.15 * (1 - x);
        }
      };

      const scale = 0.1 + rubberBand(progress) * 0.9; // From 0.1 to 1.0
      setLogoScale(scale);
      setBackgroundExpansion(progress);

      // Trigger confetti burst when logo reaches peak (around 60% through animation)
      if (progress >= 0.6 && !showConfetti) {
        setShowConfetti(true);
        // Create confetti explosion from center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const particleCount = 200;

        for (let i = 0; i < particleCount; i++) {
          confettiParticles.current.push(new ConfettiParticle(centerX, centerY));
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animateLogo);
      } else {
        // After growth completes, start bobbing animation
        animateBop();
      }
    };

    // Continuous bobbing animation after growth completes
    const animateBop = () => {
      const elapsed = Date.now() - startTime.current - logoAnimationDuration;
      const bopAmount = Math.sin(elapsed / 300) * 0.03; // Gentle up/down bop
      setLogoBop(bopAmount);
      requestAnimationFrame(animateBop);
    };

    animateLogo();

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
  }, [onComplete, showConfetti]);

  // Calculate radial gradient style
  const getBackgroundStyle = () => {
    const size = backgroundExpansion * 150; // Expand from 0 to 150%
    return {
      background: `radial-gradient(circle at center,
        rgba(139, 92, 246, 1) 0%,
        rgba(99, 102, 241, 1) ${size * 0.3}%,
        rgba(168, 85, 247, 1) ${size * 0.6}%,
        rgba(124, 58, 237, 1) ${size}%)`,
    };
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={getBackgroundStyle()}
    >
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Studio Logo - 4x larger with bop */}
      <div
        className="relative z-10 flex flex-col items-center transition-opacity duration-300"
        style={{
          transform: `scale(${(logoScale + logoBop) * 4})`,
          transition: 'none', // Disable CSS transition, we're animating via state
        }}
      >
        <img
          src={studioLogo}
          alt="Kinda Whimsical Games"
          className="max-w-md w-full px-8"
          style={{
            filter: `drop-shadow(0 0 ${30 * logoScale}px rgba(255, 255, 255, ${0.5 * logoScale}))`,
          }}
        />
      </div>
    </div>
  );
};
