import React from 'react';
import { Card } from './Card';
import { Plus, X } from 'lucide-react';

export const PlayerHand = ({
  cards,
  maxHandSize,
  onCardPlay,
  onDrawCard,
  playerEnergy,
  turnCount,
  disabled,
  hasDrawnThisTurn,
  discardMode,
  hasDiscardedThisTurn,
  onToggleDiscard,
  hasDrawAbility,
  hasDiscardAbility,
  playerStatuses
}) => {
  return (
    <div className="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">
            Your Hand ({cards.length}/{maxHandSize})
          </h3>
          {discardMode && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              DISCARD MODE
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Draw Button */}
          {hasDrawAbility && (
            <button
              onClick={onDrawCard}
              disabled={disabled || hasDrawnThisTurn || cards.length >= maxHandSize}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Draw (3⚡)
            </button>
          )}

          {/* Discard Toggle */}
          {hasDiscardAbility && (
            <button
              onClick={onToggleDiscard}
              disabled={disabled || hasDiscardedThisTurn}
              className={`
                ${discardMode ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
                text-white px-4 py-2 rounded-lg font-semibold transition-all 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
              `}
            >
              {discardMode ? <X className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {discardMode ? 'Cancel' : 'Discard'}
            </button>
          )}
        </div>
      </div>

      {/* Cards Display */}
      {cards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No cards in hand</p>
          <p className="text-sm">Your hand will auto-refill at the end of your turn</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardPlay(card)}
              disabled={disabled}
              playerEnergy={playerEnergy}
              playerStatuses={playerStatuses}
              discardMode={discardMode}
              compact={false}
            />
          ))}
        </div>
      )}

      {/* Helper Text */}
      {cards.length === 1 && !discardMode && (
        <div className="mt-3 text-center text-sm text-orange-600 font-semibold">
          ⚠️ Warning: Playing your last card deals 3 damage to you!
        </div>
      )}
    </div>
  );
};