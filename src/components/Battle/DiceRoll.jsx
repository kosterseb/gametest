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
      <div className="bg-gradient-to-br from-purple-400 to-indigo-400 p-8 nb-border-xl nb-shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="nb-bg-yellow nb-border-lg nb-shadow px-6 py-3 inline-flex items-center gap-3">
            <Dices className="w-10 h-10 text-black" />
            <h2 className="text-3xl font-black text-black uppercase">
              Roll the Dice!
            </h2>
          </div>
        </div>

        {/* Dice Display */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              w-40 h-40
              bg-gradient-to-br ${getDiceColor()}
              nb-border-xl nb-shadow-xl
              flex items-center justify-center
              transition-all duration-200
              ${isRolling ? 'animate-spin' : 'animate-bounce'}
              ${currentValue === maxValue ? 'ring-8 ring-yellow-400' : ''}
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
              nb-bg-white nb-border-xl nb-shadow-xl
              px-8 py-4 inline-block
            `}>
              <div className={`
                text-6xl font-black
                ${currentValue === maxValue ? 'text-yellow-600 animate-pulse' : 'text-black'}
              `}>
                {currentValue}
              </div>
            </div>
            {currentValue === maxValue && (
              <div className="mt-4 nb-bg-yellow nb-border-lg nb-shadow px-4 py-2 inline-block animate-bounce">
                <div className="text-black font-black text-xl uppercase">
                  ✨ MAXIMUM ROLL! ✨
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roll Button */}
        {!hasRolled && (
          <button
            onClick={handleRoll}
            className="w-full nb-bg-yellow nb-border-xl nb-shadow-xl nb-hover-lg nb-active text-black font-black text-xl py-4 uppercase transition-all"
          >
            🎲 Click to Roll! 🎲
          </button>
        )}

        {hasRolled && !isRolling && (
          <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center">
            <div className="text-black font-black text-sm uppercase animate-pulse">
              Applying result...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
