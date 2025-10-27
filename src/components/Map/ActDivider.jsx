import React from 'react';
import { Crown, Flame, Mountain, Skull, Star } from 'lucide-react';

export const ActDivider = ({ actNumber }) => {
  const getActInfo = (act) => {
    switch (act) {
      case 1:
        return {
          name: 'The Beginning',
          icon: <Star className="w-8 h-8" />,
          color: 'from-blue-600 to-cyan-500',
          emoji: '🌅'
        };
      case 2:
        return {
          name: 'Rising Danger',
          icon: <Flame className="w-8 h-8" />,
          color: 'from-orange-600 to-red-500',
          emoji: '🔥'
        };
      case 3:
        return {
          name: 'The Ascent',
          icon: <Mountain className="w-8 h-8" />,
          color: 'from-green-600 to-teal-500',
          emoji: '⛰️'
        };
      case 4:
        return {
          name: 'Dark Depths',
          icon: <Skull className="w-8 h-8" />,
          color: 'from-purple-700 to-indigo-600',
          emoji: '💀'
        };
      case 5:
        return {
          name: 'Final Confrontation',
          icon: <Crown className="w-8 h-8" />,
          color: 'from-yellow-500 to-orange-600',
          emoji: '👑'
        };
      default:
        return {
          name: `Act ${act}`,
          icon: <Star className="w-8 h-8" />,
          color: 'from-gray-600 to-gray-500',
          emoji: '⭐'
        };
    }
  };

  const actInfo = getActInfo(actNumber);

  return (
    <div className="my-8 relative">
      {/* Divider Line */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-4 border-white opacity-30"></div>
      </div>

      {/* Act Badge */}
      <div className="relative flex justify-center">
        <div className={`
          bg-gradient-to-r ${actInfo.color}
          px-8 py-4 rounded-full
          border-4 border-white
          shadow-2xl
          transform hover:scale-105 transition-all duration-300
        `}>
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="text-white">
              {actInfo.icon}
            </div>

            {/* Text */}
            <div className="text-white">
              <div className="text-sm font-semibold opacity-90">ACT {actNumber}</div>
              <div className="text-xl font-bold">{actInfo.name}</div>
            </div>

            {/* Emoji */}
            <div className="text-3xl">
              {actInfo.emoji}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};