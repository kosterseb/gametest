import React from 'react';
import { Zap } from 'lucide-react';
import { CharacterDisplay } from './CharacterDisplay';
import { StatusDisplay } from '../Battle/StatusDisplay';

export const PlayerStats = ({ health, energy, maxHealth = 100, statuses = [] }) => {
  return (
    <div className="bg-white bg-opacity-90 p-6 rounded-xl text-center">
      <CharacterDisplay health={health} maxHealth={maxHealth} />
      <h2 className="text-xl font-bold mb-2 mt-4">Coffee Wizard</h2>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="bg-green-500 h-4 rounded-full transition-all duration-500" 
          style={{ width: `${(health / maxHealth) * 100}%` }}
        ></div>
      </div>
      <div className="text-lg font-semibold">{health}/{maxHealth} HP</div>
      <div className="flex items-center justify-center mt-2">
        <Zap className="w-4 h-4 text-blue-500 mr-1" />
        <span className="text-sm font-medium">{energy} Energy</span>
      </div>

      {/* Status Effects Display */}
      <StatusDisplay statuses={statuses} isPlayer={true} compact={false} />
    </div>
  );
};