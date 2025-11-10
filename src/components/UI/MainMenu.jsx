import React from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { Swords, Settings } from 'lucide-react';
import { AnimatedTitle } from './AnimatedTitle';

export const MainMenu = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();

  const handleStartGame = () => {
    // Navigate to save slot selection instead of starting directly
    navigate('/save-select');
  };

  const handleOpenMenu = () => {
    dispatch({ type: 'OPEN_MENU', tab: 'deck' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      {/* Animated Title */}
      <div className="mb-8">
        <AnimatedTitle text="RETENTA" />
        <p className="text-center text-white text-xl drop-shadow-lg mt-4">
          A Roguelike Card Adventure
        </p>
      </div>

      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <Swords className="w-20 h-20 mx-auto text-purple-600" />
        </div>

        <div className="space-y-4">
          <button
            onClick={handleStartGame}
            className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Adventure
          </button>

          <button
            onClick={handleOpenMenu}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Settings className="w-6 h-6" />
            Menu / Settings
          </button>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>🎴 Build your deck</p>
            <p>⚔️ Battle enemies</p>
            <p>🏆 Defeat bosses</p>
            <p>⭐ Unlock talents & level up!</p>
          </div>
        </div>
      </div>
    </div>
  );
};