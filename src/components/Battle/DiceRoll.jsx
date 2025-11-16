import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import './DiceRoll.css';

export const DiceRoll = ({ onRollComplete, minValue = 1, maxValue = 6 }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [finalValue, setFinalValue] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Rotation values for each dice face (1-6)
  // These rotate the cube to show the correct face
  const perFaceRotation = [
    'rotate3d(-0.1, 0.3, -1, 180deg)',        // 1
    'rotate3d(-0.1, 0.6, -0.4, 180deg)',      // 2
    'rotate3d(-0.85, -0.42, 0.73, 180deg)',   // 3
    'rotate3d(-0.8, 0.3, -0.75, 180deg)',     // 4
    'rotate3d(0.3, 0.45, 0.9, 180deg)',       // 5
    'rotate3d(-0.16, 0.6, 0.18, 180deg)'      // 6
  ];

  useEffect(() => {
    // Auto-start the roll when component mounts
    const startDelay = setTimeout(() => {
      // Generate random value
      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      setFinalValue(value);
      setIsRolling(true);

      // Show dice result after throw animation completes (700ms)
      setTimeout(() => {
        setShowResult(true);
      }, 700);
    }, 300);

    return () => clearTimeout(startDelay);
  }, [minValue, maxValue]);

  const handleContinue = () => {
    if (finalValue) {
      onRollComplete(finalValue);
    }
  };

  // Get the appropriate rotation for the final dice value
  const getDiceRotation = () => {
    if (!finalValue) return 'rotate3d(0, 0.9, 0.9, 90deg)';
    return perFaceRotation[finalValue - 1];
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

        {/* 3D Dice Container */}
        <div className="relative w-full h-64 mb-8">
          <div className="dice-wrap">
            <div
              className={`dice ${isRolling ? 'throw' : ''}`}
              style={{
                transform: getDiceRotation()
              }}
            >
              {/* Face 1 - Front */}
              <div className="dice-face front">
                <div className="dot center"></div>
              </div>

              {/* Face 2 - Up */}
              <div className="dice-face up">
                <div className="dot top-left"></div>
                <div className="dot bottom-right"></div>
              </div>

              {/* Face 3 - Left */}
              <div className="dice-face left">
                <div className="dot top-left"></div>
                <div className="dot center"></div>
                <div className="dot bottom-right"></div>
              </div>

              {/* Face 4 - Right */}
              <div className="dice-face right">
                <div className="dot top-left"></div>
                <div className="dot top-right"></div>
                <div className="dot bottom-left"></div>
                <div className="dot bottom-right"></div>
              </div>

              {/* Face 5 - Bottom */}
              <div className="dice-face bottom">
                <div className="dot top-left"></div>
                <div className="dot top-right"></div>
                <div className="dot center"></div>
                <div className="dot bottom-left"></div>
                <div className="dot bottom-right"></div>
              </div>

              {/* Face 6 - Back */}
              <div className="dice-face back">
                <div className="dot top-left"></div>
                <div className="dot top-center"></div>
                <div className="dot top-right"></div>
                <div className="dot bottom-left"></div>
                <div className="dot bottom-center"></div>
                <div className="dot bottom-right"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {showResult && finalValue && (
          <div className="text-center mb-6 animate-bounceIn">
            <div className="nb-bg-white nb-border-xl nb-shadow-xl px-8 py-4 inline-block">
              <div className={`
                text-6xl font-black
                ${finalValue === maxValue ? 'text-yellow-600 animate-pulse' : 'text-black'}
              `}>
                {finalValue}
              </div>
            </div>
            {finalValue === maxValue && (
              <div className="mt-4 nb-bg-yellow nb-border-lg nb-shadow px-4 py-2 inline-block animate-bounce">
                <div className="text-black font-black text-xl uppercase">
                  ✨ MAXIMUM ROLL! ✨
                </div>
              </div>
            )}
          </div>
        )}

        {!showResult && (
          <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center">
            <div className="text-black font-black text-sm uppercase animate-pulse">
              Rolling...
            </div>
          </div>
        )}

        {showResult && (
          <button
            onClick={handleContinue}
            className="w-full nb-bg-green nb-border-xl nb-shadow-xl nb-hover-lg nb-active text-white font-black text-xl py-4 uppercase transition-all"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
