import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';

export const DiceRoll = ({ onRollComplete, minValue = 1, maxValue = 6 }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);

  const handleRoll = () => {
    if (hasRolled) return;

    setIsRolling(true);
    setHasRolled(true);

    // Animate the dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * maxValue) + minValue);
      rollCount++;

      if (rollCount >= 15) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * maxValue) + minValue;
        setCurrentValue(finalValue);
        setIsRolling(false);

        setTimeout(() => {
          onRollComplete(finalValue);
        }, 1000);
      }
    }, 100);
  };

  const getDiceColor = () => {
    if (!currentValue) return 'from-gray-400 to-gray-600';
    if (currentValue === maxValue) return 'from-yellow-400 to-amber-600'; // Max roll - gold
    if (currentValue >= maxValue * 0.7) return 'from-green-400 to-emerald-600'; // Good roll
    if (currentValue >= maxValue * 0.4) return 'from-blue-400 to-cyan-600'; // Medium roll
    return 'from-red-400 to-rose-600'; // Low roll
  };

  const getDiceFace = (value) => {
    const dotPositions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [25, 75], [75, 25], [75, 75]],
      5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
      6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    };

    const positions = dotPositions[value] || [];

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {positions.map((pos, idx) => (
          <circle
            key={idx}
            cx={pos[0]}
            cy={pos[1]}
            r="8"
            fill="white"
            className="drop-shadow-lg"
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-4 border-yellow-400">
        <h2 className="text-3xl font-bold text-center text-white mb-6 flex items-center justify-center gap-3">
          <Dices className="w-10 h-10 text-yellow-400" />
          Roll the Dice!
        </h2>

        {/* Dice Display */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              w-40 h-40 rounded-3xl
              bg-gradient-to-br ${getDiceColor()}
              shadow-2xl border-4 border-white
              flex items-center justify-center
              transition-all duration-200
              ${isRolling ? 'animate-spin' : 'animate-bounce'}
              ${currentValue === maxValue ? 'ring-8 ring-yellow-300' : ''}
            `}
          >
            {currentValue ? (
              <div className="w-32 h-32">
                {getDiceFace(currentValue)}
              </div>
            ) : (
              <Dices className="w-24 h-24 text-white opacity-50" />
            )}
          </div>
        </div>

        {/* Current Value Display */}
        {currentValue && (
          <div className="text-center mb-6">
            <div className={`
              text-6xl font-bold
              ${currentValue === maxValue ? 'text-yellow-300 animate-pulse' : 'text-white'}
            `}>
              {currentValue}
            </div>
            {currentValue === maxValue && (
              <div className="text-yellow-300 font-bold text-xl mt-2 animate-pulse">
                ✨ MAXIMUM ROLL! ✨
              </div>
            )}
          </div>
        )}

        {/* Roll Button */}
        {!hasRolled && (
          <button
            onClick={handleRoll}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold text-xl py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all border-2 border-yellow-300"
          >
            🎲 Click to Roll! 🎲
          </button>
        )}

        {hasRolled && !isRolling && (
          <div className="text-center text-white text-sm animate-pulse">
            Applying result...
          </div>
        )}
      </div>
    </div>
  );
};
