import React from 'react';
import { useGame } from '../../context/GameContext';
import { Heart, Zap, Layers, Hand, Coins, Map } from 'lucide-react';

export const StatsView = () => {
  const { gameState } = useGame();

  // Safety checks
  const unlockedCards = gameState.unlockedCards || [];
  const selectedCardTypes = gameState.selectedCardTypes || [];
  const completedNodes = gameState.completedNodes || [];

  const statItems = [
    { 
      icon: Heart, 
      label: 'Health', 
      value: `${gameState.playerHealth} / ${gameState.maxPlayerHealth}`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    },
    { 
      icon: Zap, 
      label: 'Max Energy', 
      value: gameState.maxEnergy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    { 
      icon: Layers, 
      label: 'Max Hand Size', 
      value: gameState.maxHandSize,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300'
    },
    { 
      icon: Hand, 
      label: 'Max Deck Size', 
      value: gameState.maxSelectedCards,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    { 
      icon: Coins, 
      label: 'Gold', 
      value: gameState.gold,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300'
    },
    { 
      icon: Map, 
      label: 'Current Floor', 
      value: `${gameState.currentFloor} / 25`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-300'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-2">Character Stats</h3>
        <p className="text-gray-600">Your current run statistics and progression</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={index}
              className={`
                ${stat.bgColor} ${stat.borderColor}
                border-2 rounded-lg p-4 flex items-center gap-4
                transition-all duration-200 hover:shadow-lg
              `}
            >
              <div className={`${stat.color} bg-white p-3 rounded-full`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h4 className="text-lg font-bold mb-3">Run Progress</h4>
        
        {/* Act Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">Act {gameState.currentAct}</span>
            <span className="text-gray-600">Floor {gameState.currentFloor} / 25</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(gameState.currentFloor / 25) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Nodes Completed */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">Nodes Completed</span>
            <span className="text-gray-600">{gameState.completedNodes.length} / 25</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(gameState.completedNodes.length / 25) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card Collection Stats */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h4 className="text-lg font-bold mb-3">Card Collection</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 text-center">
            <div className="text-3xl font-bold text-purple-600">{gameState.unlockedCards.length}</div>
            <div className="text-sm text-gray-600">Cards Unlocked</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
            <div className="text-3xl font-bold text-green-600">{gameState.selectedCardTypes.length}</div>
            <div className="text-sm text-gray-600">Active in Deck</div>
          </div>
        </div>
      </div>

      {/* Unlocks Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h4 className="text-lg font-bold mb-3">Abilities Unlocked</h4>
        <div className="space-y-2">
          <div className={`flex items-center gap-2 p-2 rounded ${gameState.hasDrawAbility ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full ${gameState.hasDrawAbility ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="font-medium">Draw Card Ability</span>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded ${gameState.hasDiscardAbility ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full ${gameState.hasDiscardAbility ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="font-medium">Discard Card Ability</span>
          </div>
        </div>
      </div>
    </div>
  );
};