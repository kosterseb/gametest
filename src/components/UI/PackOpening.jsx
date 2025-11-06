import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { cardTemplates, rollCardRarity } from '../../data/cards';
import { Card } from '../Cards/Card';
import { NBButton, NBBadge } from './NeoBrutalUI';
import { Sparkles } from 'lucide-react';

export const PackOpening = ({ packType, onComplete }) => {
  const { dispatch } = useGame();

  const [stage, setStage] = useState('opening'); // 'opening', 'revealing', 'choosing'
  const [cards, setCards] = useState([]);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Generate cards based on pack type
  useEffect(() => {
    const generateCards = () => {
      const generatedCards = [];

      switch (packType) {
        case 'bronze':
          // 3 common cards
          for (let i = 0; i < 3; i++) {
            const rarity = 'common';
            const cardsOfRarity = cardTemplates.filter(c => c.rarity === rarity);
            if (cardsOfRarity.length > 0) {
              const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
              generatedCards.push(randomCard);
            }
          }
          break;

        case 'silver':
          // 2 common + 1 rare
          for (let i = 0; i < 2; i++) {
            const rarity = 'common';
            const cardsOfRarity = cardTemplates.filter(c => c.rarity === rarity);
            if (cardsOfRarity.length > 0) {
              const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
              generatedCards.push(randomCard);
            }
          }
          const rareCards = cardTemplates.filter(c => c.rarity === 'rare');
          if (rareCards.length > 0) {
            const randomCard = rareCards[Math.floor(Math.random() * rareCards.length)];
            generatedCards.push(randomCard);
          }
          break;

        case 'gold':
          // 1 common + 2 rare
          const commonCards = cardTemplates.filter(c => c.rarity === 'common');
          if (commonCards.length > 0) {
            const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
            generatedCards.push(randomCard);
          }
          for (let i = 0; i < 2; i++) {
            const rarity = 'rare';
            const cardsOfRarity = cardTemplates.filter(c => c.rarity === rarity);
            if (cardsOfRarity.length > 0) {
              const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
              generatedCards.push(randomCard);
            }
          }
          break;

        case 'diamond':
          // 3 rare/epic cards (70% rare, 30% epic)
          for (let i = 0; i < 3; i++) {
            const rarity = rollCardRarity({ rare: 70, epic: 30 });
            const cardsOfRarity = cardTemplates.filter(c => c.rarity === rarity);
            if (cardsOfRarity.length > 0) {
              const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
              generatedCards.push(randomCard);
            }
          }
          break;

        default:
          break;
      }

      setCards(generatedCards);
    };

    generateCards();

    // Automatically move to revealing stage after pack "opens"
    const openingTimer = setTimeout(() => {
      setStage('revealing');
    }, 1500);

    return () => clearTimeout(openingTimer);
  }, [packType]);

  // Reveal cards one by one
  useEffect(() => {
    if (stage === 'revealing' && cards.length > 0) {
      const revealCard = (index) => {
        setTimeout(() => {
          setRevealedIndices(prev => [...prev, index]);
        }, index * 500); // Stagger reveals by 500ms
      };

      cards.forEach((_, index) => {
        revealCard(index);
      });

      // Move to choosing stage after all cards revealed
      setTimeout(() => {
        setStage('choosing');
      }, cards.length * 500 + 500);
    }
  }, [stage, cards]);

  const handleSelectCard = (card) => {
    setSelectedCard(card);
    dispatch({ type: 'UNLOCK_CARD', card });
    dispatch({ type: 'ADD_BATTLE_LOG', message: `Unlocked ${card.name} from pack!` });

    // Wait a moment then close
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const getPackEmoji = () => {
    switch (packType) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'diamond': return '💎';
      default: return '🎴';
    }
  };

  const getPackColor = () => {
    switch (packType) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-cyan-400 to-cyan-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'diamond': return 'from-purple-400 to-purple-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getPackName = () => {
    switch (packType) {
      case 'bronze': return 'BRONZE PACK';
      case 'silver': return 'SILVER PACK';
      case 'gold': return 'GOLD PACK';
      case 'diamond': return 'DIAMOND PACK';
      default: return 'CARD PACK';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        {stage === 'opening' && (
          <div className={`
            animate-bounce
            text-center
          `}>
            <div className="text-9xl mb-6 animate-pulse">{getPackEmoji()}</div>
            <div className={`
              bg-gradient-to-r ${getPackColor()}
              nb-border-xl nb-shadow-xl
              px-12 py-6
              inline-block
            `}>
              <h2 className="text-black font-black text-5xl uppercase">
                Opening {getPackName()}...
              </h2>
            </div>
          </div>
        )}

        {stage === 'revealing' && (
          <div className="w-full max-w-6xl">
            <div className="text-center mb-8">
              <NBBadge color="yellow" className="px-8 py-4 text-2xl inline-flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <span>REVEALING YOUR CARDS...</span>
                <Sparkles className="w-8 h-8" />
              </NBBadge>
            </div>

            <div className="flex justify-center gap-8">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`
                    transition-all duration-500
                    ${revealedIndices.includes(index) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  `}
                >
                  {revealedIndices.includes(index) ? (
                    <div className="transform hover:scale-105 transition-transform">
                      <Card
                        card={card}
                        disabled={true}
                        compact={false}
                        showCost={false}
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-96 nb-bg-purple nb-border-xl nb-shadow-xl flex items-center justify-center">
                      <div className="text-6xl">🎴</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 'choosing' && (
          <div className="w-full max-w-6xl">
            <div className="text-center mb-8">
              <div className="nb-bg-green nb-border-xl nb-shadow-xl px-12 py-6 inline-block mb-4 animate-pulse">
                <h2 className="text-black font-black text-4xl uppercase">
                  ✨ Choose 1 Card! ✨
                </h2>
              </div>
              <NBBadge color="white" className="px-6 py-3 text-lg">
                Click on a card to add it to your collection
              </NBBadge>
            </div>

            <div className="flex justify-center gap-8 mb-8">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`
                    transition-all duration-300
                    ${selectedCard?.name === card.name ? 'scale-110 ring-8 ring-yellow-400' : 'hover:scale-105'}
                  `}
                >
                  <Card
                    card={card}
                    onClick={() => !selectedCard && handleSelectCard(card)}
                    disabled={selectedCard !== null}
                    compact={false}
                    showCost={false}
                  />
                </div>
              ))}
            </div>

            {selectedCard && (
              <div className="text-center">
                <div className="nb-bg-yellow nb-border-xl nb-shadow-xl px-8 py-4 inline-block animate-bounce">
                  <p className="text-black font-black text-2xl uppercase">
                    ✓ {selectedCard.name} ADDED!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
