import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CardIcon } from './CardIcon';
import { RARITY_CONFIG } from '../../data/statusEffects';
import { getModifiedCardCost } from '../../data/statusEffects';
import { Zap, Heart, Shield, Sparkles, Sword } from 'lucide-react';

export const Card = ({
  card,
  onClick,
  disabled = false,
  playerEnergy = 0,
  playerStatuses = [],
  discardMode = false,
  compact = false,
  showCost = true,
  glowing = false,
  draggable = true
}) => {
  const modifiedCost = getModifiedCardCost(card.energyCost, playerStatuses);
  // Skip energy check when showCost is false (reward screens, shop, etc.)
  const canAfford = showCost ? (playerEnergy >= modifiedCost) : true;
  const rarityConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

  // 3D tilt effect states (subtle for neo-brutal)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInPlayZone, setIsInPlayZone] = useState(false);
  const cardRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Handle subtle 3D tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (disabled || (!canAfford && !discardMode) || isDragging) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15; // Subtle tilt
    const rotateY = (centerX - x) / 15;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (!disabled && (canAfford || discardMode)) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  // Custom drag handlers using mouse events
  const handleMouseDown = (e) => {
    if (!draggable || disabled || (!canAfford && !discardMode)) return;

    e.preventDefault();

    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    dragStartPos.current = { x: rect.left, y: rect.top };
    setDragPosition({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    setIsDragging(true);
  };

  // Global mouse move handler for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMoveGlobal = (e) => {
      setDragPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });

      const inPlayZone = e.clientY < window.innerHeight * 0.6;
      setIsInPlayZone(inPlayZone);
    };

    const handleMouseUpGlobal = (e) => {
      setIsDragging(false);
      setIsInPlayZone(false);

      if (e.clientY < window.innerHeight * 0.6 && onClick) {
        onClick();
      }
    };

    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, dragOffset, onClick]);

  // Neo-brutal solid colors based on card type
  const getCardColor = () => {
    switch (card.type) {
      case 'damage': return 'nb-bg-red';
      case 'heal': return 'nb-bg-green';
      case 'utility': return 'nb-bg-blue';
      case 'cleanse': return 'nb-bg-purple';
      case 'status': return 'nb-bg-orange';
      default: return 'nb-bg-white';
    }
  };

  const getTypeIcon = () => {
    switch (card.type) {
      case 'damage': return <Sword className="w-4 h-4" />;
      case 'heal': return <Heart className="w-4 h-4" />;
      case 'utility': return <Shield className="w-4 h-4" />;
      case 'cleanse': return <Sparkles className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const cardSize = compact ? 'w-36' : 'w-48';
  const cardHeight = compact ? 'h-48' : 'h-64';

  const cardStyle = {
    transform: isHovering && !isDragging
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale(1.05)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
    transformStyle: 'preserve-3d',
    opacity: isDragging ? 0.4 : 1,
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  const draggingCardStyle = {
    position: 'fixed',
    left: `${dragPosition.x}px`,
    top: `${dragPosition.y}px`,
    transform: 'scale(1.15) rotate(-3deg)',
    transformStyle: 'preserve-3d',
    zIndex: 9999,
    pointerEvents: 'none',
    cursor: 'grabbing',
  };

  const cardContent = (
    <>
      {/* Header - Type Badge */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-black nb-border px-3 py-1 flex items-center gap-1.5 nb-shadow">
          {getTypeIcon()}
          <span className="text-white text-xs font-bold uppercase tracking-wider">{card.type}</span>
        </div>
      </div>

      {/* Energy Cost - Top Right */}
      {showCost && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`
            flex items-center justify-center
            w-12 h-12 nb-border-lg nb-shadow
            ${canAfford || discardMode ? 'nb-bg-cyan' : 'bg-gray-400'}
          `}>
            <span className="text-black font-black text-xl">
              {modifiedCost}
            </span>
          </div>
        </div>
      )}

      {/* Card Icon - Center */}
      <div className="flex-1 flex items-center justify-center pt-12 pb-3">
        <CardIcon
          cardName={card.name}
          cardType={card.type}
          size={compact ? 64 : 80}
          showGlow={!disabled && canAfford}
        />
      </div>

      {/* Card Name */}
      <div className="px-4 pb-2">
        <h3 className={`text-black font-black text-center ${compact ? 'text-sm' : 'text-base'} leading-tight uppercase tracking-wide`}>
          {card.name}
        </h3>
      </div>

      {/* Card Description */}
      <div className="px-4 pb-3">
        <p className={`text-black text-center ${compact ? 'text-xs' : 'text-sm'} font-semibold leading-snug line-clamp-2`}>
          {card.description}
        </p>
      </div>

      {/* Bottom Bar - Stats and Rarity */}
      <div className="bg-black p-2.5 mt-auto nb-border-t-lg">
        {/* Stats Display */}
        <div className="flex justify-center gap-2 mb-2">
          {card.baseDamage && (
            <div className="nb-bg-red nb-border nb-shadow px-3 py-1 flex items-center gap-1">
              <Sword className="w-3 h-3 text-black" />
              <span className="text-black font-bold text-sm">{card.baseDamage}</span>
            </div>
          )}
          {card.baseHeal && (
            <div className="nb-bg-green nb-border nb-shadow px-3 py-1 flex items-center gap-1">
              <Heart className="w-3 h-3 text-black" />
              <span className="text-black font-bold text-sm">+{card.baseHeal}</span>
            </div>
          )}
          {card.diceRoll && (
            <div className="nb-bg-yellow nb-border nb-shadow px-3 py-1">
              <span className="text-black font-bold text-sm">🎲</span>
            </div>
          )}
        </div>

        {/* Rarity Badge */}
        <div className="flex justify-center">
          <div className="nb-bg-white nb-border nb-shadow px-3 py-1">
            <span className="text-black text-xs font-black uppercase tracking-widest">{rarityConfig.name}</span>
          </div>
        </div>
      </div>

      {/* Discard Mode Overlay */}
      {discardMode && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="nb-bg-yellow nb-border-lg nb-shadow px-6 py-3">
            <p className="text-black font-black text-lg uppercase">Discard for 1 ⚡</p>
          </div>
        </div>
      )}

      {/* Cannot Afford Overlay */}
      {!canAfford && !discardMode && !disabled && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="nb-bg-red nb-border-lg nb-shadow px-4 py-2">
            <p className="text-white font-black text-sm uppercase">Not Enough Energy</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Original card in hand */}
      <button
        ref={cardRef}
        onClick={!draggable ? onClick : undefined}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={draggable ? handleMouseDown : undefined}
        disabled={disabled || (!canAfford && !discardMode)}
        style={cardStyle}
        className={`
        ${cardSize} ${cardHeight}
        ${getCardColor()}
        nb-border-xl nb-shadow-xl
        transition-all duration-150
        ${disabled || (!canAfford && !discardMode)
          ? 'opacity-50 cursor-not-allowed'
          : isDragging
          ? 'cursor-grabbing'
          : 'cursor-grab'}
        ${glowing ? 'animate-pulse nb-shadow-colored-yellow' : ''}
        ${isHovering ? 'nb-shadow-colored-yellow' : ''}
        relative overflow-hidden
        flex flex-col
        group
      `}
      >
        {cardContent}
      </button>

      {/* Dragging clone - rendered as portal at document root */}
      {isDragging && createPortal(
        <div
          style={draggingCardStyle}
          className={`
            ${cardSize} ${cardHeight}
            ${getCardColor()}
            nb-border-xl ${isInPlayZone ? 'nb-shadow-colored-green border-8 border-green-400' : 'nb-shadow-xl'}
            ${isInPlayZone ? 'animate-pulse' : ''}
            relative overflow-hidden
            flex flex-col
            group
          `}
        >
          {cardContent}
          {/* Play zone indicator overlay */}
          {isInPlayZone && (
            <div className="absolute inset-0 bg-green-400 opacity-20 pointer-events-none"></div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
