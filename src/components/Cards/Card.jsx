import React from 'react';
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
  glowing = false
}) => {
  const modifiedCost = getModifiedCardCost(card.energyCost, playerStatuses);
  const canAfford = playerEnergy >= modifiedCost;
  const rarityConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

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

  const cardSize = compact ? 'w-32' : 'w-40';
  const cardHeight = compact ? 'h-44' : 'h-56';

  return (
    <button
      onClick={onClick}
      disabled={disabled || (!canAfford && !discardMode)}
      className={`
        ${cardSize} ${cardHeight}
        bg-gradient-to-br ${getCardColor()}
        rounded-xl
        border-4 ${rarityConfig.borderColor}
        shadow-2xl
        transition-all duration-300
        ${disabled || (!canAfford && !discardMode)
          ? 'opacity-50 cursor-not-allowed scale-95'
          : 'hover:scale-105 hover:-translate-y-2 cursor-pointer'}
        ${glowing ? 'animate-pulse ring-4 ring-yellow-400' : ''}
        relative overflow-hidden
        flex flex-col
        group
      `}
    >
      {/* Rarity Glow Effect */}
      <div className={`absolute inset-0 ${rarityConfig.glowColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

      {/* Header - Type Badge Only */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-black bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          {getTypeIcon()}
          <span className="text-white text-xs font-bold uppercase">{card.type}</span>
        </div>
      </div>

      {/* Card Icon - Center */}
      <div className="flex-1 flex items-center justify-center pt-8 pb-2">
        <CardIcon
          cardName={card.name}
          cardType={card.type}
          size={compact ? 56 : 72}
          showGlow={!disabled && canAfford}
        />
      </div>

      {/* Card Name */}
      <div className="px-3 pb-2">
        <h3 className={`text-white font-bold text-center ${compact ? 'text-sm' : 'text-base'} leading-tight drop-shadow-lg`}>
          {card.name}
        </h3>
      </div>

      {/* Card Description */}
      <div className="px-3 pb-3">
        <p className={`text-white text-center ${compact ? 'text-xs' : 'text-sm'} opacity-90 leading-snug`}>
          {card.description}
        </p>
      </div>

      {/* Bottom Bar - Energy Cost, Stats, and Rarity */}
      <div className="bg-black bg-opacity-40 backdrop-blur-sm p-2 mt-auto">
        <div className="flex justify-between items-center mb-1">
          {/* Energy Cost */}
          {showCost && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-full
              ${canAfford || discardMode ? 'bg-blue-500' : 'bg-red-500'}
            `}>
              <Zap className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">
                {modifiedCost}
              </span>
            </div>
          )}

          {/* Stats Display */}
          <div className="flex gap-2">
            {card.baseDamage && (
              <div className="bg-red-600 px-2 py-1 rounded-full">
                <span className="text-white font-bold text-xs">{card.baseDamage}</span>
              </div>
            )}
            {card.baseHeal && (
              <div className="bg-green-600 px-2 py-1 rounded-full">
                <span className="text-white font-bold text-xs">+{card.baseHeal}</span>
              </div>
            )}
          </div>

          {/* Dice Roll Indicator */}
          {card.diceRoll && (
            <div className="bg-yellow-500 px-2 py-1 rounded-full">
              <span className="text-black font-bold text-xs">🎲</span>
            </div>
          )}
        </div>
        
        {/* Rarity Badge - MOVED TO BOTTOM */}
        <div className="flex justify-center">
          <div className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 px-3 py-0.5 rounded-full`}>
            <span className={`${rarityConfig.color} text-xs font-bold`}>{rarityConfig.name}</span>
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
    </button>
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