import React, { useState, useEffect } from 'react';

export const PlayerAvatar = ({
  playerHealth,
  maxPlayerHealth,
  isBeingAttacked = false,
  seed = 'player'
}) => {
  const [expression, setExpression] = useState('happy');
  const [showHitEffect, setShowHitEffect] = useState(false);

  // Update expression based on health
  useEffect(() => {
    const healthPercent = (playerHealth / maxPlayerHealth) * 100;
    if (healthPercent > 70) {
      setExpression('happy');
    } else if (healthPercent > 40) {
      setExpression('default');
    } else {
      setExpression('sad');
    }
  }, [playerHealth, maxPlayerHealth]);

  // Show hurt expression when attacked
  useEffect(() => {
    if (isBeingAttacked) {
      setExpression('sad');
      setShowHitEffect(true);

      const timer = setTimeout(() => {
        setShowHitEffect(false);
        // Revert expression after 4 seconds
        const healthPercent = (playerHealth / maxPlayerHealth) * 100;
        if (healthPercent > 70) {
          setExpression('happy');
        } else if (healthPercent > 40) {
          setExpression('default');
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isBeingAttacked, playerHealth, maxPlayerHealth]);

  // DiceBear API URL - using "avataaars" style which supports expressions
  // We use mood parameter to change expressions
  const getAvatarUrl = () => {
    const style = 'avataaars';
    const moodMap = {
      'happy': 'happy',
      'default': 'default',
      'sad': 'sad'
    };
    const mood = moodMap[expression] || 'default';

    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&mood=${mood}&size=180`;
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

      {/* Avatar */}
      <div className={`
        relative transition-all duration-300
        ${showHitEffect ? 'animate-shake scale-95' : 'scale-100'}
      `}>
        <img
          src={getAvatarUrl()}
          alt="Player Avatar"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-blue-400 to-purple-500"
        />
      </div>
    </div>
  );
};
