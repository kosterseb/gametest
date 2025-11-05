import React, { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Skull, Swords } from 'lucide-react';
import { StatusDisplay } from './StatusDisplay';
import { PlayerAvatar } from './PlayerAvatar';
import { EnemyAvatar } from './EnemyAvatar';
import { NBProgressBar, NBBadge } from '../UI/NeoBrutalUI';

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
  playerName = 'Player',
  enemyEnergy = 0,
  maxEnemyEnergy = 10,
  onAttackAnimationChange = () => {},
  onCombatStateChange = () => {}
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
      onCombatStateChange({
        isPlayerAttacking: false,
        isPlayerHealing: false,
        isPlayerDamaged: true,
        isEnemyAttacking: true,
        isEnemyHealing: false,
        isEnemyDamaged: false
      });

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('🩸 Clearing player damage + enemy attack animations');
        setIsPlayerBeingAttacked(false);
        setIsEnemyAttacking(false);
        playerAnimationInProgressRef.current = false;
        enemyAnimationInProgressRef.current = false;
        onCombatStateChange({
          isPlayerAttacking: false,
          isPlayerHealing: false,
          isPlayerDamaged: false,
          isEnemyAttacking: false,
          isEnemyHealing: false,
          isEnemyDamaged: false
        });
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
      onCombatStateChange({
        isPlayerAttacking: false,
        isPlayerHealing: true,
        isPlayerDamaged: false,
        isEnemyAttacking: false,
        isEnemyHealing: false,
        isEnemyDamaged: false
      });

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('💚 Clearing player heal animation');
        setIsPlayerHealing(false);
        playerAnimationInProgressRef.current = false;
        onCombatStateChange({
          isPlayerAttacking: false,
          isPlayerHealing: false,
          isPlayerDamaged: false,
          isEnemyAttacking: false,
          isEnemyHealing: false,
          isEnemyDamaged: false
        });
      }, 2000);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(fullTimer);
      };
    }
  }, [playerHealth, onAttackAnimationChange, onCombatStateChange]);

  // Detect when enemy health changes
  useEffect(() => {
    const prevHealth = prevEnemyHealthRef.current;

    // Only trigger if enemy health actually changed AND no animation is already playing
    if (enemyHealth === prevHealth || enemyAnimationInProgressRef.current) {
      return;
    }

    if (enemyHealth < prevHealth) {
      // Enemy took damage - trigger enemy damage + player attack animations
      console.log('💥 Enemy damage detected:', prevHealth, '->', enemyHealth);
      prevEnemyHealthRef.current = enemyHealth;
      playerAnimationInProgressRef.current = true;
      enemyAnimationInProgressRef.current = true;

      // Enemy damage effect
      setIsEnemyBeingAttacked(true);
      setIsEnemyHealing(false);
      setIsEnemyAttacking(false);

      // Player attack effect
      setIsPlayerAttacking(true);
      setIsPlayerBeingAttacked(false);
      setIsPlayerHealing(false);

      onAttackAnimationChange(true);
      onCombatStateChange({
        isPlayerAttacking: true,
        isPlayerHealing: false,
        isPlayerDamaged: false,
        isEnemyAttacking: false,
        isEnemyHealing: false,
        isEnemyDamaged: true
      });

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('💥 Clearing enemy damage + player attack animations');
        setIsEnemyBeingAttacked(false);
        setIsPlayerAttacking(false);
        playerAnimationInProgressRef.current = false;
        enemyAnimationInProgressRef.current = false;
        onCombatStateChange({
          isPlayerAttacking: false,
          isPlayerHealing: false,
          isPlayerDamaged: false,
          isEnemyAttacking: false,
          isEnemyHealing: false,
          isEnemyDamaged: false
        });
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
      onCombatStateChange({
        isPlayerAttacking: false,
        isPlayerHealing: false,
        isPlayerDamaged: false,
        isEnemyAttacking: false,
        isEnemyHealing: true,
        isEnemyDamaged: false
      });

      const pauseTimer = setTimeout(() => {
        onAttackAnimationChange(false);
      }, 1500);

      const fullTimer = setTimeout(() => {
        console.log('💚 Clearing enemy heal animation');
        setIsEnemyHealing(false);
        enemyAnimationInProgressRef.current = false;
        onCombatStateChange({
          isPlayerAttacking: false,
          isPlayerHealing: false,
          isPlayerDamaged: false,
          isEnemyAttacking: false,
          isEnemyHealing: false,
          isEnemyDamaged: false
        });
      }, 2000);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(fullTimer);
      };
    }
  }, [enemyHealth, onAttackAnimationChange, onCombatStateChange]);

  // Safety checks
  if (!enemy) {
    return <div className="text-center p-8">Loading battle...</div>;
  }

  const playerHealthPercentage = Math.max(0, Math.min(100, (playerHealth / maxPlayerHealth) * 100));
  const enemyHealthPercentage = Math.max(0, Math.min(100, (enemyHealth / maxEnemyHealth) * 100));
  const energyPercentage = Math.max(0, Math.min(100, (playerEnergy / maxEnergy) * 100));
  const enemyEnergyPercentage = Math.max(0, Math.min(100, (enemyEnergy / maxEnemyEnergy) * 100));

  // Split battle log into player and enemy actions
  const playerLogs = battleLog.filter(log =>
    !log.includes(enemy.name) || log.includes('Victory') || log.includes('Turn ended')
  );
  const enemyLogs = battleLog.filter(log =>
    log.includes(enemy.name) && !log.includes('Victory')
  );

  return (
    <div className="p-3 h-full overflow-auto">
      {/* Battle Arena */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        {/* Player Side */}
        <div className="flex flex-col items-center space-y-2">
          {/* Player Name */}
          <div className="nb-bg-white nb-border-lg nb-shadow px-4 py-2">
            <p className="text-sm font-black uppercase text-center tracking-wide">{playerName}</p>
          </div>

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
            <NBProgressBar
              value={playerHealth}
              max={maxPlayerHealth}
              color="red"
              label="❤️ HP"
              showValue={true}
            />
          </div>

          {/* Player Energy Bar */}
          <div className="w-full">
            <NBProgressBar
              value={playerEnergy}
              max={maxEnergy}
              color="cyan"
              label="⚡ ENERGY"
              showValue={true}
            />
          </div>

          {/* Player Statuses */}
          {playerStatuses && playerStatuses.length > 0 && (
            <div className="w-full">
              <StatusDisplay statuses={playerStatuses} isPlayer={true} compact={true} />
            </div>
          )}

          {/* Player Battle Log */}
          <div className="w-full nb-bg-cyan nb-border-lg nb-shadow p-3">
            <h4 className="text-xs font-black uppercase mb-2 tracking-wide">📝 Your Actions:</h4>
            <div className="space-y-1 max-h-16 overflow-y-auto text-xs nb-bg-white nb-border p-2">
              {playerLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic font-semibold">No actions yet...</p>
              ) : (
                playerLogs.slice(-3).map((log, index) => (
                  <p key={index} className="text-xs font-semibold leading-tight">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="flex flex-col items-center justify-center gap-4">
          <Swords className={`w-12 h-12 ${isEnemyTurn ? 'text-red-600 animate-pulse' : 'text-gray-700'}`} />
          <NBBadge
            color={isEnemyTurn ? 'red' : 'green'}
            className="text-sm px-4 py-2"
          >
            {isEnemyTurn ? '⚔️ ENEMY TURN' : '✨ YOUR TURN'}
          </NBBadge>
        </div>

        {/* Enemy Side */}
        <div className="flex flex-col items-center space-y-2">
          {/* Enemy Type Badge */}
          <div className="flex items-center space-x-2">
            {enemy.isElite && (
              <NBBadge color="orange" className="text-xs">⭐ ELITE</NBBadge>
            )}
            {enemy.isBoss && (
              <NBBadge color="purple" className="text-xs">👑 BOSS</NBBadge>
            )}
            {!enemy.isElite && !enemy.isBoss && (
              <NBBadge color="white" className="text-xs">💀 ENEMY</NBBadge>
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

          <div className="nb-bg-white nb-border-lg nb-shadow px-4 py-2">
            <p className="text-sm font-black uppercase text-center tracking-wide">{enemy.name || 'Unknown Enemy'}</p>
          </div>

          {/* Enemy Health Bar */}
          <div className="w-full">
            <NBProgressBar
              value={enemyHealth}
              max={maxEnemyHealth}
              color="green"
              label="💀 HP"
              showValue={true}
            />
          </div>

          {/* Enemy Energy Bar */}
          <div className="w-full">
            <NBProgressBar
              value={enemyEnergy}
              max={maxEnemyEnergy}
              color="yellow"
              label="⚡ AP"
              showValue={true}
            />
          </div>

          {/* Enemy Statuses */}
          {enemyStatuses && enemyStatuses.length > 0 && (
            <div className="w-full">
              <StatusDisplay statuses={enemyStatuses} isPlayer={false} compact={true} />
            </div>
          )}

          {/* Enemy Battle Log */}
          <div className="w-full nb-bg-red nb-border-lg nb-shadow p-3">
            <h4 className="text-xs font-black uppercase mb-2 tracking-wide text-white">💥 Enemy Actions:</h4>
            <div className="space-y-1 max-h-16 overflow-y-auto text-xs nb-bg-white nb-border p-2">
              {enemyLogs.length === 0 ? (
                <p className="text-xs text-gray-500 italic font-semibold">No actions yet...</p>
              ) : (
                enemyLogs.slice(-3).map((log, index) => (
                  <p key={index} className="text-xs font-semibold leading-tight">
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
