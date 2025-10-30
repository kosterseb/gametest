import React, { useState } from 'react';
import { STATUS_TYPES } from '../../data/statusEffects';
import { Info } from 'lucide-react';

export const StatusDisplay = ({ statuses, isPlayer = true, compact = false }) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  if (!statuses || statuses.length === 0) {
    return null;
  }

  // Sort statuses: debuffs first, then buffs, then DoTs
  const sortedStatuses = [...statuses].sort((a, b) => {
    const getCategory = (status) => {
      if (['vulnerable', 'weak', 'freeze', 'stun', 'slow', 'cursed', 'dazed', 'fragile'].includes(status.type)) return 0; // Debuffs
      if (['strength', 'shield', 'regeneration', 'thorns', 'dodge', 'focus'].includes(status.type)) return 1; // Buffs
      return 2; // DoTs
    };
    return getCategory(a) - getCategory(b);
  });

  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-2'} flex-wrap ${isPlayer ? 'justify-start' : 'justify-end'}`}>
      {sortedStatuses.map((status, index) => {
        const statusType = STATUS_TYPES[status.type?.toUpperCase()];
        
        if (!statusType) return null;

        const isHovered = hoveredStatus === index;

        return (
          <div
            key={`${status.type}-${index}`}
            className="relative"
            onMouseEnter={() => setHoveredStatus(index)}
            onMouseLeave={() => setHoveredStatus(null)}
          >
            {/* Status Badge */}
            <div
              className={`
                ${compact ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'}
                ${statusType.bgColor}
                rounded-lg
                flex flex-col items-center justify-center
                border-2 border-white
                shadow-lg
                transition-all duration-200
                ${isHovered ? 'scale-125 z-10' : 'scale-100'}
                cursor-help
                relative
                animate-fadeIn
              `}
            >
              {/* Emoji Icon */}
              <div className={`${compact ? 'text-lg' : 'text-2xl'} leading-none`}>
                {statusType.emoji}
              </div>
              
              {/* Stack Count */}
              {status.stacks > 1 && (
                <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-gray-300 shadow">
                  {status.stacks}
                </div>
              )}

              {/* Duration Indicator */}
              {status.duration !== null && status.duration !== undefined && (
                <div className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-white shadow">
                  {status.duration}
                </div>
              )}

              {/* Pulsing Animation for Important Statuses */}
              {['freeze', 'stun', 'vulnerable', 'marked'].includes(status.type) && (
                <div className={`absolute inset-0 ${statusType.bgColor} rounded-lg animate-ping opacity-75`}></div>
              )}
            </div>

            {/* Tooltip */}
            {isHovered && (
              <div
                className={`
                  absolute ${isPlayer ? 'left-0' : 'right-0'} top-full mt-2 z-50
                  bg-gray-900 text-white p-3 rounded-lg shadow-2xl
                  min-w-[190px] max-w-[238px]
                  border-2 ${statusType.borderColor}
                  animate-fadeIn
                `}
                style={{
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                  <span className="text-2xl">{statusType.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{statusType.name}</div>
                    {status.stacks > 1 && (
                      <div className="text-xs text-gray-400">Stacks: {status.stacks}</div>
                    )}
                    {status.duration !== null && status.duration !== undefined && (
                      <div className="text-xs text-gray-400">
                        Duration: {status.duration} {status.duration === 1 ? 'turn' : 'turns'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-2">
                  {statusType.description}
                </p>

                {/* Detailed Effects */}
                <div className="text-xs text-gray-400 space-y-1">
                  {statusType.damagePerTurn && (
                    <div>💥 {statusType.damagePerTurn(status.stacks)} damage/turn</div>
                  )}
                  {statusType.healPerTurn && (
                    <div>💚 {statusType.healPerTurn(status.stacks)} healing/turn</div>
                  )}
                  {statusType.damageBoost && (
                    <div>⚔️ +{statusType.damageBoost(status.stacks)} damage</div>
                  )}
                  {statusType.blockAmount && (
                    <div>🛡️ Blocks {statusType.blockAmount(status.stacks)} damage</div>
                  )}
                  {statusType.reflectDamage && (
                    <div>🌹 Reflects {statusType.reflectDamage(status.stacks)} damage</div>
                  )}
                  {statusType.damageMultiplier && statusType.damageMultiplier !== 1 && (
                    <div>
                      {statusType.damageMultiplier > 1 ? '📈' : '📉'} 
                      {' '}{Math.round((statusType.damageMultiplier - 1) * 100)}% damage modifier
                    </div>
                  )}
                  {statusType.energyDrain && (
                    <div>⚡ -{statusType.energyDrain * status.stacks} energy/turn</div>
                  )}
                  {statusType.energyCostIncrease && (
                    <div>💰 Cards cost +{statusType.energyCostIncrease * status.stacks} energy</div>
                  )}
                  {statusType.energyCostReduction && (
                    <div>✨ Cards cost -{statusType.energyCostReduction * status.stacks} energy</div>
                  )}
                </div>

                {/* Special Indicators */}
                {statusType.consumeOnHit && (
                  <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Consumed on hit
                  </div>
                )}
                {statusType.skipTurn && (
                  <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Cannot act while active
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Compact version for card previews
export const StatusIcon = ({ statusType, stacks = 1 }) => {
  const status = STATUS_TYPES[statusType?.toUpperCase()];
  
  if (!status) return null;

  return (
    <div className={`
      ${status.bgColor}
      rounded-full w-6 h-6
      flex items-center justify-center
      text-xs
      border border-white
      shadow
    `}>
      {status.emoji}
      {stacks > 1 && (
        <span className="absolute -bottom-1 -right-1 bg-white text-black rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold">
          {stacks}
        </span>
      )}
    </div>
  );
};

// Status bar for showing multiple statuses in a line
export const StatusBar = ({ statuses, isPlayer = true, showLabel = true }) => {
  if (!statuses || statuses.length === 0) {
    return showLabel ? (
      <div className="text-sm text-gray-500 italic">No status effects</div>
    ) : null;
  }

  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-lg p-2">
      {showLabel && (
        <div className="text-xs text-gray-400 mb-1 font-semibold">
          Status Effects ({statuses.length})
        </div>
      )}
      <StatusDisplay statuses={statuses} isPlayer={isPlayer} compact={false} />
    </div>
  );
};