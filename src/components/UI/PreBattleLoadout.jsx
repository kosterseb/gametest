import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Sword, Shield, Zap, Heart, AlertCircle, Settings, Check } from 'lucide-react';
import { getItemById } from '../../data/items';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';

export const PreBattleLoadout = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  // Get enemy data
  const enemy = gameState.currentEnemyData;
  
  // Get loadout
  const toolBelt = gameState.inventory?.toolBelt || { consumables: [null, null], passive: null };
  const equippedConsumables = toolBelt.consumables.filter(item => item !== null);
  const equippedPassive = toolBelt.passive;

  // Get show preference
  const showLoadoutPref = gameState.showPreBattleLoadout;

  const handleStartBattle = () => {
    navigate('/battle');
  };

  const handleManageInventory = () => {
    // Open game menu to inventory tab
    dispatch({ type: 'OPEN_MENU', tab: 'inventory' });
  };

  const handleToggleShowLoadout = () => {
    dispatch({ type: 'TOGGLE_PRE_BATTLE_LOADOUT' });
  };

  const getEnemyEmoji = () => {
    if (!enemy) return '👾';
    if (enemy.isBoss) return '💀';
    if (enemy.isElite) return '⚡';
    return '⚔️';
  };

  const getEnemyColor = () => {
    if (!enemy) return 'nb-bg-white';
    if (enemy.isBoss) return 'nb-bg-purple';
    if (enemy.isElite) return 'nb-bg-orange';
    return 'nb-bg-red';
  };

  if (!enemy) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-red flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Loading enemy data...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-red flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Sword className="w-10 h-10 text-black" />
                <NBHeading level={1} className="text-black">PREPARE FOR BATTLE</NBHeading>
              </div>
              <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-3 inline-block">
                <p className="text-black font-bold text-sm uppercase">Check your loadout before engaging the enemy</p>
              </div>
            </div>

            {/* Enemy Preview */}
            <div className={`${getEnemyColor()} nb-border-xl nb-shadow-lg p-6 mb-8`}>
              <div className="flex items-center gap-6">
                <div className="text-6xl">{getEnemyEmoji()}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <NBHeading level={2} className="text-black">{enemy.name}</NBHeading>
                    {enemy.isBoss && <NBBadge color="yellow" className="px-3 py-1">👑 BOSS</NBBadge>}
                    {enemy.isElite && <NBBadge color="yellow" className="px-3 py-1">⚡ ELITE</NBBadge>}
                  </div>
                  <div className="flex gap-4 text-lg">
                    <div className="flex items-center gap-2 text-black font-black">
                      <Heart className="w-5 h-5" />
                      <span>{enemy.health} HP</span>
                    </div>
                    <div className="flex items-center gap-2 text-black font-black">
                      <Zap className="w-5 h-5" />
                      <span>{enemy.abilities?.length || 0} ABILITIES</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enemy Abilities Preview */}
              <div className="mt-6 nb-bg-white nb-border-lg nb-shadow p-4">
                <h3 className="text-sm font-black mb-3 text-black uppercase">Enemy Abilities:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {enemy.abilities?.slice(0, 4).map((ability, index) => (
                    <div key={index} className="flex justify-between text-black font-bold">
                      <span>{ability.name}</span>
                      <span>{ability.chance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Your Loadout */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-black" />
                  <NBHeading level={3} className="text-black">YOUR LOADOUT</NBHeading>
                </div>
                <NBButton
                  onClick={handleManageInventory}
                  variant="purple"
                  size="md"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>MANAGE</span>
                </NBButton>
              </div>

              {/* Consumables */}
              <div className="mb-6">
                <h4 className="text-sm font-black mb-3 text-black uppercase">
                  Consumables ({equippedConsumables.length}/{gameState.maxConsumableSlots}):
                </h4>
                {equippedConsumables.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {equippedConsumables.map((item, index) => (
                      <div
                        key={index}
                        className="nb-bg-blue nb-border-lg nb-shadow p-3 flex items-center gap-3"
                      >
                        <div className="text-3xl">{item.emoji}</div>
                        <div>
                          <div className="font-black text-black uppercase text-sm">{item.name}</div>
                          <div className="text-xs text-black font-bold">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center text-black font-bold uppercase">
                    No consumables equipped
                  </div>
                )}
              </div>

              {/* Passive */}
              <div>
                <h4 className="text-sm font-black mb-3 text-black uppercase">
                  Passive ({equippedPassive ? '1' : '0'}/{gameState.maxPassiveSlots}):
                </h4>
                {equippedPassive ? (
                  <div className="nb-bg-purple nb-border-lg nb-shadow p-3 flex items-center gap-3 max-w-md">
                    <div className="text-3xl">{equippedPassive.emoji}</div>
                    <div>
                      <div className="font-black text-black uppercase text-sm">{equippedPassive.name}</div>
                      <div className="text-xs text-black font-bold">{equippedPassive.description}</div>
                    </div>
                  </div>
                ) : (
                  <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center text-black font-bold uppercase max-w-md">
                    No passive equipped
                  </div>
                )}
              </div>
            </div>

            {/* Player Stats */}
            <div className="mb-8 nb-bg-green nb-border-xl nb-shadow-lg p-6">
              <NBHeading level={4} className="text-black mb-4">YOUR STATS:</NBHeading>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center nb-bg-white nb-border-lg nb-shadow p-3">
                  <Heart className="w-6 h-6 text-black mx-auto mb-2" />
                  <div className="text-xs text-black font-bold uppercase">Health</div>
                  <div className="text-xl font-black text-black">
                    {gameState.playerHealth}/{gameState.maxPlayerHealth}
                  </div>
                </div>
                <div className="text-center nb-bg-white nb-border-lg nb-shadow p-3">
                  <Zap className="w-6 h-6 text-black mx-auto mb-2" />
                  <div className="text-xs text-black font-bold uppercase">Max Energy</div>
                  <div className="text-xl font-black text-black">{gameState.maxEnergy}</div>
                </div>
                <div className="text-center nb-bg-white nb-border-lg nb-shadow p-3">
                  <Shield className="w-6 h-6 text-black mx-auto mb-2" />
                  <div className="text-xs text-black font-bold uppercase">Hand Size</div>
                  <div className="text-xl font-black text-black">{gameState.maxHandSize}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <NBButton
                onClick={handleStartBattle}
                variant="danger"
                size="xl"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Sword className="w-6 h-6" />
                <span>START BATTLE!</span>
              </NBButton>

              <NBButton
                onClick={() => setShowSettings(!showSettings)}
                variant="white"
                size="xl"
                className="px-6"
              >
                <Settings className="w-6 h-6" />
              </NBButton>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 nb-bg-white nb-border-xl nb-shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-black" />
                  <NBHeading level={4} className="text-black">LOADOUT SETTINGS</NBHeading>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLoadoutPref}
                    onChange={handleToggleShowLoadout}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div>
                    <div className="font-black text-black uppercase text-sm">Show loadout before every battle</div>
                    <div className="text-xs text-black font-bold">
                      {showLoadoutPref
                        ? 'You will see this screen before each battle'
                        : 'Skip directly to battle (can still access via map button)'}
                    </div>
                  </div>
                  {showLoadoutPref && <Check className="w-5 h-5 text-black ml-auto" />}
                </label>
              </div>
            )}

            {/* Warning if no items */}
            {equippedConsumables.length === 0 && !equippedPassive && (
              <div className="mt-4 nb-bg-yellow nb-border-xl nb-shadow-lg p-6 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-black flex-shrink-0" />
                <div>
                  <div className="font-black text-black uppercase">No Items Equipped!</div>
                  <div className="text-sm text-black font-bold">
                    Consider equipping consumables or passives from your inventory for an advantage.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};