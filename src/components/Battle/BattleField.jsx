import React from 'react';
import { Heart, Zap, Skull, Swords } from 'lucide-react';
import { StatusDisplay } from './StatusDisplay';

export const BattleField = ({ 
  enemy, 
  enemyHealth, 
  maxEnemyHealth, 
  isEnemyTurn, 
  battleLog = [],
  playerHealth,
  maxPlayerHealth,
  playerEnergy,
  maxEnergy,
  playerStatuses = [],
  enemyStatuses = []
}) => {
  // Safety checks
  if (!enemy) {
    return <div className="text-center p-8">Loading battle...</div>;
  }

  const playerHealthPercentage = Math.max(0, Math.min(100, (playerHealth / maxPlayerHealth) * 100));
  const enemyHealthPercentage = Math.max(0, Math.min(100, (enemyHealth / maxEnemyHealth) * 100));
  const energyPercentage = Math.max(0, Math.min(100, (playerEnergy / maxEnergy) * 100));

  // Split battle log into player and enemy actions
  const playerLogs = battleLog.filter(log => 
    !log.includes(enemy.name) || log.includes('Victory') || log.includes('Turn ended')
  );
  const enemyLogs = battleLog.filter(log => 
    log.includes(enemy.name) && !log.includes('Victory')
  );

  // Get enemy emoji/icon
  const getEnemyIcon = () => {
    if (enemy.emoji) return enemy.emoji;
    if (enemy.isBoss) return '👑';
    if (enemy.isElite) return '⭐';
    return '👹';
  };

  return (
    <div className="bg-white bg-opacity-90 p-6 rounded-xl mb-4 shadow-lg">
      {/* Battle Arena */}
      <div className="grid grid-cols-3 gap-8 mb-6">
        {/* Player Side */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-3xl font-bold text-blue-600">YOU</div>
          
          {/* Player Avatar Placeholder */}
          <div className="text-6xl">🧙‍♂️</div>

          {/* Player Health Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-gray-600">HP</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {playerHealth}/{maxPlayerHealth}
              </span>
            </div>
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
                style={{ width: `${playerHealthPercentage}%` }}
              />
            </div>
          </div>

          {/* Player Energy Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-gray-600">ENERGY</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {playerEnergy}/{maxEnergy}
              </span>
            </div>
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${energyPercentage}%` }}
              />
            </div>
          </div>

          {/* Player Statuses */}
          {playerStatuses && playerStatuses.length > 0 && (
            <div className="w-full">
              <StatusDisplay statuses={playerStatuses} isPlayer={true} compact={true} />
            </div>
          )}

          {/* Player Battle Log */}
          <div className="w-full bg-blue-50 border-2 border-blue-300 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-blue-700 mb-2">YOUR ACTIONS:</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {playerLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No actions yet...</p>
              ) : (
                playerLogs.slice(-4).map((log, index) => (
                  <p key={index} className="text-xs text-gray-700">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="flex flex-col items-center justify-center">
          <Swords className={`w-16 h-16 ${isEnemyTurn ? 'text-red-600 animate-pulse' : 'text-gray-400'} mb-4`} />
          <div className={`text-lg font-bold px-4 py-2 rounded-lg ${
            isEnemyTurn ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isEnemyTurn ? 'ENEMY TURN' : 'YOUR TURN'}
          </div>
        </div>

        {/* Enemy Side */}
        <div className="flex flex-col items-center space-y-4">
          {/* Enemy Type Badge */}
          <div className="flex items-center space-x-2">
            {enemy.isElite && (
              <span className="bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full">⭐ ELITE</span>
            )}
            {enemy.isBoss && (
              <span className="bg-purple-600 text-white font-bold text-xs px-3 py-1 rounded-full">👑 BOSS</span>
            )}
            {!enemy.isElite && !enemy.isBoss && (
              <span className="text-gray-500 font-bold text-xs">ENEMY</span>
            )}
          </div>
          
          {/* Enemy Avatar */}
          <div className={`text-6xl ${isEnemyTurn ? 'animate-bounce' : ''}`}>
            {getEnemyIcon()}
          </div>
          
          <div className="text-xl font-bold text-gray-800">{enemy.name || 'Unknown Enemy'}</div>

          {/* Enemy Health Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Skull className="w-4 h-4 text-gray-700" />
                <span className="text-xs font-semibold text-gray-600">HP</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {enemyHealth}/{maxEnemyHealth}
              </span>
            </div>
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${enemyHealthPercentage}%` }}
              />
            </div>
          </div>

          {/* Enemy Statuses */}
          {enemyStatuses && enemyStatuses.length > 0 && (
            <div className="w-full">
              <StatusDisplay statuses={enemyStatuses} isPlayer={false} compact={true} />
            </div>
          )}

          {/* Enemy Battle Log */}
          <div className="w-full bg-red-50 border-2 border-red-300 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-red-700 mb-2">ENEMY ACTIONS:</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {enemyLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No actions yet...</p>
              ) : (
                enemyLogs.slice(-4).map((log, index) => (
                  <p key={index} className="text-xs text-gray-700">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};