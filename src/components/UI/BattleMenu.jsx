import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useRouter } from '../../hooks/useRouter';
import { Settings, Home, BarChart3, X, Volume2, Zap, Monitor } from 'lucide-react';
import { NBButton, NBCard, NBHeading, NBBadge, NBDivider } from './NeoBrutalUI';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 animate-fadeIn p-4">
      <div className="nb-border-xl nb-shadow-xl nb-bg-white max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        {/* Main Menu */}
        {currentView === 'main' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <NBHeading level={2}>🎮 GAME MENU</NBHeading>
              <button
                onClick={onClose}
                className="nb-btn nb-bg-red px-4 py-2 text-2xl font-black hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <NBButton
                onClick={handleReturnToMain}
                variant="danger"
                size="lg"
                className="w-full flex items-center justify-center gap-3"
              >
                <Home className="w-6 h-6" />
                <span>Return to Main Menu</span>
              </NBButton>

              <NBButton
                onClick={() => setCurrentView('settings')}
                variant="info"
                size="lg"
                className="w-full flex items-center justify-center gap-3"
              >
                <Settings className="w-6 h-6" />
                <span>Settings</span>
              </NBButton>

              <NBButton
                onClick={() => setCurrentView('stats')}
                variant="purple"
                size="lg"
                className="w-full flex items-center justify-center gap-3"
              >
                <BarChart3 className="w-6 h-6" />
                <span>View Stats & Inventory</span>
              </NBButton>

              <NBButton
                onClick={onClose}
                variant="white"
                size="lg"
                className="w-full flex items-center justify-center gap-3"
              >
                <X className="w-6 h-6" />
                <span>Close Menu</span>
              </NBButton>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        {currentView === 'settings' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <NBHeading level={2}>⚙️ SETTINGS</NBHeading>
              <NBButton
                onClick={() => setCurrentView('main')}
                variant="white"
                size="sm"
              >
                ← BACK
              </NBButton>
            </div>

            <div className="space-y-6">
              {/* Fullscreen */}
              <NBCard color="yellow" shadow="xl">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="w-6 h-6" />
                  <NBHeading level={3} className="text-2xl">DISPLAY</NBHeading>
                </div>
                <div className="flex items-center justify-between nb-border-lg nb-bg-white p-4">
                  <div>
                    <p className="font-bold text-lg">Fullscreen Mode</p>
                    <p className="text-sm text-gray-600 font-semibold">Press ESC to exit</p>
                  </div>
                  <NBButton
                    onClick={toggleFullscreen}
                    variant={settings.isFullscreen ? 'success' : 'white'}
                    size="sm"
                  >
                    {settings.isFullscreen ? 'ON' : 'OFF'}
                  </NBButton>
                </div>
              </NBCard>

              {/* Performance */}
              <NBCard color="cyan" shadow="xl">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6" />
                  <NBHeading level={3} className="text-2xl">PERFORMANCE</NBHeading>
                </div>
                <div className="space-y-3">
                  {/* Animated Background Toggle */}
                  <label className="flex items-center justify-between cursor-pointer nb-border-lg nb-bg-white p-4 hover:translate-x-1 transition-transform">
                    <div>
                      <p className="font-bold text-lg">Animated Background</p>
                      <p className="text-sm text-gray-600 font-semibold">Torus tunnel effect</p>
                    </div>
                    <div className="relative inline-block w-16 h-8">
                      <input
                        type="checkbox"
                        checked={settings.animatedBackground}
                        onChange={() => toggleSetting('animatedBackground')}
                        className="sr-only peer"
                      />
                      <div className="w-16 h-8 nb-border-lg bg-gray-300 peer-checked:bg-green-400 peer transition-all cursor-pointer"></div>
                      <div className="absolute left-1 top-1 bg-black w-6 h-6 transition-all peer-checked:translate-x-8 nb-border"></div>
                    </div>
                  </label>

                  {/* Particle Effects Toggle */}
                  <label className="flex items-center justify-between cursor-pointer nb-border-lg nb-bg-white p-4 hover:translate-x-1 transition-transform">
                    <div>
                      <p className="font-bold text-lg">Particle Effects</p>
                      <p className="text-sm text-gray-600 font-semibold">Card play explosions</p>
                    </div>
                    <div className="relative inline-block w-16 h-8">
                      <input
                        type="checkbox"
                        checked={settings.particleEffects}
                        onChange={() => toggleSetting('particleEffects')}
                        className="sr-only peer"
                      />
                      <div className="w-16 h-8 nb-border-lg bg-gray-300 peer-checked:bg-green-400 peer transition-all cursor-pointer"></div>
                      <div className="absolute left-1 top-1 bg-black w-6 h-6 transition-all peer-checked:translate-x-8 nb-border"></div>
                    </div>
                  </label>

                  {/* Card Animations Toggle */}
                  <label className="flex items-center justify-between cursor-pointer nb-border-lg nb-bg-white p-4 hover:translate-x-1 transition-transform">
                    <div>
                      <p className="font-bold text-lg">Card Animations</p>
                      <p className="text-sm text-gray-600 font-semibold">Draw and play animations</p>
                    </div>
                    <div className="relative inline-block w-16 h-8">
                      <input
                        type="checkbox"
                        checked={settings.cardAnimations}
                        onChange={() => toggleSetting('cardAnimations')}
                        className="sr-only peer"
                      />
                      <div className="w-16 h-8 nb-border-lg bg-gray-300 peer-checked:bg-green-400 peer transition-all cursor-pointer"></div>
                      <div className="absolute left-1 top-1 bg-black w-6 h-6 transition-all peer-checked:translate-x-8 nb-border"></div>
                    </div>
                  </label>
                </div>
              </NBCard>

              {/* Sound (Future) */}
              <NBCard color="white" shadow="xl" className="opacity-60">
                <div className="flex items-center gap-3 mb-4">
                  <Volume2 className="w-6 h-6" />
                  <NBHeading level={3} className="text-2xl">SOUND</NBHeading>
                  <NBBadge color="orange">Coming Soon</NBBadge>
                </div>
                <div className="space-y-4 nb-border-lg nb-bg-white p-4">
                  <div>
                    <div className="flex justify-between font-bold mb-2">
                      <span>Master Volume</span>
                      <span>{settings.masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.masterVolume}
                      className="w-full h-3 nb-border bg-gray-200 appearance-none cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-2">
                      <span>Music Volume</span>
                      <span>{settings.musicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.musicVolume}
                      className="w-full h-3 nb-border bg-gray-200 appearance-none cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-2">
                      <span>SFX Volume</span>
                      <span>{settings.sfxVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.sfxVolume}
                      className="w-full h-3 nb-border bg-gray-200 appearance-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </NBCard>
            </div>
          </div>
        )}

        {/* Stats & Inventory View */}
        {currentView === 'stats' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <NBHeading level={2}>📊 STATS & INVENTORY</NBHeading>
              <NBButton
                onClick={() => setCurrentView('main')}
                variant="white"
                size="sm"
              >
                ← BACK
              </NBButton>
            </div>

            <div className="space-y-6">
              {/* Stats */}
              <NBCard color="pink" shadow="xl">
                <NBHeading level={3} className="text-2xl mb-6">💪 PLAYER STATS</NBHeading>
                <div className="grid grid-cols-2 gap-4">
                  <div className="nb-border-lg nb-shadow nb-bg-white p-4">
                    <p className="text-gray-600 text-sm font-bold mb-1">HEALTH</p>
                    <p className="text-3xl font-black text-red-600">{gameState?.playerHealth || 0} / {gameState?.maxPlayerHealth || 100}</p>
                  </div>
                  <div className="nb-border-lg nb-shadow nb-bg-white p-4">
                    <p className="text-gray-600 text-sm font-bold mb-1">GOLD</p>
                    <p className="text-3xl font-black text-yellow-500">💰 {gameState?.gold || 0}</p>
                  </div>
                  <div className="nb-border-lg nb-shadow nb-bg-white p-4">
                    <p className="text-gray-600 text-sm font-bold mb-1">FLOOR</p>
                    <p className="text-3xl font-black text-purple-600">{gameState?.currentFloor || 1}</p>
                  </div>
                  <div className="nb-border-lg nb-shadow nb-bg-white p-4">
                    <p className="text-gray-600 text-sm font-bold mb-1">DECK SIZE</p>
                    <p className="text-3xl font-black text-blue-600">{gameState?.deck?.length || 0}</p>
                  </div>
                </div>
              </NBCard>

              {/* Quick Inventory Summary */}
              <NBCard color="green" shadow="xl">
                <NBHeading level={3} className="text-2xl mb-6">🎒 INVENTORY</NBHeading>
                <div className="grid grid-cols-2 gap-4">
                  <div className="nb-border-lg nb-shadow nb-bg-white p-4">
                    <p className="text-gray-600 text-sm font-bold mb-2">EQUIPPED</p>
                    <p className="text-2xl font-black text-green-600">
                      {gameState?.equippedConsumables?.length || 0} / {gameState?.maxConsumableSlots || 3}
                    </p>
                  </div>
                  <div className="nb-border-lg nb-shadow nb-bg-white p-4">
                    <p className="text-gray-600 text-sm font-bold mb-2">TOTAL ITEMS</p>
                    <p className="text-2xl font-black text-orange-600">{gameState?.consumables?.length || 0}</p>
                  </div>
                </div>
              </NBCard>

              <div className="nb-border-lg nb-bg-yellow p-4 text-center">
                <p className="text-sm font-bold italic">
                  💡 Access full deck and talents from the Character menu
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
