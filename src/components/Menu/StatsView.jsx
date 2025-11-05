import React from 'react';
import { useGame } from '../../context/GameContext';
import { Heart, Zap, Layers, Hand, Coins, Map } from 'lucide-react';
import { NBHeading, NBBadge, NBProgressBar } from '../UI/NeoBrutalUI';

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
      bgColor: 'nb-bg-red'
    },
    {
      icon: Zap,
      label: 'Max Energy',
      value: gameState.maxEnergy,
      bgColor: 'nb-bg-blue'
    },
    {
      icon: Layers,
      label: 'Max Hand Size',
      value: gameState.maxHandSize,
      bgColor: 'nb-bg-purple'
    },
    {
      icon: Hand,
      label: 'Max Deck Size',
      value: gameState.maxSelectedCards,
      bgColor: 'nb-bg-green'
    },
    {
      icon: Coins,
      label: 'Gold',
      value: gameState.gold,
      bgColor: 'nb-bg-yellow'
    },
    {
      icon: Map,
      label: 'Current Floor',
      value: `${gameState.currentFloor} / 25`,
      bgColor: 'nb-bg-cyan'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 nb-bg-purple nb-border-xl nb-shadow-lg p-6">
        <NBHeading level={3} className="text-black mb-2">CHARACTER STATS</NBHeading>
        <div className="nb-bg-white nb-border-lg nb-shadow px-4 py-2 inline-block">
          <p className="text-black font-bold text-sm uppercase">Your current run statistics and progression</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className={`
                ${stat.bgColor}
                nb-border-lg nb-shadow
                p-4 flex items-center gap-4
                transition-all duration-200
              `}
            >
              <div className="nb-bg-white nb-border nb-shadow p-3">
                <Icon className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-black font-bold uppercase">{stat.label}</div>
                <div className="text-2xl font-black text-black">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Section */}
      <div className="mt-6 nb-bg-orange nb-border-xl nb-shadow-lg p-6">
        <NBHeading level={4} className="text-black mb-4">RUN PROGRESS</NBHeading>

        {/* Act Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2 text-black font-bold uppercase">
            <span>Act {gameState.currentAct}</span>
            <span>Floor {gameState.currentFloor} / 25</span>
          </div>
          <NBProgressBar
            value={gameState.currentFloor}
            max={25}
            color="purple"
            label=""
            showValue={false}
          />
        </div>

        {/* Nodes Completed */}
        <div>
          <div className="flex justify-between text-sm mb-2 text-black font-bold uppercase">
            <span>Nodes Completed</span>
            <span>{gameState.completedNodes.length} / 25</span>
          </div>
          <NBProgressBar
            value={gameState.completedNodes.length}
            max={25}
            color="green"
            label=""
            showValue={false}
          />
        </div>
      </div>

      {/* Card Collection Stats */}
      <div className="mt-6 nb-bg-cyan nb-border-xl nb-shadow-lg p-6">
        <NBHeading level={4} className="text-black mb-4">CARD COLLECTION</NBHeading>
        <div className="grid grid-cols-2 gap-4">
          <div className="nb-bg-purple nb-border-lg nb-shadow p-4 text-center">
            <div className="text-3xl font-black text-black">{gameState.unlockedCards.length}</div>
            <div className="text-xs text-black font-bold uppercase">Cards Unlocked</div>
          </div>
          <div className="nb-bg-green nb-border-lg nb-shadow p-4 text-center">
            <div className="text-3xl font-black text-black">{gameState.selectedCardTypes.length}</div>
            <div className="text-xs text-black font-bold uppercase">Active in Deck</div>
          </div>
        </div>
      </div>

      {/* Unlocks Section */}
      <div className="mt-6 nb-bg-yellow nb-border-xl nb-shadow-lg p-6">
        <NBHeading level={4} className="text-black mb-4">ABILITIES UNLOCKED</NBHeading>
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 nb-border-lg nb-shadow ${gameState.hasDrawAbility ? 'nb-bg-green' : 'nb-bg-white'}`}>
            <div className={`w-4 h-4 nb-border nb-shadow ${gameState.hasDrawAbility ? 'nb-bg-green' : 'nb-bg-white'}`}></div>
            <span className="font-black uppercase text-black">Draw Card Ability</span>
          </div>
          <div className={`flex items-center gap-3 p-3 nb-border-lg nb-shadow ${gameState.hasDiscardAbility ? 'nb-bg-green' : 'nb-bg-white'}`}>
            <div className={`w-4 h-4 nb-border nb-shadow ${gameState.hasDiscardAbility ? 'nb-bg-green' : 'nb-bg-white'}`}></div>
            <span className="font-black uppercase text-black">Discard Card Ability</span>
          </div>
        </div>
      </div>
    </div>
  );
};