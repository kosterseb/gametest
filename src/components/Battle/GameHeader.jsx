import React from 'react';
import { Coins, Map, Clock } from 'lucide-react';

export const GameHeader = ({ 
  battleNumber, 
  gold,
  turnCount
}) => {
  return (
    <div className="bg-white bg-opacity-90 p-4 rounded-xl mb-4 shadow-lg">
      <div className="flex justify-between items-center">
        {/* Floor Number */}
        <div className="flex items-center space-x-3 bg-purple-100 px-6 py-2 rounded-lg">
          <Map className="w-6 h-6 text-purple-600" />
          <div className="flex flex-col">
            <span className="text-xs text-purple-600 font-semibold">FLOOR</span>
            <span className="text-2xl font-bold text-purple-700">{battleNumber}</span>
          </div>
        </div>

        {/* Turn Count */}
        <div className="flex items-center space-x-3 bg-blue-100 px-6 py-2 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xs text-blue-600 font-semibold">TURN</span>
            <span className="text-2xl font-bold text-blue-700">{turnCount}</span>
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center space-x-3 bg-yellow-100 px-6 py-2 rounded-lg">
          <Coins className="w-6 h-6 text-yellow-600" />
          <div className="flex flex-col">
            <span className="text-xs text-yellow-600 font-semibold">GOLD</span>
            <span className="text-2xl font-bold text-yellow-700">{gold}</span>
          </div>
        </div>
      </div>
    </div>
  );
};