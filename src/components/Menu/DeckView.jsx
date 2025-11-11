import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../Cards/Card';
import { BookOpen, Check, X } from 'lucide-react';
import { NBButton, NBHeading, NBBadge } from '../UI/NeoBrutalUI';

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
    { id: 'all', label: 'All', color: 'white' },
    { id: 'damage', label: 'Damage', color: 'red' },
    { id: 'heal', label: 'Heal', color: 'green' },
    { id: 'utility', label: 'Utility', color: 'blue' },
    { id: 'cleanse', label: 'Cleanse', color: 'purple' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="nb-bg-purple nb-border-xl nb-shadow-lg p-6 -mt-6 -mx-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-black" />
            <div>
              <NBHeading level={2} className="text-black mb-2">YOUR DECK</NBHeading>
              <NBBadge color="yellow" className="px-4 py-2">
                {selectedCardNames.length} / {gameState.maxSelectedCards} CARDS SELECTED
              </NBBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {cardTypes.map(type => (
          <NBButton
            key={type.id}
            onClick={() => setFilterType(type.id)}
            variant={filterType === type.id ? type.color : 'white'}
            size="md"
          >
            {type.label}
          </NBButton>
        ))}
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 nb-bg-white nb-border-xl nb-shadow-lg p-8">
          <p className="text-lg mb-2 font-black text-black uppercase">No cards unlocked yet</p>
          <p className="text-sm text-black font-bold">Defeat enemies to earn card rewards!</p>
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
                    w-10 h-10 nb-border-xl nb-shadow
                    flex items-center justify-center transition-all
                    ${isSelected ? 'nb-bg-green' : 'nb-bg-white'}
                  `}>
                    {isSelected ? (
                      <Check className="w-6 h-6 text-black" />
                    ) : (
                      <X className="w-6 h-6 text-black" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-6 nb-bg-cyan nb-border-xl nb-shadow-lg p-6">
        <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center">
          <p className="text-black font-bold uppercase mb-2">Click cards to add/remove them from your battle deck</p>
          <p className="text-black font-bold">Minimum: 3 cards • Maximum: {gameState.maxSelectedCards} cards</p>
        </div>
      </div>
    </div>
  );
};