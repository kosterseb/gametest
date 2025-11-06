import React, { useEffect, useState } from 'react';
import { Swords, Sparkles } from 'lucide-react';

export const TurnBanner = ({ isEnemyTurn, show, onComplete }) => {
  const [animationStage, setAnimationStage] = useState('entering'); // 'entering', 'display', 'exiting'

  useEffect(() => {
    if (!show) return;

    // Reset to entering
    setAnimationStage('entering');

    // Enter animation: swoosh in from left/right (400ms CSS transition)
    const enterTimer = setTimeout(() => {
      setAnimationStage('display');
    }, 400);

    // Display for 1 second
    const displayTimer = setTimeout(() => {
      setAnimationStage('exiting');
    }, 1400);

    // Exit animation completes after 500ms CSS transition
    const exitTimer = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(displayTimer);
      clearTimeout(exitTimer);
    };
  }, [show, onComplete]);

  if (!show) return null;

  const getSwooshTransform = () => {
    if (isEnemyTurn) {
      // Enemy turn: swoosh from right
      if (animationStage === 'entering') return 'translateX(100%)';
      if (animationStage === 'exiting') return 'translateX(-200%)';
      return 'translateX(0)';
    } else {
      // Player turn: swoosh from left
      if (animationStage === 'entering') return 'translateX(-100%)';
      if (animationStage === 'exiting') return 'translateX(200%)';
      return 'translateX(0)';
    }
  };

  const getRotation = () => {
    if (animationStage === 'entering') return 'rotate(-5deg)';
    if (animationStage === 'exiting') return 'rotate(5deg)';
    return 'rotate(0deg)';
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
      {/* Backdrop flash */}
      <div
        className={`
          absolute inset-0
          ${isEnemyTurn ? 'bg-red-500' : 'bg-green-500'}
          transition-opacity duration-300
          ${animationStage === 'display' ? 'opacity-30' : 'opacity-0'}
        `}
      />

      {/* Banner */}
      <div
        className="relative z-10"
        style={{
          transform: `${getSwooshTransform()} ${getRotation()}`,
          transition: animationStage === 'entering'
            ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 0.5s cubic-bezier(0.4, 0, 1, 1)'
        }}
      >
        <div
          className={`
            ${isEnemyTurn ? 'nb-bg-red' : 'nb-bg-green'}
            nb-border-xl nb-shadow-xl
            px-20 py-8
            ${animationStage === 'display' ? 'animate-pulse' : ''}
          `}
        >
          <div className="flex items-center gap-6">
            {/* Left Icon */}
            {isEnemyTurn ? (
              <Swords className="w-20 h-20 text-black animate-pulse" />
            ) : (
              <Sparkles className="w-20 h-20 text-black animate-spin" style={{ animationDuration: '1s' }} />
            )}

            {/* Text */}
            <div className="text-black">
              <div className="text-7xl font-black uppercase tracking-wider">
                {isEnemyTurn ? 'ENEMY' : 'YOUR'}
              </div>
              <div className="text-7xl font-black uppercase tracking-wider">
                TURN!
              </div>
            </div>

            {/* Right Icon */}
            {isEnemyTurn ? (
              <Swords className="w-20 h-20 text-black animate-pulse" />
            ) : (
              <Sparkles className="w-20 h-20 text-black animate-spin" style={{ animationDuration: '1s' }} />
            )}
          </div>

          {/* Decorative bottom text */}
          <div className="mt-4 text-center">
            <div className="nb-bg-white nb-border nb-shadow px-6 py-2 inline-block">
              <span className="text-black font-black text-xl uppercase">
                {isEnemyTurn ? '⚔️ Prepare to Defend!' : '⚡ Make Your Move!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side particles */}
      {animationStage === 'display' && (
        <>
          {/* Left particles */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32">
            {[...Array(5)].map((_, i) => (
              <div
                key={`left-${i}`}
                className={`
                  absolute w-4 h-4 rounded-full
                  ${isEnemyTurn ? 'bg-red-400' : 'bg-green-400'}
                  animate-ping
                `}
                style={{
                  left: `${i * 15}px`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>

          {/* Right particles */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32">
            {[...Array(5)].map((_, i) => (
              <div
                key={`right-${i}`}
                className={`
                  absolute w-4 h-4 rounded-full
                  ${isEnemyTurn ? 'bg-red-400' : 'bg-green-400'}
                  animate-ping
                `}
                style={{
                  right: `${i * 15}px`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
