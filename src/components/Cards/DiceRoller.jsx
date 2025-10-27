import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceIcon = ({ value }) => {
  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const DiceComponent = diceIcons[value - 1] || Dice1;
  return <DiceComponent className="w-8 h-8" />;
};

export const DiceRoller = ({ isRolling, result, onRollComplete }) => {
  const [currentDice, setCurrentDice] = useState(1);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setCurrentDice(Math.floor(Math.random() * 6) + 1);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setCurrentDice(result);
        setTimeout(() => onRollComplete(), 1000);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isRolling, result, onRollComplete]);

  if (!isRolling && !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl text-center transform transition-all duration-300 scale-100">
        <div className="text-2xl font-bold mb-4">Rolling Dice...</div>
        <div className="flex justify-center mb-4">
          <DiceIcon value={currentDice} />
        </div>
        {!isRolling && result && (
          <div className="text-lg font-semibold text-green-600 animate-pulse">
            Rolled: {result}
          </div>
        )}
      </div>
    </div>
  );
};