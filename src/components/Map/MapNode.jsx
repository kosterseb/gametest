import React, { useState } from 'react';
import { Swords, Shield, Crown, HelpCircle, Coins, Heart, Zap, Skull, ShoppingCart } from 'lucide-react';
import { NBBadge } from '../UI/NeoBrutalUI';

export const MapNode = ({ node, floor, isSelected, isCompleted, isAvailable, onSelect }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'enemy': return <Swords className="w-8 h-8" />;
      case 'elite': return <Shield className="w-8 h-8" />;
      case 'boss': return <Crown className="w-8 h-8" />;
      case 'shop': return <ShoppingCart className="w-8 h-8" />;
      case 'joker': return <HelpCircle className="w-8 h-8" />;
      default: return <Swords className="w-8 h-8" />;
    }
  };

  const getNodeColor = () => {
    if (isCompleted) return 'bg-gray-400';
    if (!isAvailable) return 'bg-gray-600';
    if (isSelected) return 'nb-bg-yellow';

    switch (node.type) {
      case 'enemy': return 'nb-bg-red';
      case 'elite': return 'nb-bg-orange';
      case 'boss': return 'nb-bg-purple';
      case 'shop': return 'nb-bg-green';
      case 'joker': return 'nb-bg-cyan';
      default: return 'bg-gray-600';
    }
  };

  const getNodeLabel = () => {
    switch (node.type) {
      case 'enemy': return 'BATTLE';
      case 'elite': return 'ELITE';
      case 'boss': return 'BOSS';
      case 'shop': return 'SHOP';
      case 'joker': return 'MYSTERY';
      default: return 'NODE';
    }
  };

  const canInteract = isAvailable && !isCompleted;

  return (
    <div className="relative group">
      {/* Node Button */}
      <button
        onClick={() => canInteract && onSelect(node)}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        disabled={!canInteract}
        className={`
          ${getNodeColor()}
          nb-border-xl nb-shadow-lg
          w-24 h-24
          flex flex-col items-center justify-center gap-1
          transition-all
          ${canInteract ? 'nb-hover cursor-pointer' : 'cursor-not-allowed opacity-50'}
          ${isSelected ? 'nb-shadow-colored-yellow animate-pulse' : ''}
          relative
        `}
      >
        {/* Icon */}
        <div className="text-black">
          {getNodeIcon(node.type)}
        </div>

        {/* Label */}
        <span className="text-xs font-black text-black uppercase tracking-tight">
          {getNodeLabel()}
        </span>

        {/* Completed Checkmark */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <NBBadge color="green" className="px-3 py-1">
              ✓
            </NBBadge>
          </div>
        )}
      </button>

      {/* Hover Preview - Enemy/Elite/Boss */}
      {showPreview && canInteract && (node.type === 'enemy' || node.type === 'elite' || node.type === 'boss') && node.enemyData && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-4 min-w-[220px]">
            {/* Enemy Emoji */}
            <div className="text-5xl text-center mb-3">{node.enemyData.emoji}</div>

            {/* Enemy Name */}
            <div className="font-black text-lg text-center mb-3 text-black uppercase">{node.enemyData.name}</div>

            {/* Enemy Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between nb-bg-red nb-border nb-shadow px-3 py-2">
                <span className="flex items-center gap-1 font-bold text-black">
                  <Heart className="w-4 h-4" />
                  HP:
                </span>
                <span className="font-black text-black">{node.enemyData.health}</span>
              </div>

              <div className="flex items-center justify-between nb-bg-yellow nb-border nb-shadow px-3 py-2">
                <span className="flex items-center gap-1 font-bold text-black">
                  <Coins className="w-4 h-4" />
                  Gold:
                </span>
                <span className="font-black text-black">{node.enemyData.goldReward[0]}-{node.enemyData.goldReward[1]}</span>
              </div>
            </div>

            {/* Elite/Boss Badge */}
            {node.enemyData.isElite && (
              <div className="mt-3">
                <NBBadge color="orange" className="w-full text-center px-2 py-1">
                  ELITE
                </NBBadge>
              </div>
            )}
            {node.enemyData.isBoss && (
              <div className="mt-3">
                <NBBadge color="purple" className="w-full text-center px-2 py-1">
                  BOSS
                </NBBadge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover Preview - Shop */}
      {showPreview && canInteract && node.type === 'shop' && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-4 min-w-[200px]">
            <div className="nb-bg-green nb-border-lg nb-shadow p-3 mb-3">
              <ShoppingCart className="w-10 h-10 text-black mx-auto" />
            </div>
            <div className="font-black text-center mb-2 text-black uppercase">Mystical Shop</div>
            <div className="text-xs text-gray-700 text-center font-bold">
              Purchase upgrades, cards, and items
            </div>
          </div>
        </div>
      )}

      {/* Hover Preview - Mystery */}
      {showPreview && canInteract && node.type === 'joker' && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-4 min-w-[200px]">
            <div className="nb-bg-cyan nb-border-lg nb-shadow p-3 mb-3">
              <HelpCircle className="w-10 h-10 text-black mx-auto" />
            </div>
            <div className="font-black text-center mb-2 text-black uppercase">Mystery Node</div>
            <div className="text-xs text-gray-700 text-center font-bold">
              Something mysterious awaits...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};