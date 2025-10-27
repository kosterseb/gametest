import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Skull, RotateCcw, Crown, Star, TrendingUp, Target, Coins, Zap, Heart, Swords } from 'lucide-react';

export const DefeatScreen = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [runEnded, setRunEnded] = useState(false);
  const [levelUps, setLevelUps] = useState(0);

  useEffect(() => {
    if (!runEnded && gameState.profile) {
      // Save the current level before ending run
      const levelBefore = gameState.profile.level;
      
      // End the run (this merges stats and resets current run)
      dispatch({ type: 'END_RUN', victory: false });
      
      // Calculate level ups that happened during this run
      const levelAfter = gameState.profile.level;
      setLevelUps(levelAfter - levelBefore);
      
      // Save the profile
      dispatch({ type: 'SAVE_PROFILE' });
      
      setRunEnded(true);
    }
  }, [runEnded, gameState.profile, dispatch]);

  const handleTryAgain = () => {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-red-900 to-black flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  const runStats = gameState.profile.currentRun?.currentRunStats || {};
  const lifetimeStats = gameState.profile.lifetimeStats;
  const floorReached = gameState.currentFloor - 1; // They died, so previous floor was last completed

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-red-900 to-black p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Defeat Banner */}
          <div className="text-center mb-8">
            <Skull className="w-32 h-32 text-red-400 mx-auto mb-4 drop-shadow-2xl animate-pulse" />
            <h1 className="text-6xl font-bold text-red-500 mb-4 drop-shadow-lg">
              DEFEATED
            </h1>
            <p className="text-2xl text-gray-300 drop-shadow">
              You reached Floor {floorReached}
            </p>
          </div>

          {/* Main Stats Card */}
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 mb-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${gameState.profile.avatarSeed}`}
                alt={gameState.profile.profileName}
                className="w-20 h-20 rounded-full border-4 border-red-400"
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
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-4 border-purple-400 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-purple-800 mb-2">
                    Level Up! {levelUps > 1 && `x${levelUps}`}
                  </h3>
                  <p className="text-purple-700 mb-3">
                    Despite defeat, you gained {levelUps} talent {levelUps === 1 ? 'point' : 'points'}!
                  </p>
                  <button
                    onClick={handleViewTalents}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105"
                  >
                    View Talent Tree
                  </button>
                </div>
              </div>
            )}

            {/* Encouragement Message */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-blue-800 font-semibold">
                💪 Your progress is saved! Use your XP and talents to grow stronger for the next run!
              </p>
            </div>

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
              onClick={handleTryAgain}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Try Again
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

          {/* Motivational Quote */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-lg italic drop-shadow">
              "Every defeat makes you stronger. Rise again, champion!"
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};