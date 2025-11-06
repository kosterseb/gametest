import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { NBBadge } from '../UI/NeoBrutalUI';

export const BattleTimer = ({ playerTime, enemyTime, isEnemyTurn, playerName = 'You', enemyName = 'Enemy' }) => {
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if time is running low (< 30 seconds)
  const isLowTime = (time) => time < 30;

  // Determine if time is critical (< 10 seconds)
  const isCriticalTime = (time) => time < 10;

  const getTimeColor = (time) => {
    if (isCriticalTime(time)) return 'red';
    if (isLowTime(time)) return 'orange';
    return 'cyan';
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-4 -mt-24">
      {/* Character Names with Timers */}
      <div className="flex items-center justify-center gap-12 w-full">
        {/* Player Time */}
        <div className={`
          flex flex-col items-center
          ${!isEnemyTurn ? 'scale-110' : 'scale-100 opacity-70'}
          transition-all duration-300
        `}>
          <div className="text-xs font-black uppercase text-white mb-1">
            {playerName}
          </div>
          <NBBadge
            color={getTimeColor(playerTime)}
            className={`
              px-4 py-2 flex items-center gap-2
              ${!isEnemyTurn && isLowTime(playerTime) ? 'animate-pulse' : ''}
            `}
          >
            <Clock className={`w-4 h-4 ${!isEnemyTurn ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            <span className="text-lg font-black">
              {formatTime(playerTime)}
            </span>
            {!isEnemyTurn && isCriticalTime(playerTime) && (
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            )}
          </NBBadge>
        </div>

        {/* VS Separator */}
        <div className="text-white font-black text-xl">VS</div>

        {/* Enemy Time */}
        <div className={`
          flex flex-col items-center
          ${isEnemyTurn ? 'scale-110' : 'scale-100 opacity-70'}
          transition-all duration-300
        `}>
          <div className="text-xs font-black uppercase text-white mb-1">
            {enemyName}
          </div>
          <NBBadge
            color={getTimeColor(enemyTime)}
            className={`
              px-4 py-2 flex items-center gap-2
              ${isEnemyTurn && isLowTime(enemyTime) ? 'animate-pulse' : ''}
            `}
          >
            <Clock className={`w-4 h-4 ${isEnemyTurn ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            <span className="text-lg font-black">
              {formatTime(enemyTime)}
            </span>
            {isEnemyTurn && isCriticalTime(enemyTime) && (
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            )}
          </NBBadge>
        </div>
      </div>

      {/* Low Time Warning */}
      {((isEnemyTurn && isLowTime(enemyTime)) || (!isEnemyTurn && isLowTime(playerTime))) && (
        <div className={`
          nb-bg-${isCriticalTime(isEnemyTurn ? enemyTime : playerTime) ? 'red' : 'orange'}
          nb-border nb-shadow
          px-3 py-1
          animate-pulse
        `}>
          <span className="text-black font-black text-xs uppercase">
            ⏰ {isCriticalTime(isEnemyTurn ? enemyTime : playerTime) ? 'CRITICAL!' : 'TIME RUNNING LOW!'}
          </span>
        </div>
      )}
    </div>
  );
};
