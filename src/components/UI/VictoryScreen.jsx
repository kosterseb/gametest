import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Trophy, Crown, Star, TrendingUp, Target, Coins, Zap, Heart, Swords } from 'lucide-react';

export const VictoryScreen = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [runEnded, setRunEnded] = useState(false);
  const [levelUps, setLevelUps] = useState(0);

  useEffect(() => {
    if (!runEnded && gameState.profile) {
      // Save the current level before ending run
      const levelBefore = gameState.profile.level;
      
      // End the run (this merges stats and resets current run)
      dispatch({ type: 'END_RUN', victory: true });
      
      // Calculate level ups that happened during this run
      const levelAfter = gameState.profile.level;
      setLevelUps(levelAfter - levelBefore);
      
      // Save the profile
      dispatch({ type: 'SAVE_PROFILE' });
      
      setRunEnded(true);
    }
  }, [runEnded, gameState.profile, dispatch]);

  const handlePlayAgain = () => {
    // Start a new run
    dispatch({ type: 'START_NEW_RUN' });
    
    // Navigate to map
    navigate('/map');
  };

  const handleViewTalents = () => {
    dispatch({ type: 'OPEN_MENU', tab: 'talents' });
  };

  const handleMainMenu = () => {
    navigate('/save-select');
  };

  if (!gameState.profile) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  const runStats = gameState.profile.currentRun?.currentRunStats || {};
  const lifetimeStats = gameState.profile.lifetimeStats;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Victory Banner */}
          <div className="text-center mb-8 animate-bounce">
            <Trophy className="w-32 h-32 text-yellow-300 mx-auto mb-4 drop-shadow-2xl" />
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              VICTORY!
            </h1>
            <p className="text-2xl text-yellow-100 drop-shadow">
              You've conquered all 25 floors!
            </p>
          </div>

          {/* Main Stats Card */}
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 mb-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${gameState.profile.avatarSeed}`}
                alt={gameState.profile.profileName}
                className="w-20 h-20 rounded-full border-4 border-yellow-400"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800">{gameState.profile.profileName}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-purple-600">
                    <Crown className="w-5 h-5" />
                    <span className="font-bold">Level {gameState.profile.level}</span>
                  </div>
                  {gameState.profile.talentPoints > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-5 h-5" />
                      <span className="font-bold">{gameState.profile.talentPoints} Talent Points</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Level Up Notification */}
            {levelUps > 0 && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-400 rounded-xl p-6 mb-6 animate-pulse">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                    Level Up! {levelUps > 1 && `x${levelUps}`}
                  </h3>
                  <p className="text-yellow-700 mb-3">
                    You gained {levelUps} talent {levelUps === 1 ? 'point' : 'points'}!
                  </p>
                  <button
                    onClick={handleViewTalents}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105"
                  >
                    View Talent Tree
                  </button>
                </div>
              </div>
            )}

            {/* Run Stats */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                This Run
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Swords className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-gray-600">Enemies Killed</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{runStats.enemiesKilled || 0}</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-600">Damage Dealt</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{runStats.damageDealt || 0}</div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">Gold Earned</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{runStats.goldEarned || 0}</div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Cards Played</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{runStats.cardsPlayed || 0}</div>
                </div>
              </div>
            </div>

            {/* Lifetime Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Lifetime Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Runs:</span>
                  <span className="font-bold text-gray-800 ml-2">{lifetimeStats.totalRuns}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Wins:</span>
                  <span className="font-bold text-green-600 ml-2">{lifetimeStats.totalWins}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Deaths:</span>
                  <span className="font-bold text-red-600 ml-2">{lifetimeStats.totalDeaths}</span>
                </div>
                <div>
                  <span className="text-gray-600">Best Floor:</span>
                  <span className="font-bold text-purple-600 ml-2">{lifetimeStats.bestFloor}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Enemies:</span>
                  <span className="font-bold text-orange-600 ml-2">{lifetimeStats.totalEnemiesKilled}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Damage:</span>
                  <span className="font-bold text-red-600 ml-2">{lifetimeStats.totalDamageDealt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePlayAgain}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              Play Again
            </button>

            <button
              onClick={handleViewTalents}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Star className="w-6 h-6" />
              Talent Tree
            </button>

            <button
              onClick={handleMainMenu}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Main Menu
            </button>
          </div>

          {/* Flavor Text */}
          <div className="text-center mt-8">
            <p className="text-white text-lg drop-shadow">
              🎉 Congratulations, Champion! 🎉
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};