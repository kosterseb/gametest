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
  const canAfford = playerEnergy >= modifiedCost;
  const rarityConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

  // 3D tilt effect states
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInPlayZone, setIsInPlayZone] = useState(false);
  const cardRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Handle 3D tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (disabled || (!canAfford && !discardMode) || isDragging) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10; // Tilt based on vertical position
    const rotateY = (centerX - x) / 10; // Tilt based on horizontal position

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

    e.preventDefault(); // Prevent text selection and default drag

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

      // Check if in play zone (upper 60% of screen)
      const inPlayZone = e.clientY < window.innerHeight * 0.6;
      setIsInPlayZone(inPlayZone);
    };

    const handleMouseUpGlobal = (e) => {
      setIsDragging(false);
      setIsInPlayZone(false);

      // Check if dropped in valid area (upper 60% of screen)
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

  const getCardColor = () => {
    switch (card.type) {
      case 'damage': return 'from-red-500 to-red-700';
      case 'heal': return 'from-green-500 to-green-700';
      case 'utility': return 'from-blue-500 to-blue-700';
      case 'cleanse': return 'from-purple-500 to-purple-700';
      case 'status': return 'from-amber-500 to-amber-700';
      default: return 'from-gray-500 to-gray-700';
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
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-20px) scale(1.05)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    transformStyle: 'preserve-3d',
    opacity: isDragging ? 0.3 : 1, // Make original card semi-transparent when dragging
    userSelect: 'none', // Prevent text selection
    WebkitUserSelect: 'none', // Safari
  };

  const draggingCardStyle = {
    position: 'fixed',
    left: `${dragPosition.x}px`,
    top: `${dragPosition.y}px`,
    transform: 'scale(1.1) rotate(-5deg)',
    transformStyle: 'preserve-3d',
    zIndex: 9999,
    pointerEvents: 'none',
    cursor: 'grabbing',
    filter: isInPlayZone ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8)) brightness(1.2)' : 'none',
    transition: 'filter 0.2s ease-out',
  };

  const cardContent = (
    <>
      {/* Rarity Glow Effect */}
      <div className={`absolute inset-0 ${rarityConfig.glowColor} opacity-0 group-hover:opacity-20 transition-opacity`}></div>

      {/* Shine effect for 3D feel */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{
          transform: `translateX(${tilt.y * 2}px) translateY(${tilt.x * 2}px)`
        }}
      ></div>

      {/* Header - Type Badge */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-black bg-opacity-70 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          {getTypeIcon()}
          <span className="text-white text-xs font-bold uppercase tracking-wide">{card.type}</span>
        </div>
      </div>

      {/* Energy Cost - Top Right */}
      {showCost && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`
            flex items-center justify-center
            w-10 h-10 rounded-full
            ${canAfford || discardMode ? 'bg-blue-500' : 'bg-red-500'}
            shadow-lg border-2 border-white
          `}>
            <span className="text-white font-bold text-lg">
              {modifiedCost}
            </span>
          </div>
        </div>
      )}

      {/* Card Icon - Center */}
      <div className="flex-1 flex items-center justify-center pt-10 pb-3">
        <CardIcon
          cardName={card.name}
          cardType={card.type}
          size={compact ? 64 : 80}
          showGlow={!disabled && canAfford}
        />
      </div>

      {/* Card Name */}
      <div className="px-4 pb-2">
        <h3 className={`text-white font-bold text-center ${compact ? 'text-base' : 'text-lg'} leading-tight drop-shadow-lg`}>
          {card.name}
        </h3>
      </div>

      {/* Card Description */}
      <div className="px-4 pb-3">
        <p className={`text-white text-center ${compact ? 'text-xs' : 'text-sm'} opacity-90 leading-snug line-clamp-2`}>
          {card.description}
        </p>
      </div>

      {/* Bottom Bar - Stats and Rarity */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm p-2.5 mt-auto">
        {/* Stats Display */}
        <div className="flex justify-center gap-2 mb-2">
          {card.baseDamage && (
            <div className="bg-red-600 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sword className="w-3 h-3 text-white" />
              <span className="text-white font-bold text-sm">{card.baseDamage}</span>
            </div>
          )}
          {card.baseHeal && (
            <div className="bg-green-600 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Heart className="w-3 h-3 text-white" />
              <span className="text-white font-bold text-sm">+{card.baseHeal}</span>
            </div>
          )}
          {card.diceRoll && (
            <div className="bg-yellow-500 px-3 py-1 rounded-full shadow-md">
              <span className="text-black font-bold text-sm">🎲</span>
            </div>
          )}
        </div>

        {/* Rarity Badge */}
        <div className="flex justify-center">
          <div className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 px-3 py-1 rounded-full shadow-md`}>
            <span className={`${rarityConfig.color} text-xs font-bold uppercase tracking-wider`}>{rarityConfig.name}</span>
          </div>
        </div>
      </div>

      {/* Discard Mode Overlay */}
      {discardMode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white font-bold text-lg drop-shadow-lg">
            DISCARD FOR 1 ⚡
          </div>
        </div>
      )}

      {/* Cannot Afford Overlay */}
      {!canAfford && !discardMode && !disabled && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-red-400 font-bold text-sm drop-shadow-lg">
            NOT ENOUGH ENERGY
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
        bg-gradient-to-br ${getCardColor()}
        rounded-2xl
        border-4 ${rarityConfig.borderColor}
        transition-all duration-200
        ${disabled || (!canAfford && !discardMode)
          ? 'opacity-50 cursor-not-allowed'
          : isDragging
          ? 'cursor-grabbing shadow-2xl'
          : 'cursor-grab shadow-xl'}
        ${glowing ? 'animate-pulse ring-4 ring-yellow-400' : ''}
        ${isHovering ? 'shadow-2xl ring-2 ring-white ring-opacity-50' : ''}
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
            bg-gradient-to-br ${getCardColor()}
            rounded-2xl
            border-4 ${isInPlayZone ? 'border-green-400 animate-pulse' : rarityConfig.borderColor}
            ${isInPlayZone ? 'ring-4 ring-green-400 ring-opacity-75' : ''}
            shadow-2xl
            relative overflow-hidden
            flex flex-col
            group
          `}
        >
          {cardContent}
          {/* Play zone indicator overlay */}
          {isInPlayZone && (
            <div className="absolute inset-0 bg-green-500 opacity-10 pointer-events-none animate-pulse"></div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

// Compact version for rewards/shop/deck
export const CardCompact = ({ card, onClick, disabled = false, owned = false }) => {
  const rarityConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

  const getCardGradient = (type) => {
    switch (type) {
      case 'damage': return 'from-red-500 to-red-700';
      case 'heal': return 'from-green-500 to-green-700';
      case 'utility': return 'from-blue-500 to-blue-700';
      case 'cleanse': return 'from-purple-500 to-purple-700';
      case 'status': return 'from-amber-500 to-amber-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || owned}
      className={`
        relative w-48 h-64
        bg-gradient-to-br ${getCardGradient(card.type)}
        rounded-xl border-4 ${rarityConfig.borderColor}
        shadow-2xl
        ${disabled || owned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:-translate-y-2'}
        transition-all duration-300
        overflow-hidden
        p-4
        flex flex-col
      `}
    >
      {/* Owned Badge */}
      {owned && (
        <div className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
          OWNED
        </div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-4 mt-2">
        <CardIcon
          cardName={card.name}
          cardType={card.type}
          size={64}
          showGlow={!disabled && !owned}
        />
      </div>

      {/* Name */}
      <h3 className="text-white font-bold text-lg text-center mb-2 drop-shadow-lg">
        {card.name}
      </h3>

      {/* Description */}
      <p className="text-white text-sm text-center opacity-90 mb-auto">
        {card.description}
      </p>

      {/* Stats & Rarity - Bottom */}
      <div className="mt-auto">
        <div className="flex justify-center gap-3 mb-2">
          <div className="bg-blue-500 px-3 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white font-bold">{card.energyCost}</span>
          </div>
          {card.baseDamage && (
            <div className="bg-red-600 px-3 py-1 rounded-full">
              <span className="text-white font-bold">{card.baseDamage}</span>
            </div>
          )}
          {card.baseHeal && (
            <div className="bg-green-600 px-3 py-1 rounded-full">
              <span className="text-white font-bold">+{card.baseHeal}</span>
            </div>
          )}
        </div>
        
        {/* Rarity Badge at Bottom */}
        <div className="flex justify-center">
          <div className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 px-3 py-1 rounded-full`}>
            <span className={`${rarityConfig.color} text-xs font-bold`}>{rarityConfig.name}</span>
          </div>
        </div>
      </div>
    </button>
  );
};