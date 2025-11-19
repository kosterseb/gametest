import React from 'react';

/**
 * NotificationIndicator Component
 *
 * A pulsing notification dot that appears when there are new items/cards/talents
 * Can be positioned as a badge on buttons or tabs
 */
export const NotificationIndicator = ({
  show = false,
  size = 'sm', // 'sm', 'md', 'lg'
  position = 'top-right', // 'top-right', 'top-left', 'inline'
  className = ''
}) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const positionClasses = {
    'top-right': 'absolute -top-1 -right-1',
    'top-left': 'absolute -top-1 -left-1',
    'inline': 'inline-block'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${positionClasses[position]}
        ${className}
        rounded-full
        bg-gradient-to-br from-red-500 to-pink-600
        border-2 border-white
        shadow-lg
        animate-pulse
        z-10
      `}
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    >
      {/* Inner glow effect */}
      <div
        className="absolute inset-0 rounded-full bg-red-400 opacity-75 blur-sm"
        style={{
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
        }}
      />
    </div>
  );
};

/**
 * NotificationBadge Component
 *
 * A notification badge that shows a count
 * Useful for showing number of new items
 */
export const NotificationBadge = ({
  count = 0,
  maxCount = 9,
  show = true,
  position = 'top-right',
  className = ''
}) => {
  if (!show || count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  const positionClasses = {
    'top-right': 'absolute -top-2 -right-2',
    'top-left': 'absolute -top-2 -left-2',
    'inline': 'inline-block'
  };

  return (
    <div
      className={`
        ${positionClasses[position]}
        ${className}
        min-w-[20px] h-5
        px-1.5
        flex items-center justify-center
        rounded-full
        bg-gradient-to-br from-red-500 to-pink-600
        border-2 border-white
        shadow-lg
        z-10
        animate-pulse
      `}
    >
      <span className="text-[10px] font-black text-white leading-none">
        {displayCount}
      </span>
    </div>
  );
};

export default NotificationIndicator;
