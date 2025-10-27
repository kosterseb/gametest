import React from 'react';
import { getCardIcon, getCardTypeColor } from '../../assets/CardIcons/svgIcons';

export const CardIcon = ({ 
  cardName, 
  cardType = 'damage',
  size = 48, 
  color = null,
  className = '',
  showGlow = false 
}) => {
  const IconComponent = getCardIcon(cardName);
  const typeColors = getCardTypeColor(cardType);
  const iconColor = color || typeColors.primary;

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        position: 'relative'
      }}
    >
      {/* Glow effect */}
      {showGlow && (
        <div 
          className="absolute inset-0 blur-md opacity-50"
          style={{
            filter: 'blur(8px)',
          }}
        >
          <IconComponent
            style={{
              width: '100%',
              height: '100%',
              fill: iconColor,
              stroke: iconColor,
            }}
          />
        </div>
      )}
      
      {/* Main icon */}
      <IconComponent
        className="relative z-10"
        style={{
          width: size,
          height: size,
          fill: iconColor,
          stroke: '#ffffff',
          strokeWidth: 0.5,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      />
    </div>
  );
};

// Animated version with pulse
export const AnimatedCardIcon = ({ 
  cardName, 
  cardType = 'damage',
  size = 48,
  className = '' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <CardIcon 
        cardName={cardName} 
        cardType={cardType} 
        size={size} 
        showGlow={true}
      />
    </div>
  );
};

// Icon with background
export const CardIconWithBg = ({ 
  cardName, 
  cardType = 'damage',
  size = 64,
  className = '' 
}) => {
  const typeColors = getCardTypeColor(cardType);
  
  return (
    <div 
      className={`rounded-full p-3 bg-gradient-to-br ${typeColors.gradient} shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CardIcon 
        cardName={cardName} 
        cardType={cardType} 
        size={size * 0.6}
        color="#ffffff"
      />
    </div>
  );
};