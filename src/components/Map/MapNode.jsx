import React, { useState } from 'react';
import { Swords, Shield, Crown, HelpCircle, Coins, Heart, Zap, Skull } from 'lucide-react';

export const MapNode = ({ node, floor, isSelected, isCompleted, isAvailable, onSelect }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'enemy': return <Swords className="w-6 h-6" />;
      case 'elite': return <Shield className="w-6 h-6" />;
      case 'boss': return <Crown className="w-6 h-6" />;
      case 'shop': return <Coins className="w-6 h-6" />;
      case 'joker': return <HelpCircle className="w-6 h-6" />;
      default: return <Swords className="w-6 h-6" />;
    }
  };

  const getNodeColor = () => {
    if (isCompleted) return 'bg-gray-400 border-gray-500 opacity-50';
    if (!isAvailable) return 'bg-gray-700 border-gray-800 opacity-40';
    if (isSelected) return 'bg-yellow-500 border-yellow-300 animate-pulse shadow-2xl';
    
    switch (node.type) {
      case 'enemy': return 'bg-red-600 border-red-400 hover:bg-red-700';
      case 'elite': return 'bg-orange-600 border-orange-400 hover:bg-orange-700';
      case 'boss': return 'bg-purple-700 border-purple-500 hover:bg-purple-800';
      case 'shop': return 'bg-green-600 border-green-400 hover:bg-green-700';
      case 'joker': return 'bg-blue-600 border-blue-400 hover:bg-blue-700';
      default: return 'bg-gray-600 border-gray-400';
    }
  };

  const getNodeLabel = () => {
    switch (node.type) {
      case 'enemy': return 'Battle';
      case 'elite': return 'Elite';
      case 'boss': return 'Boss';
      case 'shop': return 'Shop';
      case 'joker': return 'Mystery';
      default: return 'Node';
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
          w-20 h-20 rounded-full border-4 text-white
          flex flex-col items-center justify-center
          transition-all duration-300 transform
          ${canInteract ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
          relative
          shadow-lg
        `}
      >
        {/* Icon */}
        {getNodeIcon(node.type)}
        
        {/* Completed Checkmark */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <span className="text-2xl">✓</span>
          </div>
        )}

        {/* Selected Ring */}
        {isSelected && (
          <div className="absolute -inset-2 border-4 border-yellow-400 rounded-full animate-ping"></div>
        )}
      </button>

      {/* Node Label */}
      <div className="text-center mt-2">
        <span className="text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {getNodeLabel()}
        </span>
      </div>

      {/* Hover Preview - Enemy/Elite/Boss */}
      {showPreview && canInteract && (node.type === 'enemy' || node.type === 'elite' || node.type === 'boss') && node.enemyData && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-2xl border-2 border-yellow-400 min-w-[200px]">
            {/* Enemy Emoji */}
            <div className="text-4xl text-center mb-2">{node.enemyData.emoji}</div>
            
            {/* Enemy Name */}
            <div className="font-bold text-lg text-center mb-2">{node.enemyData.name}</div>
            
            {/* Enemy Stats */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  HP:
                </span>
                <span className="font-bold">{node.enemyData.health}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  Gold:
                </span>
                <span className="font-bold">{node.enemyData.goldReward[0]}-{node.enemyData.goldReward[1]}</span>
              </div>
            </div>

            {/* Elite/Boss Badge */}
            {node.enemyData.isElite && (
              <div className="mt-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded text-center">
                ⭐ ELITE
              </div>
            )}
            {node.enemyData.isBoss && (
              <div className="mt-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded text-center">
                👑 BOSS
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover Preview - Shop */}
      {showPreview && canInteract && node.type === 'shop' && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-2xl border-2 border-green-400 min-w-[180px]">
            <div className="text-2xl text-center mb-2">🛒</div>
            <div className="font-bold text-center mb-2">Mystical Shop</div>
            <div className="text-xs text-gray-300 text-center">
              Purchase upgrades, cards, and items
            </div>
          </div>
        </div>
      )}

      {/* Hover Preview - Mystery */}
      {showPreview && canInteract && node.type === 'joker' && (
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-2xl border-2 border-blue-400 min-w-[180px]">
            <div className="text-2xl text-center mb-2">❓</div>
            <div className="font-bold text-center mb-2">Mystery Node</div>
            <div className="text-xs text-gray-300 text-center">
              Something mysterious awaits...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};