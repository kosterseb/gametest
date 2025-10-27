import React from 'react';
import { Sparkles } from 'lucide-react';

export const ItemButton = ({ item, onUse, disabled, isUsed }) => {
  if (!item) return null;

  return (
    <button
      onClick={() => !disabled && !isUsed && onUse(item)}
      disabled={disabled || isUsed}
      className={`
        ${isUsed ? 'bg-gray-400 border-gray-500' : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600 hover:scale-105'}
        ${disabled && !isUsed ? 'opacity-50 cursor-not-allowed' : ''}
        ${!disabled && !isUsed ? 'cursor-pointer hover:shadow-xl' : ''}
        text-white p-3 rounded-lg border-2
        transition-all duration-200 transform
        relative min-w-[120px]
      `}
    >
      {/* Item Emoji */}
      <div className="flex items-center justify-center mb-1">
        <span className="text-3xl">{item.emoji}</span>
      </div>

      {/* Item Name */}
      <div className="text-xs font-bold text-center mb-1">
        {item.name}
      </div>

      {/* Description */}
      <div className="text-xs opacity-90 text-center">
        {item.description}
      </div>

      {/* Used Badge */}
      {isUsed && (
        <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
          USED
        </div>
      )}

      {/* Sparkle Effect */}
      {!isUsed && !disabled && (
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        </div>
      )}
    </button>
  );
};