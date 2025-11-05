import React from 'react';
import { Coins, Map, Clock, ArrowLeft, Menu } from 'lucide-react';
import { NBButton, NBBadge } from '../UI/NeoBrutalUI';

export const GameHeader = ({
  battleNumber,
  gold,
  turnCount,
  onForfeit,
  onMenuClick
}) => {
  return (
    <div className="flex justify-between items-center w-full">
      {/* Forfeit Button */}
      {onForfeit && (
        <NBButton
          onClick={onForfeit}
          variant="danger"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Forfeit</span>
        </NBButton>
      )}

      {/* Stat Trackers */}
      <div className="flex gap-3 items-center ml-auto">
        {/* Floor Number */}
        <div className="nb-bg-purple nb-border-lg nb-shadow px-4 py-2 flex items-center gap-2">
          <Map className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase leading-tight tracking-wide">Floor</span>
            <span className="text-2xl font-black leading-tight">{battleNumber}</span>
          </div>
        </div>

        {/* Turn Count */}
        <div className="nb-bg-cyan nb-border-lg nb-shadow px-4 py-2 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase leading-tight tracking-wide">Turn</span>
            <span className="text-2xl font-black leading-tight">{turnCount}</span>
          </div>
        </div>

        {/* Gold */}
        <div className="nb-bg-yellow nb-border-lg nb-shadow px-4 py-2 flex items-center gap-2">
          <Coins className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase leading-tight tracking-wide">Gold</span>
            <span className="text-2xl font-black leading-tight">{gold}</span>
          </div>
        </div>

        {/* Menu Button */}
        {onMenuClick && (
          <NBButton
            onClick={onMenuClick}
            variant="white"
            size="sm"
            className="flex items-center gap-2"
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </NBButton>
        )}
      </div>
    </div>
  );
};
