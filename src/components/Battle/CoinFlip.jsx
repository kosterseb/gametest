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
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-4 border-amber-400">
        <h2 className="text-3xl font-bold text-center text-white mb-2 flex items-center justify-center gap-3">
          <Coins className="w-10 h-10 text-amber-400 animate-pulse" />
          Who Strikes First?
        </h2>
        <p className="text-center text-amber-200 mb-6 text-sm">
          Flip the coin to decide turn order!
        </p>

        {/* Coin Display */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              w-48 h-48 rounded-full
              bg-gradient-to-br ${getCoinGradient()}
              shadow-2xl border-8 border-amber-300
              flex items-center justify-center
              transition-all duration-200
              ${isFlipping ? 'animate-spin' : (result && !isFlipping ? 'animate-bounce' : '')}
              ${result && !isFlipping ? 'ring-8 ring-amber-200' : ''}
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
                <Coins className="w-24 h-24 text-amber-900 opacity-50" />
              )}
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && !isFlipping && (
          <div className="text-center mb-6 animate-fade-in">
            <div className={`
              text-5xl font-bold mb-3
              ${result === 'heads' ? 'text-cyan-300' : 'text-rose-300'}
            `}>
              {result === 'heads' ? '👤 HEADS' : '👹 TAILS'}
            </div>
            <div className="bg-amber-500 bg-opacity-20 border-2 border-amber-400 rounded-lg p-4">
              <div className="text-white text-xl font-bold mb-1">
                {getWinner()} goes first!
              </div>
              <div className="text-amber-200 text-sm">
                {result === 'heads' ? 'Player advantage!' : 'Enemy strikes first!'}
              </div>
            </div>
          </div>
        )}

        {/* Flip Button */}
        {!hasFlipped && (
          <button
            onClick={handleFlip}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 font-bold text-xl py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all border-2 border-amber-300"
          >
            🪙 Flip the Coin! 🪙
          </button>
        )}

        {hasFlipped && isFlipping && (
          <div className="text-center text-amber-300 text-lg font-bold animate-pulse">
            Flipping...
          </div>
        )}

        {hasFlipped && !isFlipping && (
          <div className="text-center text-white text-sm animate-pulse">
            Preparing battle...
          </div>
        )}
      </div>
    </div>
  );
};
