import React, { useState, useEffect } from 'react';

export const EnemyAvatar = ({
  enemyName = 'enemy',
  isBoss = false,
  customAvatarParams = null,
  isBeingAttacked = false,
  isHealing = false,
  isAttacking = false
}) => {
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [showHealEffect, setShowHealEffect] = useState(false);
  const [showAttackEffect, setShowAttackEffect] = useState(false);
  const [avatarVariant, setAvatarVariant] = useState(null);

  // Generate a consistent seed from enemy name
  const getSeedFromName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Damage effect - when enemy takes damage
  useEffect(() => {
    if (isBeingAttacked) {
      setShowHitEffect(true);
      const damageLips = ['variant07', 'variant11'];
      const lips = damageLips[Math.floor(Math.random() * damageLips.length)];
      setAvatarVariant({ lips });

      const timer = setTimeout(() => {
        setShowHitEffect(false);
        setAvatarVariant(null);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setShowHitEffect(false);
        setAvatarVariant(null);
      };
    } else {
      setShowHitEffect(false);
      setAvatarVariant(null);
    }
  }, [isBeingAttacked]);

  // Heal effect - when enemy heals
  useEffect(() => {
    if (isHealing) {
      setShowHealEffect(true);
      const healLips = ['variant03', 'variant08'];
      const lips = healLips[Math.floor(Math.random() * healLips.length)];
      setAvatarVariant({ lips, eyes: 'variant03' });

      const timer = setTimeout(() => {
        setShowHealEffect(false);
        setAvatarVariant(null);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setShowHealEffect(false);
        setAvatarVariant(null);
      };
    } else {
      setShowHealEffect(false);
      setAvatarVariant(null);
    }
  }, [isHealing]);

  // Attack effect - when enemy attacks
  useEffect(() => {
    if (isAttacking) {
      setShowAttackEffect(true);
      const attackLips = ['variant14', 'variant15'];
      const attackBrows = ['variant02', 'variant05'];
      const lips = attackLips[Math.floor(Math.random() * attackLips.length)];
      const brows = attackBrows[Math.floor(Math.random() * attackBrows.length)];
      setAvatarVariant({ lips, eyes: 'variant04', eyebrows: brows });

      const timer = setTimeout(() => {
        setShowAttackEffect(false);
        setAvatarVariant(null);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setShowAttackEffect(false);
        setAvatarVariant(null);
      };
    } else {
      setShowAttackEffect(false);
      setAvatarVariant(null);
    }
  }, [isAttacking]);

  // DiceBear API URL - using notionists style with flip=true to face player
  const getAvatarUrl = () => {
    const seed = getSeedFromName(enemyName);
    let url = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&size=240&flip=true`;

    // For bosses with custom params, use those as base
    if (customAvatarParams) {
      if (customAvatarParams.body) url += `&body=${customAvatarParams.body}`;
      if (customAvatarParams.beard) url += `&beard=${customAvatarParams.beard}`;
      if (customAvatarParams.hair) url += `&hair=${customAvatarParams.hair}`;

      // During animations, overlay variant params on top of custom params
      if (avatarVariant) {
        if (avatarVariant.lips) url += `&lips=${avatarVariant.lips}`;
        if (avatarVariant.eyes) url += `&eyes=${avatarVariant.eyes}`;
        if (avatarVariant.eyebrows) url += `&eyebrows=${avatarVariant.eyebrows}`;
      } else {
        // When not animating, use boss's default facial expressions
        if (customAvatarParams.lips) url += `&lips=${customAvatarParams.lips}`;
        if (customAvatarParams.eyes) url += `&eyes=${customAvatarParams.eyes}`;
      }
    } else {
      // Regular enemies - only add variant params during animations
      if (avatarVariant) {
        if (avatarVariant.lips) url += `&lips=${avatarVariant.lips}`;
        if (avatarVariant.eyes) url += `&eyes=${avatarVariant.eyes}`;
        if (avatarVariant.eyebrows) url += `&eyebrows=${avatarVariant.eyebrows}`;
      }
    }

    return url;
  };

  // Different border styling for bosses
  const borderClass = isBoss
    ? "border-4 border-white shadow-2xl bg-gradient-to-br from-purple-600 to-red-600"
    : "border-4 border-white shadow-2xl bg-gradient-to-br from-red-400 to-orange-500";

  return (
    <div className="relative">
      {/* Enemy Avatar */}
      <div className={`relative transition-all duration-300 ${
        showHitEffect ? 'animate-pulse' : ''
      }`}>
        <img
          src={getAvatarUrl()}
          alt={`${enemyName} Avatar`}
          className={`w-48 h-48 md:w-56 md:h-56 rounded-full ${borderClass}`}
        />

        {/* Damage Hit Effect */}
        {showHitEffect && (
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-50 animate-ping pointer-events-none" />
        )}

        {/* Heal Effect */}
        {showHealEffect && (
          <>
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-40 blur-xl animate-pulse pointer-events-none" />
            {/* Floating + symbols */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-green-400 animate-float-up">+</span>
              <span className="text-3xl font-bold text-green-300 animate-float-up" style={{ animationDelay: '0.2s' }}>+</span>
              <span className="text-3xl font-bold text-green-300 animate-float-up" style={{ animationDelay: '0.4s' }}>+</span>
            </div>
          </>
        )}

        {/* Attack Effect */}
        {showAttackEffect && (
          <div className="absolute inset-0 rounded-full bg-orange-500 opacity-60 blur-md animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
};
