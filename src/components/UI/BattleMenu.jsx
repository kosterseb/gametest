import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useRouter } from '../../hooks/useRouter';
import { Settings, Home, BarChart3, X, Volume2, Zap } from 'lucide-react';

export const BattleMenu = ({ isOpen, onClose, gameState }) => {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'settings', 'stats'
  const { settings, toggleSetting, updateSetting, toggleFullscreen } = useSettings();
  const { navigate } = useRouter();

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReturnToMain = () => {
    if (window.confirm('Are you sure you want to return to the main menu? Your progress will be saved.')) {
      navigate('/');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border-4 border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Main Menu */}
        {currentView === 'main' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Game Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleReturnToMain}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-3"
              >
                <Home className="w-6 h-6" />
                Return to Main Menu
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-3"
              >
                <Settings className="w-6 h-6" />
                Settings
              </button>

              <button
                onClick={() => setCurrentView('stats')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-3"
              >
                <BarChart3 className="w-6 h-6" />
                View Stats & Inventory
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-3"
              >
                <X className="w-6 h-6" />
                Close Menu
              </button>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        {currentView === 'settings' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setCurrentView('main')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                ← Back to Menu
              </button>
            </div>

            <div className="space-y-6">
              {/* Fullscreen */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🖥️ Display
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Fullscreen Mode</p>
                    <p className="text-gray-400 text-sm">Press ESC to exit fullscreen</p>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${
                      settings.isFullscreen
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {settings.isFullscreen ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Performance
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div>
                      <p className="text-white font-semibold">Animated Background</p>
                      <p className="text-gray-400 text-sm">Torus tunnel effect</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={settings.animatedBackground}
                        onChange={() => toggleSetting('animatedBackground')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-600 peer-checked:bg-green-600 rounded-full peer transition-all cursor-pointer"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div>
                      <p className="text-white font-semibold">Particle Effects</p>
                      <p className="text-gray-400 text-sm">Card play explosions</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={settings.particleEffects}
                        onChange={() => toggleSetting('particleEffects')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-600 peer-checked:bg-green-600 rounded-full peer transition-all cursor-pointer"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div>
                      <p className="text-white font-semibold">Card Animations</p>
                      <p className="text-gray-400 text-sm">Draw and play animations</p>
                    </div>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={settings.cardAnimations}
                        onChange={() => toggleSetting('cardAnimations')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-600 peer-checked:bg-green-600 rounded-full peer transition-all cursor-pointer"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sound (Future) */}
              <div className="bg-gray-800 p-6 rounded-xl opacity-50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" /> Sound (Coming Soon)
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-white mb-2">
                      <span>Master Volume</span>
                      <span>{settings.masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.masterVolume}
                      onChange={(e) => updateSetting('masterVolume', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      disabled
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white mb-2">
                      <span>Music Volume</span>
                      <span>{settings.musicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.musicVolume}
                      onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      disabled
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-white mb-2">
                      <span>SFX Volume</span>
                      <span>{settings.sfxVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.sfxVolume}
                      onChange={(e) => updateSetting('sfxVolume', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats & Inventory View */}
        {currentView === 'stats' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Stats & Inventory</h2>
              <button
                onClick={() => setCurrentView('main')}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                ← Back to Menu
              </button>
            </div>

            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Player Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Health</p>
                    <p className="text-2xl font-bold text-red-400">{gameState?.playerHealth || 0} / {gameState?.maxPlayerHealth || 100}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Gold</p>
                    <p className="text-2xl font-bold text-yellow-400">💰 {gameState?.gold || 0}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Current Floor</p>
                    <p className="text-2xl font-bold text-purple-400">{gameState?.currentFloor || 1}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Deck Size</p>
                    <p className="text-2xl font-bold text-blue-400">{gameState?.deck?.length || 0} cards</p>
                  </div>
                </div>
              </div>

              {/* Quick Inventory Summary */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Equipped Consumables:</p>
                    <p className="text-xl font-bold text-green-400">
                      {gameState?.equippedConsumables?.length || 0} / {gameState?.maxConsumableSlots || 3}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Total Consumables:</p>
                    <p className="text-xl font-bold text-orange-400">{gameState?.consumables?.length || 0}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm text-center italic">
                Access full deck and talents from the main menu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
