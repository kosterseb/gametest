import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Skull, RotateCcw, Crown, Star, TrendingUp, Target, Coins, Zap, Heart, Swords, Save } from 'lucide-react';
import { NBButton, NBHeading, NBBadge, NBCard } from './NeoBrutalUI';
import { hasCheckpoint, loadCheckpoint } from '../../utils/SaveManager';

export const DefeatScreen = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [runEnded, setRunEnded] = useState(false);
  const [levelUps, setLevelUps] = useState(0);
  const [checkpointAvailable, setCheckpointAvailable] = useState(false);
  const [checkpointInfo, setCheckpointInfo] = useState(null);

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

  // Check for checkpoint on mount
  useEffect(() => {
    if (gameState.currentSaveSlot) {
      const hasCP = hasCheckpoint(gameState.currentSaveSlot);
      setCheckpointAvailable(hasCP);

      if (hasCP) {
        const cpData = loadCheckpoint(gameState.currentSaveSlot);
        setCheckpointInfo(cpData);
      }
    }
  }, [gameState.currentSaveSlot]);

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

  const handleLoadCheckpoint = () => {
    console.log('🏕️ Loading from checkpoint...');
    // Load checkpoint data
    dispatch({ type: 'LOAD_CHECKPOINT' });
    // Navigate to map
    navigate('/map');
  };

  if (!gameState.profile) {
    return (
      <PageTransition>
        <div className="min-h-screen nb-bg-red flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Loading...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const runStats = gameState.profile.currentRun?.currentRunStats || {};
  const lifetimeStats = gameState.profile.lifetimeStats;
  const floorReached = gameState.currentFloor - 1; // They died, so previous floor was last completed

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-red p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Defeat Banner */}
          <div className="text-center mb-8">
            <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 mb-6 inline-block animate-pulse">
              <Skull className="w-32 h-32 text-black mx-auto" />
            </div>
            <NBHeading level={1} className="text-black mb-4">
              DEFEATED
            </NBHeading>
            <div className="nb-bg-white nb-border-lg nb-shadow-lg px-6 py-3 inline-block">
              <p className="text-black font-black text-xl uppercase">
                You reached Floor {floorReached}
              </p>
            </div>
          </div>

          {/* Main Stats Card */}
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 mb-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-6 pb-6 nb-border-b-xl">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${gameState.profile.avatarSeed}`}
                alt={gameState.profile.profileName}
                className="w-20 h-20 nb-border-xl"
              />
              <div className="flex-1">
                <NBHeading level={2} className="text-black mb-2">{gameState.profile.profileName}</NBHeading>
                <div className="flex items-center gap-3">
                  <NBBadge color="purple" className="flex items-center gap-1 px-3 py-1">
                    <Crown className="w-5 h-5" />
                    <span>LEVEL {gameState.profile.level}</span>
                  </NBBadge>
                  {gameState.profile.talentPoints > 0 && (
                    <NBBadge color="yellow" className="flex items-center gap-1 px-3 py-1">
                      <Star className="w-5 h-5" />
                      <span>{gameState.profile.talentPoints} TALENT POINTS</span>
                    </NBBadge>
                  )}
                </div>
              </div>
            </div>

            {/* Level Up Notification */}
            {levelUps > 0 && (
              <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-6 mb-6">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-black mx-auto mb-3" />
                  <NBHeading level={3} className="text-black mb-3">
                    LEVEL UP! {levelUps > 1 && `x${levelUps}`}
                  </NBHeading>
                  <p className="text-black font-bold text-lg mb-4 uppercase">
                    Despite defeat, you gained {levelUps} talent {levelUps === 1 ? 'point' : 'points'}!
                  </p>
                  <NBButton
                    onClick={handleViewTalents}
                    variant="primary"
                    size="md"
                  >
                    VIEW TALENT TREE
                  </NBButton>
                </div>
              </div>
            )}

            {/* Encouragement Message */}
            <div className="nb-bg-cyan nb-border-xl nb-shadow-lg p-4 mb-6 text-center">
              <p className="text-black font-bold text-sm uppercase">
                Your progress is saved! Use your XP and talents to grow stronger for the next run!
              </p>
            </div>

            {/* Run Stats */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-black" />
                <NBHeading level={3} className="text-black">THIS RUN</NBHeading>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="nb-bg-red nb-border-lg nb-shadow p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-5 h-5 text-black" />
                    <span className="text-xs text-black font-bold uppercase">Enemies</span>
                  </div>
                  <div className="text-2xl font-black text-black">{runStats.enemiesKilled || 0}</div>
                </div>

                <div className="nb-bg-orange nb-border-lg nb-shadow p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-black" />
                    <span className="text-xs text-black font-bold uppercase">Damage</span>
                  </div>
                  <div className="text-2xl font-black text-black">{runStats.damageDealt || 0}</div>
                </div>

                <div className="nb-bg-yellow nb-border-lg nb-shadow p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-black" />
                    <span className="text-xs text-black font-bold uppercase">Gold</span>
                  </div>
                  <div className="text-2xl font-black text-black">{runStats.goldEarned || 0}</div>
                </div>

                <div className="nb-bg-blue nb-border-lg nb-shadow p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-black" />
                    <span className="text-xs text-black font-bold uppercase">Cards</span>
                  </div>
                  <div className="text-2xl font-black text-black">{runStats.cardsPlayed || 0}</div>
                </div>
              </div>
            </div>

            {/* Lifetime Stats */}
            <div className="nb-bg-purple nb-border-xl nb-shadow-lg p-6">
              <NBHeading level={3} className="text-black mb-4">LIFETIME STATS</NBHeading>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="nb-bg-white nb-border nb-shadow px-3 py-2">
                  <span className="text-gray-700 font-bold uppercase text-xs">Total Runs:</span>
                  <span className="font-black text-black ml-2 text-lg">{lifetimeStats.totalRuns}</span>
                </div>
                <div className="nb-bg-green nb-border nb-shadow px-3 py-2">
                  <span className="text-gray-800 font-bold uppercase text-xs">Wins:</span>
                  <span className="font-black text-black ml-2 text-lg">{lifetimeStats.totalWins}</span>
                </div>
                <div className="nb-bg-red nb-border nb-shadow px-3 py-2">
                  <span className="text-gray-800 font-bold uppercase text-xs">Deaths:</span>
                  <span className="font-black text-black ml-2 text-lg">{lifetimeStats.totalDeaths}</span>
                </div>
                <div className="nb-bg-cyan nb-border nb-shadow px-3 py-2">
                  <span className="text-gray-800 font-bold uppercase text-xs">Best Floor:</span>
                  <span className="font-black text-black ml-2 text-lg">{lifetimeStats.bestFloor}</span>
                </div>
                <div className="nb-bg-orange nb-border nb-shadow px-3 py-2">
                  <span className="text-gray-800 font-bold uppercase text-xs">Enemies:</span>
                  <span className="font-black text-black ml-2 text-lg">{lifetimeStats.totalEnemiesKilled}</span>
                </div>
                <div className="nb-bg-pink nb-border nb-shadow px-3 py-2">
                  <span className="text-gray-800 font-bold uppercase text-xs">Damage:</span>
                  <span className="font-black text-black ml-2 text-lg">{lifetimeStats.totalDamageDealt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkpoint Info (if available) */}
          {checkpointAvailable && checkpointInfo && (
            <div className="nb-bg-cyan nb-border-xl nb-shadow-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Save className="w-8 h-8 text-black" />
                <NBHeading level={3} className="text-black">CHECKPOINT AVAILABLE</NBHeading>
              </div>
              <p className="text-black font-bold mb-2">
                You can load your last rest point from:
              </p>
              <div className="flex gap-3">
                <NBBadge color="purple" className="px-4 py-2">
                  ACT {checkpointInfo.checkpointAct}
                </NBBadge>
                <NBBadge color="orange" className="px-4 py-2">
                  FLOOR {checkpointInfo.checkpointFloor}
                </NBBadge>
                <NBBadge color="pink" className="px-4 py-2">
                  {checkpointInfo.gold} GOLD
                </NBBadge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            {checkpointAvailable && (
              <NBButton
                onClick={handleLoadCheckpoint}
                variant="success"
                size="xl"
                className="flex items-center gap-2 animate-pulse"
              >
                <Save className="w-6 h-6" />
                <span>LOAD CHECKPOINT</span>
              </NBButton>
            )}

            <NBButton
              onClick={handleTryAgain}
              variant="danger"
              size="xl"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              <span>TRY AGAIN</span>
            </NBButton>

            <NBButton
              onClick={handleViewTalents}
              variant="purple"
              size="xl"
              className="flex items-center gap-2"
            >
              <Star className="w-6 h-6" />
              <span>TALENT TREE</span>
            </NBButton>

            <NBButton
              onClick={handleMainMenu}
              variant="white"
              size="xl"
            >
              MAIN MENU
            </NBButton>
          </div>

          {/* Motivational Quote */}
          <div className="text-center mt-8">
            <div className="nb-bg-white nb-border-lg nb-shadow px-8 py-4 inline-block">
              <p className="text-black font-black text-lg uppercase">
                Every defeat makes you stronger. Rise again, champion!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};