import React from 'react';
import { Card } from './Card';

export const CardHand = ({
  hand,
  onCardClick,
  disabled,
  playerEnergy,
  playerStatuses,
  compact = false
}) => {
  const cardCount = hand.length;

  // Calculate arc properties
  const maxSpread = 80; // Maximum rotation spread in degrees
  const baseRotation = cardCount > 1 ? maxSpread / (cardCount - 1) : 0;
  const cardSpacing = Math.min(60, 200 / cardCount); // Dynamic spacing based on card count

  return (
    <div className="relative flex justify-center items-end h-full pt-20">
      {/* Drop zone indicator */}
      <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 rounded-lg border-2 border-dashed border-blue-400/30 flex items-center justify-center">
        <span className="text-blue-300/50 font-bold text-lg">Drag cards here to play</span>
      </div>

      {/* Card fan */}
      <div className="relative flex justify-center items-end" style={{ width: `${Math.max(600, cardCount * cardSpacing + 200)}px`, height: '280px' }}>
        {hand.map((card, index) => {
          const centerIndex = (cardCount - 1) / 2;
          const offset = index - centerIndex;

          // Calculate rotation (cards fan out from center)
          const rotation = offset * (baseRotation / cardCount) * (cardCount > 5 ? 0.7 : 1);

          // Calculate horizontal position
          const horizontalOffset = offset * cardSpacing;

          // Calculate vertical position (arc effect - center cards lower)
          const verticalOffset = Math.abs(offset) * 8;

          // Calculate hover lift
          const hoverTranslateY = -40;

          return (
            <div
              key={card.id}
              className="absolute bottom-0 transition-all duration-300 ease-out hover:z-50"
              style={{
                transform: `
                  translateX(${horizontalOffset}px)
                  translateY(${verticalOffset}px)
                  rotate(${rotation}deg)
                `,
                transformOrigin: 'bottom center',
                left: '50%',
                marginLeft: '-96px', // Half of card width (w-48 = 192px / 2)
              }}
            >
              <div
                className="transition-transform duration-200 ease-out hover:-translate-y-10"
                style={{
                  transformOrigin: 'bottom center'
                }}
              >
                <Card
                  card={card}
                  onClick={() => !disabled && onCardClick(card)}
                  disabled={disabled}
                  playerEnergy={playerEnergy}
                  playerStatuses={playerStatuses}
                  compact={compact}
                  draggable={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty hand message */}
      {hand.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm bg-black bg-opacity-50 px-6 py-3 rounded-lg">
            No cards in hand. End your turn to draw new cards!
          </div>
        </div>
      )}
    </div>
  );
};
