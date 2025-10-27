import React from 'react';

export const BattleLog = ({ logs }) => {
  return (
    <div className="bg-white bg-opacity-90 p-6 rounded-xl">
      <h3 className="text-lg font-bold mb-4">Battle Log</h3>
      <div className="space-y-2 h-48 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-sm bg-gray-100 p-2 rounded animate-fade-in">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 text-center">Choose a card to start the battle!</div>
        )}
      </div>
    </div>
  );
};