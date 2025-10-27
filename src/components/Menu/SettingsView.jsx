import React from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Volume2, Eye } from 'lucide-react';

export const SettingsView = () => {
  const { gameState, dispatch } = useGame();

  const handleTogglePreBattleLoadout = () => {
    dispatch({ type: 'TOGGLE_PRE_BATTLE_LOADOUT' });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 rounded-t-xl -mt-6 -mx-6 mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-3xl font-bold text-white">Settings</h2>
            <p className="text-purple-200">Customize your game experience</p>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Pre-Battle Loadout Toggle */}
        <div className="bg-gray-800 p-4 rounded-lg border-2 border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Pre-Battle Loadout Screen</h3>
                <p className="text-sm text-gray-400">
                  Show loadout screen before battles to equip items
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePreBattleLoadout}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                ${gameState.showPreBattleLoadout ? 'bg-green-500' : 'bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                  ${gameState.showPreBattleLoadout ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Sound Settings (Placeholder) */}
        <div className="bg-gray-800 p-4 rounded-lg border-2 border-gray-700 opacity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Sound & Music</h3>
                <p className="text-sm text-gray-400">
                  Coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        {gameState.profile && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-lg border-2 border-purple-500 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Profile Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-purple-200">
                <span>Profile Name:</span>
                <span className="font-bold text-white">{gameState.profile.profileName}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>Level:</span>
                <span className="font-bold text-white">{gameState.profile.level}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>Talent Points:</span>
                <span className="font-bold text-white">{gameState.profile.talentPoints}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>Total Runs:</span>
                <span className="font-bold text-white">{gameState.profile.lifetimeStats.totalRuns}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>Total Wins:</span>
                <span className="font-bold text-white">{gameState.profile.lifetimeStats.totalWins}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>Save Slot:</span>
                <span className="font-bold text-white">#{gameState.currentSaveSlot}</span>
              </div>
            </div>
          </div>
        )}

        {/* Game Info */}
        <div className="bg-gray-800 p-4 rounded-lg border-2 border-gray-700 text-center mt-8">
          <p className="text-gray-400 text-sm mb-1">Card Quest</p>
          <p className="text-gray-500 text-xs">A Roguelike Card Adventure</p>
        </div>
      </div>
    </div>
  );
};