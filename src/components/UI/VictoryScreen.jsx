import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Trophy, Crown, Star, TrendingUp, Target, Coins, Zap, Heart, Swords } from 'lucide-react';
import { NBButton, NBHeading, NBBadge, NBCard } from './NeoBrutalUI';
import { HeartsBackground } from '../Battle/HeartsBackground';

// Count-up animation component
const CountUp = ({ end, duration = 2000, prefix = '', suffix = '', onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = percentage * (2 - percentage);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuad);

      setCount(currentCount);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, onComplete]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export const VictoryScreen = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const [runEnded, setRunEnded] = useState(false);
  const [levelUps, setLevelUps] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [totalGold, setTotalGold] = useState(0);
  const [totalExp, setTotalExp] = useState(0);

  useEffect(() => {
    if (!runEnded && gameState.profile) {
      // Capture rewards before ending run
      const currentRunStats = gameState.profile.currentRun?.currentRunStats || {};
      setTotalGold(currentRunStats.goldEarned || 0);

      // Calculate total exp from the run (approximation based on enemies killed and bosses)
      const enemiesKilled = currentRunStats.enemiesKilled || 0;
      const estimatedExp = enemiesKilled * 15; // Rough estimate
      setTotalExp(estimatedExp);

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

      // Trigger entrance animation after a short delay
      setTimeout(() => {
        setShowRewards(true);
      }, 500);
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
        <div className="min-h-screen nb-bg-yellow flex items-center justify-center">
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8">
            <div className="text-black text-2xl font-black uppercase">Loading...</div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const runStats = gameState.profile.currentRun?.currentRunStats || {};
  const lifetimeStats = gameState.profile.lifetimeStats;

  return (
    <>
      {/* Animated Hearts Background - Outside PageTransition to avoid stacking context issues */}
      <HeartsBackground />

      <PageTransition>
        <div className="h-screen relative p-8 flex items-center justify-center" style={{ zIndex: 100, backgroundColor: 'transparent' }}>
          {/* Content with entrance animation */}
          <div className={`max-w-4xl w-full relative transition-all duration-700 ${showRewards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Victory Banner */}
          <div className="text-center mb-8">
            <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 mb-6 inline-block animate-bounce">
              <Trophy className="w-32 h-32 text-black mx-auto" />
            </div>
            <NBHeading level={1} className="text-black mb-4 drop-shadow-lg" style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
              VICTORY!
            </NBHeading>
            <div className="nb-bg-white nb-border-lg nb-shadow-lg px-6 py-3 inline-block">
              <p className="text-black font-black text-xl uppercase">
                You've conquered all 25 floors!
              </p>
            </div>
          </div>

          {/* Rewards Display - Animated Count-up */}
          <div className={`grid grid-cols-2 gap-6 mb-8 transition-all duration-500 delay-300 ${showRewards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Gold Reward */}
            <div className="nb-bg-yellow nb-border-xl nb-shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative z-10 text-center">
                <Coins className="w-16 h-16 text-black mx-auto mb-3 drop-shadow-lg" />
                <div className="text-black font-black text-sm uppercase mb-2">Gold Earned</div>
                <div className="text-6xl font-black text-black drop-shadow-lg">
                  {showRewards && <CountUp end={totalGold} duration={2000} />}
                </div>
              </div>
            </div>

            {/* Experience Reward */}
            <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative z-10 text-center">
                <Star className="w-16 h-16 text-black mx-auto mb-3 drop-shadow-lg" />
                <div className="text-black font-black text-sm uppercase mb-2">Experience</div>
                <div className="text-6xl font-black text-black drop-shadow-lg">
                  {showRewards && <CountUp end={totalExp} duration={2000} suffix=" XP" />}
                </div>
              </div>
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
              <div className="nb-bg-yellow nb-border-xl nb-shadow-xl p-6 mb-6 animate-pulse">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-black mx-auto mb-3" />
                  <NBHeading level={3} className="text-black mb-3">
                    LEVEL UP! {levelUps > 1 && `x${levelUps}`}
                  </NBHeading>
                  <p className="text-black font-bold text-lg mb-4 uppercase">
                    You gained {levelUps} talent {levelUps === 1 ? 'point' : 'points'}!
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

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <NBButton
              onClick={handlePlayAgain}
              variant="success"
              size="xl"
              className="flex items-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              <span>PLAY AGAIN</span>
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

          {/* Flavor Text */}
          <div className="text-center mt-8">
            <div className="nb-bg-white nb-border-lg nb-shadow px-8 py-4 inline-block">
              <p className="text-black font-black text-lg uppercase">
                Congratulations, Champion!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
    </>
  );
};