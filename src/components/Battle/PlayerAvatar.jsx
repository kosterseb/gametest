import React, { useState, useEffect } from 'react';

export const PlayerAvatar = ({
  playerHealth,
  maxPlayerHealth,
  isBeingAttacked = false,
  isHealing = false,
  seed = 'player'
}) => {
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [showHealEffect, setShowHealEffect] = useState(false);

  // Show hurt effect when attacked
  useEffect(() => {
    if (isBeingAttacked) {
      console.log('🩸 Avatar: Showing damage effect');
      setShowHitEffect(true);
      setShowHealEffect(false);

      const timer = setTimeout(() => {
        console.log('🩸 Avatar: Clearing damage effect (timeout)');
        setShowHitEffect(false);
      }, 2000);

      return () => {
        console.log('🩸 Avatar: Cleanup - clearing damage effect');
        clearTimeout(timer);
        setShowHitEffect(false);
      };
    } else {
      // Prop is false, immediately clear effect
      setShowHitEffect(false);
    }
  }, [isBeingAttacked]);

  // Show heal effect when healing
  useEffect(() => {
    if (isHealing) {
      console.log('💚 Avatar: Showing heal effect');
      setShowHealEffect(true);
      setShowHitEffect(false);

      const timer = setTimeout(() => {
        console.log('💚 Avatar: Clearing heal effect (timeout)');
        setShowHealEffect(false);
      }, 2000);

      return () => {
        console.log('💚 Avatar: Cleanup - clearing heal effect');
        clearTimeout(timer);
        setShowHealEffect(false);
      };
    } else {
      // Prop is false, immediately clear effect
      setShowHealEffect(false);
    }
  }, [isHealing]);

  // DiceBear API URL - using notionists style
  const getAvatarUrl = () => {
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&size=240`;
  };

  return (
    <div className="relative">
      {/* Hit effect overlay */}
      {showHitEffect && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Red flash */}
          <div className="absolute inset-0 bg-red-500 opacity-50 animate-pulse rounded-full"></div>

          {/* Impact particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping"
              style={{
                left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 40}%`,
                top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 40}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
      )}

      {/* Heal effect overlay */}
      {showHealEffect && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Green glow */}
          <div className="absolute inset-0 bg-green-400 opacity-40 rounded-full animate-pulse"
               style={{ animationDuration: '0.6s' }}></div>

          {/* Healing sparkles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-300 rounded-full animate-ping"
              style={{
                left: `${50 + Math.cos((i * Math.PI * 2) / 12) * 30}%`,
                top: `${50 + Math.sin((i * Math.PI * 2) / 12) * 30}%`,
                animationDelay: `${i * 0.08}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}

          {/* Plus symbols floating up */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`plus-${i}`}
              className="absolute text-green-400 font-bold text-2xl opacity-80"
              style={{
                left: `${40 + i * 15}%`,
                top: '50%',
                animation: 'floatUp 1s ease-out forwards',
                animationDelay: `${i * 0.2}s`
              }}
            >
              +
            </div>
          ))}
        </div>
      )}

      {/* Avatar */}
      <div className={`
        relative transition-all duration-300
        ${showHitEffect ? 'animate-shake scale-95' : showHealEffect ? 'scale-105' : 'scale-100'}
      `}>
        <img
          src={getAvatarUrl()}
          alt="Player Avatar"
          className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-blue-400 to-purple-500"
        />
      </div>
    </div>
  );
};
