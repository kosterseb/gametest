import React from 'react';
import { StatusEffects } from './StatusEffects';

export const EnemyDisplay = ({ enemy, health, maxHealth, isEnemyTurn, statuses = [] }) => {
  const getEnemyEmoji = (name) => {
    switch (name) {
      case "Grumpy Barista": return "☕";
      case "Corporate Demon": return "💼";
      case "WiFi Spirit": return "📶";
      default: return "👾";
    }
  };

  return (
    <div className="bg-white bg-opacity-90 p-6 rounded-xl text-center">
      <div className={`text-6xl mb-4 transition-transform duration-300 ${isEnemyTurn ? 'scale-110' : 'scale-100'}`}>
        {getEnemyEmoji(enemy.name)}
      </div>
      <h2 className="text-xl font-bold mb-2">{enemy.name}</h2>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="bg-red-500 h-4 rounded-full transition-all duration-500" 
          style={{ width: `${(health / maxHealth) * 100}%` }}
        ></div>
      </div>
      
      {/* Status Effects Display */}
      <StatusEffects statuses={statuses} isPlayer={false} />
      
      <div className="text-sm text-gray-600 mt-4">
        Next ability chances:
        <div className="mt-1 text-xs">
          {enemy.abilities.map((ability, index) => (
            <div key={index} className="flex justify-between">
              <span>{ability.name}</span>
              <span>{ability.chance}%</span>
            </div>
          ))}
        </div>
      </div>
      {isEnemyTurn && (
        <div className="mt-4 text-orange-600 font-bold animate-pulse">
          Enemy's Turn...
        </div>
      )}
    </div>
  );
};