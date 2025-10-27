import React from 'react';
import { Droplet, Flame, Wind, HeartCrack, AlertCircle } from 'lucide-react';

// Status effect display configuration
const STATUS_CONFIG = {
  poison: {
    name: 'Poison',
    icon: Droplet,
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    description: 'Taking damage each turn'
  },
  bleed: {
    name: 'Bleed',
    icon: HeartCrack,
    color: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    description: 'Losing HP each turn'
  },
  burn: {
    name: 'Burn',
    icon: Flame,
    color: 'bg-orange-600',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-600',
    description: 'Burning damage each turn'
  },
  dazed: {
    name: 'Dazed',
    icon: Wind,
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-600',
    description: 'Cards cost +2 energy'
  },
  weak: {
    name: 'Weak',
    icon: AlertCircle,
    color: 'bg-gray-600',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-600',
    description: 'Deal 25% less damage'
  }
};

export const StatusEffects = ({ statuses = [], isPlayer = true }) => {
  if (!statuses || statuses.length === 0) {
    return null;
  }

  return (
    <div className={`mt-4 ${isPlayer ? 'mb-2' : 'mb-4'}`}>
      <h4 className="text-sm font-bold mb-2 text-gray-700">
        {isPlayer ? '⚠️ Active Statuses:' : '💀 Enemy Statuses:'}
      </h4>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status, index) => {
          const config = STATUS_CONFIG[status.type];
          if (!config) return null;

          const Icon = config.icon;
          
          return (
            <div
              key={`${status.type}-${index}`}
              className={`
                ${config.color} text-white px-3 py-2 rounded-lg 
                flex items-center gap-2 text-sm font-semibold
                border-2 ${config.borderColor}
                shadow-lg
              `}
              title={config.description}
            >
              <Icon className="w-4 h-4" />
              <span>{config.name}</span>
              
              {/* Show damage/duration info */}
              {status.damage && (
                <span className="bg-black bg-opacity-30 px-2 py-0.5 rounded text-xs">
                  {status.damage} dmg
                </span>
              )}
              
              {status.duration && (
                <span className="bg-black bg-opacity-30 px-2 py-0.5 rounded text-xs">
                  {status.duration} turn{status.duration !== 1 ? 's' : ''}
                </span>
              )}
              
              {/* Show stacks for bleed */}
              {status.stacks && status.stacks > 1 && (
                <span className="bg-black bg-opacity-30 px-2 py-0.5 rounded text-xs font-bold">
                  x{status.stacks}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};