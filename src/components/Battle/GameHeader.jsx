import React from 'react';
import { Coins, Map, Clock, ArrowLeft } from 'lucide-react';

export const GameHeader = ({
  battleNumber,
  gold,
  turnCount,
  onForfeit
}) => {
  return (
    <div className="flex justify-between items-center w-full">
      {/* Forfeit Button */}
      {onForfeit && (
        <button
          onClick={onForfeit}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all shadow-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Forfeit
        </button>
      )}

      {/* Stat Trackers */}
      <div className="flex gap-4 items-center ml-auto">
        {/* Floor Number */}
        <div className="flex items-center space-x-2 bg-purple-100 px-4 py-1.5 rounded-lg">
          <Map className="w-5 h-5 text-purple-600" />
          <div className="flex flex-col">
            <span className="text-xs text-purple-600 font-semibold leading-tight">FLOOR</span>
            <span className="text-lg font-bold text-purple-700 leading-tight">{battleNumber}</span>
          </div>
        </div>

        {/* Turn Count */}
        <div className="flex items-center space-x-2 bg-blue-100 px-4 py-1.5 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xs text-blue-600 font-semibold leading-tight">TURN</span>
            <span className="text-lg font-bold text-blue-700 leading-tight">{turnCount}</span>
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-1.5 rounded-lg">
          <Coins className="w-5 h-5 text-yellow-600" />
          <div className="flex flex-col">
            <span className="text-xs text-yellow-600 font-semibold leading-tight">GOLD</span>
            <span className="text-lg font-bold text-yellow-700 leading-tight">{gold}</span>
          </div>
        </div>
      </div>
    </div>
  );
};