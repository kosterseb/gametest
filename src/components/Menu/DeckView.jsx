import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../Cards/Card';
import { BookOpen, Check, X } from 'lucide-react';

export const DeckView = () => {
  const { gameState, dispatch } = useGame();
  const [filterType, setFilterType] = useState('all');

  const unlockedCards = gameState.unlockedCards || [];
  const selectedCardNames = gameState.selectedCardTypes || [];

  const handleToggleCard = (card) => {
    console.log('Toggling card:', card.name); // DEBUG
    const isSelected = selectedCardNames.includes(card.name);

    if (isSelected) {
      // Deselect
      if (selectedCardNames.length <= 3) {
        alert('You must have at least 3 cards in your deck!');
        return;
      }
      dispatch({ type: 'DESELECT_CARD', cardName: card.name });
    } else {
      // Select
      if (selectedCardNames.length >= gameState.maxSelectedCards) {
        alert(`Deck is full! Maximum ${gameState.maxSelectedCards} cards.`);
        return;
      }
      dispatch({ type: 'SELECT_CARD', cardName: card.name });
    }
  };

  const filteredCards = filterType === 'all' 
    ? unlockedCards 
    : unlockedCards.filter(card => card.type === filterType);

  const cardTypes = [
    { id: 'all', label: 'All', color: 'bg-gray-600' },
    { id: 'damage', label: 'Damage', color: 'bg-red-600' },
    { id: 'heal', label: 'Heal', color: 'bg-green-600' },
    { id: 'utility', label: 'Utility', color: 'bg-blue-600' },
    { id: 'cleanse', label: 'Cleanse', color: 'bg-purple-600' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 rounded-t-xl -mt-6 -mx-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-3xl font-bold text-white">Your Deck</h2>
              <p className="text-purple-200">
                {selectedCardNames.length} / {gameState.maxSelectedCards} cards selected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {cardTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id)}
            className={`
              ${filterType === type.id ? type.color : 'bg-gray-700'}
              text-white px-4 py-2 rounded-lg font-semibold transition-all
              hover:scale-105
            `}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No cards unlocked yet</p>
          <p className="text-sm">Defeat enemies to earn card rewards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card, index) => {
            const isSelected = selectedCardNames.includes(card.name);

            return (
              <div key={index} className="relative">
                {/* Card Component */}
                <Card
                  card={card}
                  onClick={() => handleToggleCard(card)}
                  disabled={false}
                  compact={true}
                  draggable={false}
                  showCost={false}
                />
                
                {/* Selection Indicator Overlay */}
                <div 
                  className="absolute -top-2 -right-2 pointer-events-none z-20"
                >
                  <div className={`
                    w-10 h-10 rounded-full border-4 border-white shadow-lg
                    flex items-center justify-center transition-all
                    ${isSelected ? 'bg-green-500' : 'bg-gray-400'}
                  `}>
                    {isSelected ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <X className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Click cards to add/remove them from your battle deck</p>
        <p className="mt-1">Minimum: 3 cards • Maximum: {gameState.maxSelectedCards} cards</p>
      </div>
    </div>
  );
};