import React from 'react';

export const CharacterDisplay = ({ health = 100, maxHealth = 100 }) => {
  const healthPercent = (health / maxHealth) * 100;
  
  return (
    <div 
      className="flex items-center justify-center rounded-xl"
      style={{ 
        width: '100%', 
        height: '280px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="text-center">
        <div className="text-8xl mb-4">☕</div>
        <div className="text-white text-xl font-bold">Coffee Wizard</div>
        <div className="text-white text-sm opacity-75 mt-2">
          {healthPercent > 60 ? 'Ready to brew!' : healthPercent > 30 ? 'Needs a refill...' : 'Running on empty!'}
        </div>
      </div>
    </div>
  );
};