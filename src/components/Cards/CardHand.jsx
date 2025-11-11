import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';

export const CardHand = ({
  hand,
  onCardClick,
  disabled,
  playerEnergy,
  playerStatuses,
  compact = false,
  enableAnimations = true
}) => {
  const cardCount = hand.length;
  const [animatingCards, setAnimatingCards] = useState(new Set());
  const previousHandRef = useRef([]);

  // Detect newly drawn cards and trigger animations
  useEffect(() => {
    // Only track animations if enabled
    if (!enableAnimations) {
      previousHandRef.current = hand;
      return;
    }

    const previousCardIds = new Set(previousHandRef.current.map(c => c.id));
    const newCards = hand.filter(card => !previousCardIds.has(card.id));

    if (newCards.length > 0) {
      const newAnimatingCards = new Set(animatingCards);
      newCards.forEach(card => newAnimatingCards.add(card.id));
      setAnimatingCards(newAnimatingCards);

      // Remove animation state after animation completes
      setTimeout(() => {
        setAnimatingCards(new Set());
      }, 800); // Animation duration
    }

    previousHandRef.current = hand;
  }, [hand, enableAnimations]);

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

          // Check if this card is newly drawn (only if animations enabled)
          const isNewCard = enableAnimations && animatingCards.has(card.id);

          // Start position for newly drawn cards (from deck position - bottom right)
          const startX = isNewCard ? 400 : horizontalOffset;
          const startY = isNewCard ? 200 : verticalOffset;
          const startRotation = isNewCard ? 45 : rotation;

          return (
            <div
              key={card.id}
              className={`absolute bottom-0 hover:z-50 ${isNewCard ? 'animate-draw-card' : 'transition-all duration-300 ease-out'}`}
              style={{
                '--final-x': `${horizontalOffset}px`,
                '--final-y': `${verticalOffset}px`,
                '--final-rotation': `${rotation}deg`,
                transform: isNewCard
                  ? 'translateX(400px) translateY(200px) rotate(45deg) scale(0.5)'
                  : `translateX(${horizontalOffset}px) translateY(${verticalOffset}px) rotate(${rotation}deg)`,
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
