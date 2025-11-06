import React, { useState } from 'react';
import { Coins } from 'lucide-react';

export const CoinFlip = ({ onFlipComplete, playerName = "YOU", enemyName = "ENEMY" }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null); // 'heads' or 'tails'
  const [hasFlipped, setHasFlipped] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const handleFlip = () => {
    if (hasFlipped) return;

    setIsFlipping(true);
    setHasFlipped(true);
    setFlipCount(0);

    // Animate the coin flipping
    let count = 0;
    const flipInterval = setInterval(() => {
      setResult(count % 2 === 0 ? 'heads' : 'tails');
      setFlipCount(count);
      count++;

      if (count >= 20) {
        clearInterval(flipInterval);
        // Final result: heads = player first, tails = enemy first
        const finalResult = Math.random() < 0.5 ? 'heads' : 'tails';
        setResult(finalResult);
        setIsFlipping(false);

        setTimeout(() => {
          onFlipComplete(finalResult === 'heads' ? 'player' : 'enemy');
        }, 1500);
      }
    }, 100);
  };

  const getCoinGradient = () => {
    if (!result) return 'from-amber-300 to-yellow-500';
    if (result === 'heads') return 'from-blue-400 to-cyan-500'; // Player color
    return 'from-red-400 to-rose-500'; // Enemy color
  };

  const getCoinFace = () => {
    if (!result) return null;

    if (result === 'heads') {
      // Player side - show a crown or star
      return (
        <div className="text-6xl">
          👤
        </div>
      );
    } else {
      // Enemy side - show a skull or monster
      return (
        <div className="text-6xl">
          👹
        </div>
      );
    }
  };

  const getWinner = () => {
    if (result === 'heads') return playerName;
    return enemyName;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-400 to-purple-400 p-8 nb-border-xl nb-shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="nb-bg-orange nb-border-lg nb-shadow px-6 py-3 inline-block mb-3">
            <h2 className="text-3xl font-black text-black flex items-center gap-3 uppercase">
              <Coins className="w-10 h-10 text-black animate-pulse" />
              Who Strikes First?
            </h2>
          </div>
          <div className="nb-bg-white nb-border nb-shadow px-4 py-2 inline-block">
            <p className="text-black font-bold text-sm uppercase">
              Flip the coin to decide turn order!
            </p>
          </div>
        </div>

        {/* Coin Display */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              w-48 h-48 rounded-full
              bg-gradient-to-br ${getCoinGradient()}
              nb-shadow-xl border-8 border-black
              flex items-center justify-center
              transition-all duration-200
              ${isFlipping ? 'animate-spin' : (result && !isFlipping ? 'animate-bounce' : '')}
              ${result && !isFlipping ? 'ring-8 ring-yellow-400' : ''}
              relative
            `}
            style={{
              transform: isFlipping ? `rotateY(${flipCount * 180}deg)` : 'rotateY(0deg)',
              transition: 'transform 0.1s linear'
            }}
          >
            {/* Coin shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-30"></div>

            {/* Coin face */}
            <div className="relative z-10">
              {result ? (
                getCoinFace()
              ) : (
                <Coins className="w-24 h-24 text-black opacity-50" />
              )}
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && !isFlipping && (
          <div className="text-center mb-6 animate-fade-in">
            <div className={`
              ${result === 'heads' ? 'nb-bg-cyan' : 'nb-bg-red'}
              nb-border-xl nb-shadow-xl
              px-6 py-4 inline-block mb-4
            `}>
              <div className="text-5xl font-black text-black">
                {result === 'heads' ? '👤 HEADS' : '👹 TAILS'}
              </div>
            </div>
            <div className="nb-bg-orange nb-border-lg nb-shadow p-4">
              <div className="text-black text-xl font-black uppercase mb-2">
                {getWinner()} goes first!
              </div>
              <div className="nb-bg-white nb-border nb-shadow px-3 py-1 inline-block">
                <div className="text-black font-bold text-sm uppercase">
                  {result === 'heads' ? 'Player advantage!' : 'Enemy strikes first!'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flip Button */}
        {!hasFlipped && (
          <button
            onClick={handleFlip}
            className="w-full nb-bg-yellow nb-border-xl nb-shadow-xl nb-hover-lg nb-active text-black font-black text-xl py-4 uppercase transition-all"
          >
            🪙 Flip the Coin! 🪙
          </button>
        )}

        {hasFlipped && isFlipping && (
          <div className="nb-bg-orange nb-border-lg nb-shadow p-3 text-center">
            <div className="text-black font-black text-lg uppercase animate-pulse">
              Flipping...
            </div>
          </div>
        )}

        {hasFlipped && !isFlipping && (
          <div className="nb-bg-white nb-border-lg nb-shadow p-3 text-center">
            <div className="text-black font-black text-sm uppercase animate-pulse">
              Preparing battle...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
