import React, { useState, useEffect } from 'react';
import { Coins, Star, Heart, ArrowUp, ArrowDown } from 'lucide-react';
import { NBButton, NBHeading } from './NeoBrutalUI';

export const BattleRecapPopup = ({
  goldBefore,
  goldAfter,
  expBefore,
  expAfter,
  levelBefore,
  levelAfter,
  hpBefore,
  hpAfter,
  maxHp,
  onContinue
}) => {
  const [animationStage, setAnimationStage] = useState(0); // 0: gold, 1: exp, 2: hp, 3: complete
  const [currentGold, setCurrentGold] = useState(goldBefore);
  const [currentExp, setCurrentExp] = useState(expBefore);
  const [showContinue, setShowContinue] = useState(false);

  // Prevent scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const goldGained = goldAfter - goldBefore;
  const expGained = expAfter - expBefore;
  const hpChange = hpAfter - hpBefore;
  const leveledUp = levelAfter > levelBefore;

  // Gold animation
  useEffect(() => {
    if (animationStage !== 0) return;

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing
      const easeOutQuad = progress * (2 - progress);
      const current = Math.floor(goldBefore + (goldGained * easeOutQuad));

      setCurrentGold(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentGold(goldAfter);
        setTimeout(() => setAnimationStage(1), 500);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 300);

    return () => clearTimeout(timer);
  }, [animationStage, goldBefore, goldAfter, goldGained]);

  // Exp animation
  useEffect(() => {
    if (animationStage !== 1) return;

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing
      const easeOutQuad = progress * (2 - progress);
      const current = Math.floor(expBefore + (expGained * easeOutQuad));

      setCurrentExp(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentExp(expAfter);
        setTimeout(() => setAnimationStage(2), 500);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 300);

    return () => clearTimeout(timer);
  }, [animationStage, expBefore, expAfter, expGained]);

  // HP reveal and continue button
  useEffect(() => {
    if (animationStage !== 2) return;

    const timer = setTimeout(() => {
      setAnimationStage(3);
      setTimeout(() => setShowContinue(true), 300);
    }, 1000);

    return () => clearTimeout(timer);
  }, [animationStage]);

  // Calculate exp bar progress
  const expPerLevel = 100; // Adjust based on your leveling system
  const expProgress = leveledUp ? 100 : ((currentExp % expPerLevel) / expPerLevel) * 100;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 max-w-2xl w-full mx-4 animate-fadeIn">
        <NBHeading level={1} className="text-black text-center mb-8">
          BATTLE COMPLETE!
        </NBHeading>

        <div className="space-y-6">
          {/* Gold Display */}
          <div className={`nb-bg-yellow nb-border-xl nb-shadow-lg p-6 transition-all duration-500 ${animationStage >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="w-12 h-12 text-black" />
                <div>
                  <div className="text-sm font-black uppercase text-black">Gold</div>
                  <div className="text-4xl font-black text-black">{currentGold.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black uppercase text-green-700">+{goldGained}</div>
                <div className="text-xs font-bold text-black">Earned</div>
              </div>
            </div>
          </div>

          {/* Experience Display with Bar */}
          <div className={`nb-bg-purple nb-border-xl nb-shadow-lg p-6 transition-all duration-500 delay-100 ${animationStage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-12 h-12 text-black" />
                <div>
                  <div className="text-sm font-black uppercase text-black">Experience</div>
                  <div className="text-4xl font-black text-black">{currentExp.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black uppercase text-green-700">+{expGained} XP</div>
                {leveledUp && (
                  <div className="text-xs font-bold text-yellow-600 animate-pulse">🎉 LEVEL UP!</div>
                )}
              </div>
            </div>

            {/* Exp Progress Bar */}
            <div className="nb-bg-white nb-border p-2">
              <div className="relative h-6 bg-gray-200 nb-border">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-1000 ease-out"
                  style={{ width: `${expProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-black drop-shadow-lg">
                    {leveledUp ? `LEVEL ${levelAfter}!` : `LEVEL ${levelBefore}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HP Display */}
          <div className={`nb-bg-${hpChange >= 0 ? 'green' : 'red'} nb-border-xl nb-shadow-lg p-6 transition-all duration-500 delay-200 ${animationStage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-12 h-12 text-black" />
                <div>
                  <div className="text-sm font-black uppercase text-black">Health</div>
                  <div className="text-4xl font-black text-black">{hpAfter}/{maxHp}</div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                {hpChange !== 0 && (
                  <>
                    {hpChange > 0 ? (
                      <ArrowUp className="w-6 h-6 text-green-700" />
                    ) : (
                      <ArrowDown className="w-6 h-6 text-red-700" />
                    )}
                    <div>
                      <div className={`text-sm font-black uppercase ${hpChange > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {hpChange > 0 ? '+' : ''}{hpChange} HP
                      </div>
                      <div className="text-xs font-bold text-black">
                        {hpChange > 0 ? 'Healed' : 'Damage Taken'}
                      </div>
                    </div>
                  </>
                )}
                {hpChange === 0 && (
                  <div className="text-sm font-black uppercase text-black">No Change</div>
                )}
              </div>
            </div>

            {/* HP Bar */}
            <div className="mt-4 nb-bg-white nb-border p-2">
              <div className="relative h-6 bg-gray-200 nb-border">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${hpChange >= 0 ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'} transition-all duration-500`}
                  style={{ width: `${(hpAfter / maxHp) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {showContinue && (
          <div className="mt-8 text-center animate-fadeIn">
            <NBButton
              onClick={onContinue}
              variant="success"
              size="xl"
              className="px-12"
            >
              CONTINUE
            </NBButton>
          </div>
        )}
      </div>
    </div>
  );
};
