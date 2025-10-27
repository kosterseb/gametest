import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Sword, Shield, Zap, Heart, AlertCircle, Settings, Check } from 'lucide-react';
import { getItemById } from '../../data/items';

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
    if (!enemy) return 'bg-gray-600';
    if (enemy.isBoss) return 'bg-red-900';
    if (enemy.isElite) return 'bg-orange-600';
    return 'bg-red-600';
  };

  if (!enemy) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
          <div className="text-white text-2xl">Loading enemy data...</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Sword className="w-10 h-10 text-red-600" />
                <h1 className="text-4xl font-bold">Prepare For Battle</h1>
              </div>
              <p className="text-gray-600">Check your loadout before engaging the enemy</p>
            </div>

            {/* Enemy Preview */}
            <div className={`${getEnemyColor()} text-white p-6 rounded-xl mb-8 shadow-lg`}>
              <div className="flex items-center gap-6">
                <div className="text-6xl">{getEnemyEmoji()}</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">
                    {enemy.name}
                    {enemy.isBoss && <span className="ml-2 text-yellow-300">👑 BOSS</span>}
                    {enemy.isElite && <span className="ml-2 text-yellow-300">⚡ ELITE</span>}
                  </h2>
                  <div className="flex gap-4 text-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      <span>{enemy.health} HP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span>{enemy.abilities?.length || 0} Abilities</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enemy Abilities Preview */}
              <div className="mt-4 bg-black bg-opacity-20 rounded-lg p-3">
                <h3 className="text-sm font-bold mb-2 opacity-75">Enemy Abilities:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {enemy.abilities?.slice(0, 4).map((ability, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{ability.name}</span>
                      <span className="opacity-75">{ability.chance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Your Loadout */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  Your Loadout
                </h3>
                <button
                  onClick={handleManageInventory}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Inventory
                </button>
              </div>

              {/* Consumables */}
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-3 text-gray-700">
                  Consumables ({equippedConsumables.length}/{gameState.maxConsumableSlots}):
                </h4>
                {equippedConsumables.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {equippedConsumables.map((item, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 flex items-center gap-3"
                      >
                        <div className="text-3xl">{item.emoji}</div>
                        <div>
                          <div className="font-bold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                    No consumables equipped
                  </div>
                )}
              </div>

              {/* Passive */}
              <div>
                <h4 className="text-md font-semibold mb-3 text-gray-700">
                  Passive ({equippedPassive ? '1' : '0'}/{gameState.maxPassiveSlots}):
                </h4>
                {equippedPassive ? (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3 flex items-center gap-3 max-w-md">
                    <div className="text-3xl">{equippedPassive.emoji}</div>
                    <div>
                      <div className="font-bold text-gray-800">{equippedPassive.name}</div>
                      <div className="text-xs text-gray-600">{equippedPassive.description}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 max-w-md">
                    No passive equipped
                  </div>
                )}
              </div>
            </div>

            {/* Player Stats */}
            <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">Your Stats:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Health</div>
                  <div className="text-xl font-bold text-gray-800">
                    {gameState.playerHealth}/{gameState.maxPlayerHealth}
                  </div>
                </div>
                <div className="text-center">
                  <Zap className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Max Energy</div>
                  <div className="text-xl font-bold text-gray-800">{gameState.maxEnergy}</div>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Hand Size</div>
                  <div className="text-xl font-bold text-gray-800">{gameState.maxHandSize}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleStartBattle}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                <Sword className="w-6 h-6" />
                Start Battle!
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-bold transition-all"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Loadout Settings
                </h4>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLoadoutPref}
                    onChange={handleToggleShowLoadout}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Show loadout before every battle</div>
                    <div className="text-sm text-gray-600">
                      {showLoadoutPref 
                        ? 'You will see this screen before each battle'
                        : 'Skip directly to battle (can still access via map button)'}
                    </div>
                  </div>
                  {showLoadoutPref && <Check className="w-5 h-5 text-green-600 ml-auto" />}
                </label>
              </div>
            )}

            {/* Warning if no items */}
            {equippedConsumables.length === 0 && !equippedPassive && (
              <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-yellow-800">No Items Equipped!</div>
                  <div className="text-sm text-yellow-700">
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