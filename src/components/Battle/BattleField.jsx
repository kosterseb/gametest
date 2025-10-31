import React, { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Skull, Swords } from 'lucide-react';
import { StatusDisplay } from './StatusDisplay';
import { PlayerAvatar } from './PlayerAvatar';
import { EnemyAvatar } from './EnemyAvatar';

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
  enemyStatuses = [],
  avatarSeed = 'default',
  onAttackAnimationChange = () => {}
}) => {
  // Player animation states
  const [isPlayerBeingAttacked, setIsPlayerBeingAttacked] = useState(false);
  const [isPlayerHealing, setIsPlayerHealing] = useState(false);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);

  // Enemy animation states
  const [isEnemyBeingAttacked, setIsEnemyBeingAttacked] = useState(false);
  const [isEnemyHealing, setIsEnemyHealing] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);

  // Health tracking
  const prevPlayerHealthRef = useRef(playerHealth);
  const prevEnemyHealthRef = useRef(enemyHealth);
  const playerAnimationInProgressRef = useRef(false);
  const enemyAnimationInProgressRef = useRef(false);

  // Detect when player health changes
  useEffect(() => {
    const prevHealth = prevPlayerHealthRef.current;

    // Only trigger if health actually changed AND no player animation is already playing
    if (playerHealth === prevHealth || playerAnimationInProgressRef.current) {
      return;
    }

    if (playerHealth < prevHealth) {
      // Player took damage - trigger player damage + enemy attack animations
      console.log('🩸 Player damage detected:', prevHealth, '->', playerHealth);
      prevPlayerHealthRef.current = playerHealth;
      playerAnimationInProgressRef.current = true;
      enemyAnimationInProgressRef.current = true;

      // Player damage effect
      setIsPlayerBeingAttacked(true);
      setIsPlayerHealing(false);
      setIsPlayerAttacking(false);

      // Enemy attack effect
      setIsEnemyAttacking(true);
      setIsEnemyBeingAttacked(false);
      setIsEnemyHealing(false);

      onAttackAnimationChange(true);

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('🩸 Clearing player damage + enemy attack animations');
        setIsPlayerBeingAttacked(false);
        setIsEnemyAttacking(false);
        playerAnimationInProgressRef.current = false;
        enemyAnimationInProgressRef.current = false;
      }, 2000);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(fullTimer);
      };
    }

    if (playerHealth > prevHealth) {
      // Player healed
      console.log('💚 Player healing detected:', prevHealth, '->', playerHealth);
      prevPlayerHealthRef.current = playerHealth;
      playerAnimationInProgressRef.current = true;
      setIsPlayerHealing(true);
      setIsPlayerBeingAttacked(false);
      setIsPlayerAttacking(false);
      onAttackAnimationChange(true);

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('💚 Clearing player heal animation');
        setIsPlayerHealing(false);
        playerAnimationInProgressRef.current = false;
      }, 2000);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(fullTimer);
      };
    }
  }, [playerHealth, onAttackAnimationChange]);

  // Detect when enemy health changes
  useEffect(() => {
    const prevHealth = prevEnemyHealthRef.current;

    // Only trigger if enemy health actually changed AND no animation is already playing
    if (enemyHealth === prevHealth || enemyAnimationInProgressRef.current) {
      return;
    }

    if (enemyHealth < prevHealth) {
      // Enemy took damage - trigger enemy damage + player attack animations
      console.log('⚔️ Enemy damage detected:', prevHealth, '->', enemyHealth);
      prevEnemyHealthRef.current = enemyHealth;
      playerAnimationInProgressRef.current = true;
      enemyAnimationInProgressRef.current = true;

      // Player attack effect
      setIsPlayerAttacking(true);
      setIsPlayerBeingAttacked(false);
      setIsPlayerHealing(false);

      // Enemy damage effect
      setIsEnemyBeingAttacked(true);
      setIsEnemyHealing(false);
      setIsEnemyAttacking(false);

      onAttackAnimationChange(true);

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('⚔️ Clearing player attack + enemy damage animations');
        setIsPlayerAttacking(false);
        setIsEnemyBeingAttacked(false);
        playerAnimationInProgressRef.current = false;
        enemyAnimationInProgressRef.current = false;
      }, 2000);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(fullTimer);
      };
    }

    if (enemyHealth > prevHealth) {
      // Enemy healed
      console.log('💚 Enemy healing detected:', prevHealth, '->', enemyHealth);
      prevEnemyHealthRef.current = enemyHealth;
      enemyAnimationInProgressRef.current = true;
      setIsEnemyHealing(true);
      setIsEnemyBeingAttacked(false);
      setIsEnemyAttacking(false);
      onAttackAnimationChange(true);

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('💚 Clearing enemy heal animation');
        setIsEnemyHealing(false);
        enemyAnimationInProgressRef.current = false;
      }, 2000);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(fullTimer);
      };
    }
  }, [enemyHealth, onAttackAnimationChange]);

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

  return (
    <div className="bg-white bg-opacity-45 p-3 rounded-xl shadow-lg h-full overflow-auto">
      {/* Battle Arena */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        {/* Player Side */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-lg font-bold text-blue-600">YOU</div>

          {/* Player Avatar */}
          <PlayerAvatar
            playerHealth={playerHealth}
            maxPlayerHealth={maxPlayerHealth}
            isBeingAttacked={isPlayerBeingAttacked}
            isHealing={isPlayerHealing}
            isAttacking={isPlayerAttacking}
            seed={avatarSeed}
          />

          {/* Player Health Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-xs font-semibold text-gray-600">HP</span>
              </div>
              <span className="text-xs font-bold text-gray-800">
                {playerHealth}/{maxPlayerHealth}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
                style={{ width: `${playerHealthPercentage}%` }}
              />
            </div>
          </div>

          {/* Player Energy Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-semibold text-gray-600">ENERGY</span>
              </div>
              <span className="text-xs font-bold text-gray-800">
                {playerEnergy}/{maxEnergy}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
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
          <div className="w-full bg-blue-50 border border-blue-300 p-2 rounded-lg">
            <h4 className="text-xs font-bold text-blue-700 mb-1">YOUR ACTIONS:</h4>
            <div className="space-y-0.5 max-h-16 overflow-y-auto text-xs">
              {playerLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No actions yet...</p>
              ) : (
                playerLogs.slice(-3).map((log, index) => (
                  <p key={index} className="text-xs text-gray-700 leading-tight">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="flex flex-col items-center justify-center">
          <Swords className={`w-10 h-10 ${isEnemyTurn ? 'text-red-600 animate-pulse' : 'text-gray-400'} mb-2`} />
          <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
            isEnemyTurn ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isEnemyTurn ? 'ENEMY TURN' : 'YOUR TURN'}
          </div>
        </div>

        {/* Enemy Side */}
        <div className="flex flex-col items-center space-y-2">
          {/* Enemy Type Badge */}
          <div className="flex items-center space-x-2">
            {enemy.isElite && (
              <span className="bg-orange-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">⭐ ELITE</span>
            )}
            {enemy.isBoss && (
              <span className="bg-purple-600 text-white font-bold text-xs px-2 py-0.5 rounded-full">👑 BOSS</span>
            )}
            {!enemy.isElite && !enemy.isBoss && (
              <span className="text-gray-500 font-bold text-xs">ENEMY</span>
            )}
          </div>

          {/* Enemy Avatar */}
          <EnemyAvatar
            enemyName={enemy.name}
            isBoss={enemy.isBoss}
            customAvatarParams={enemy.avatarParams}
            isBeingAttacked={isEnemyBeingAttacked}
            isHealing={isEnemyHealing}
            isAttacking={isEnemyAttacking}
          />

          <div className="text-base font-bold text-gray-800">{enemy.name || 'Unknown Enemy'}</div>

          {/* Enemy Health Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <Skull className="w-3 h-3 text-gray-700" />
                <span className="text-xs font-semibold text-gray-600">HP</span>
              </div>
              <span className="text-xs font-bold text-gray-800">
                {enemyHealth}/{maxEnemyHealth}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
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
          <div className="w-full bg-red-50 border border-red-300 p-2 rounded-lg">
            <h4 className="text-xs font-bold text-red-700 mb-1">ENEMY ACTIONS:</h4>
            <div className="space-y-0.5 max-h-16 overflow-y-auto text-xs">
              {enemyLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No actions yet...</p>
              ) : (
                enemyLogs.slice(-3).map((log, index) => (
                  <p key={index} className="text-xs text-gray-700 leading-tight">
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