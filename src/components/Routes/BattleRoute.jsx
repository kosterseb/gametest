import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';

// OPTION 1: If Card.jsx is at src/components/Cards/Card.jsx
import { Card } from '../Cards/Card';

// OPTION 2: If Card.jsx is at src/Cards/Card.jsx
// import { Card } from '../../Cards/Card';

import { BattleField } from '../Battle/BattleField';
import { GameHeader } from '../Battle/GameHeader';
import { PageTransition } from '../UI/PageTransition';
import { ItemButton } from '../Cards/ItemButton';
import { DiceRoll } from '../Battle/DiceRoll';
import { CoinFlip } from '../Battle/CoinFlip';
import { TorusTunnelBackground } from '../Battle/TorusTunnelBackground';
import {
  applyStatus,
  tickStatuses,
  calculateStatusDamage,
  getModifiedCardCost,
  getModifiedDamage,
  shouldSkipTurn,
  createStatus,
  applyShieldBlock
} from '../../data/statusEffects';
import { applyTalentDamageBonus } from '../../utils/talentEffects';
import { Skull, ArrowLeft, Zap } from 'lucide-react';

// ✅ Card state reducer for atomic updates
const cardStateReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE_DECK': {
      return {
        deck: action.deck,
        hand: [],
        discardPile: []
      };
    }

    case 'DRAW_CARDS': {
      let workingDeck = [...state.deck];
      let workingDiscard = [...state.discardPile];
      const drawnCards = [];
      const { count, shuffleDeck, onReshuffle } = action;

      for (let i = 0; i < count; i++) {
        // Reshuffle if needed
        if (workingDeck.length === 0 && workingDiscard.length > 0) {
          console.log('♻️ Reshuffling', workingDiscard.length, 'cards');
          workingDeck = shuffleDeck(workingDiscard);
          workingDiscard = [];
          if (onReshuffle) onReshuffle();
        }

        // Draw card
        if (workingDeck.length > 0) {
          const card = workingDeck.shift();
          drawnCards.push(card);
          console.log('✋ Drawn:', card.name);
        } else {
          console.log('⚠️ No more cards to draw');
          break;
        }
      }

      console.log(`📥 Drew ${drawnCards.length} cards total`);
      const newHand = [...state.hand, ...drawnCards];
      console.log(`✋ Hand updated: ${state.hand.length} -> ${newHand.length}`);

      return {
        deck: workingDeck,
        hand: newHand,
        discardPile: workingDiscard
      };
    }

    case 'DRAW_SINGLE_CARD': {
      const { shuffleDeck, onReshuffle, onNoCards } = action;

      if (state.deck.length === 0 && state.discardPile.length === 0) {
        if (onNoCards) onNoCards();
        return state;
      }

      if (state.deck.length === 0) {
        // Reshuffle discard into deck
        console.log('♻️ Reshuffling', state.discardPile.length, 'cards from discard');
        const reshuffled = shuffleDeck(state.discardPile);
        const drawnCard = reshuffled[0];

        console.log('✋ Adding card to hand:', drawnCard.name);
        if (onReshuffle) onReshuffle();

        return {
          deck: reshuffled.slice(1),
          hand: [...state.hand, drawnCard],
          discardPile: []
        };
      }

      // Draw from deck
      const drawnCard = state.deck[0];
      console.log('✋ Drawing card:', drawnCard.name, 'ID:', drawnCard.id);

      return {
        deck: state.deck.slice(1),
        hand: [...state.hand, drawnCard],
        discardPile: state.discardPile
      };
    }

    case 'PLAY_CARD': {
      const { card } = action;
      const newHand = state.hand.filter(c => c.id !== card.id);

      return {
        deck: state.deck,
        hand: newHand,
        discardPile: [...state.discardPile, card]
      };
    }

    case 'DISCARD_HAND': {
      return {
        deck: state.deck,
        hand: [],
        discardPile: [...state.discardPile, ...state.hand]
      };
    }

    default:
      return state;
  }
};

export const BattleRoute = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();

  // Get current enemy from context
  const currentEnemy = gameState.currentEnemyData;

  // ✅ Use ref to track if deck is initialized
  const deckInitialized = useRef(false);
  const initialHandDrawn = useRef(false);
  const isDrawingCards = useRef(false); // Prevent concurrent draws
  const lastSyncedHealth = useRef(0); // Track last synced health value

  // ✅ Track all timeouts for cleanup
  const timeoutsRef = useRef([]);

  // ✅ Ref to store performEnemyTurn to avoid circular dependencies
  const performEnemyTurnRef = useRef();

  // ✅ Initialize battle state correctly (BEFORE any early returns!)
  const [playerHealth, setPlayerHealth] = useState(gameState.playerHealth || 100);
  const [maxPlayerHealth] = useState(gameState.maxPlayerHealth || 100);
  const [enemyHealth, setEnemyHealth] = useState(currentEnemy?.health || 100);
  const [maxEnemyHealth] = useState(currentEnemy?.health || 100);

  // Initialize lastSyncedHealth with starting health
  useEffect(() => {
    if (lastSyncedHealth.current === 0) {
      lastSyncedHealth.current = gameState.playerHealth || 100;
    }
  }, [gameState.playerHealth]);

  const [playerEnergy, setPlayerEnergy] = useState(gameState.maxEnergy || 10);
  const [maxEnergy] = useState(gameState.maxEnergy || 10);

  // ✅ Use reducer for atomic card state updates
  const [cardState, dispatchCardState] = useReducer(cardStateReducer, {
    deck: [],
    hand: [],
    discardPile: []
  });

  // Destructure for easier access
  const { deck, hand, discardPile } = cardState;

  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [turnCount, setTurnCount] = useState(1);
  const [isBattleOver, setIsBattleOver] = useState(false);

  const [playerStatuses, setPlayerStatuses] = useState([]);
  const [enemyStatuses, setEnemyStatuses] = useState([]);

  // ✅ Track used consumables
  const [usedConsumables, setUsedConsumables] = useState([]);

  // ✅ Track boss ability usage (once per turn)
  const [hasUsedDrawAbility, setHasUsedDrawAbility] = useState(false);
  const [hasUsedDiscardAbility, setHasUsedDiscardAbility] = useState(false);

  // ✅ Track dice roll state
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [pendingDiceCard, setPendingDiceCard] = useState(null);

  // ✅ Track coin flip state
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [turnOrderDecided, setTurnOrderDecided] = useState(false);

  // ✅ Track attack animation pause
  const [isAttackAnimationPlaying, setIsAttackAnimationPlaying] = useState(false);

  // ✅ Track combat states for background effects
  const [combatStates, setCombatStates] = useState({
    isPlayerAttacking: false,
    isPlayerHealing: false,
    isPlayerDamaged: false,
    isEnemyAttacking: false,
    isEnemyHealing: false,
    isEnemyDamaged: false
  });

  // ✅ Track consumable belt expansion
  const [consumablesBeltExpanded, setConsumablesBeltExpanded] = useState(false);

  // If no enemy, redirect to map
  useEffect(() => {
    if (!currentEnemy) {
      console.log('No enemy data, redirecting to map...');
      navigate('/map');
    }
  }, [currentEnemy, navigate]);

  // ✅ Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up', timeoutsRef.current.length, 'timeouts');
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  // ✅ Helper to set timeout with tracking
  const setTrackedTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      // Remove from tracking after execution
      timeoutsRef.current = timeoutsRef.current.filter(id => id !== timeoutId);
    }, delay);
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  if (!currentEnemy) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading battle...</div>;
  }

  // Helper functions
  const shuffleDeck = (cards) => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ✅ FIXED: Better unique ID generator using counter
  const cardIdCounter = useRef(0);
  const generateUniqueCardId = (cardName, extraInfo = '') => {
    cardIdCounter.current += 1;
    return `${cardName}_${extraInfo}_${cardIdCounter.current}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // ✅ FIXED: Draw single card using reducer
  const drawCard = useCallback(() => {
    dispatchCardState({
      type: 'DRAW_SINGLE_CARD',
      shuffleDeck,
      onReshuffle: () => setBattleLog(prev => [...prev, '♻️ Reshuffling discard pile into deck...']),
      onNoCards: () => setBattleLog(prev => [...prev, '⚠️ No cards left to draw!'])
    });
  }, [shuffleDeck]);

  // ✅ FIXED: Draw multiple cards using reducer for atomic updates
  const drawMultipleCards = useCallback((count) => {
    // Prevent concurrent draws
    if (isDrawingCards.current) {
      console.warn('⚠️ Already drawing cards, skipping duplicate call');
      return;
    }

    isDrawingCards.current = true;
    console.log(`📚 Drawing ${count} cards...`);

    dispatchCardState({
      type: 'DRAW_CARDS',
      count,
      shuffleDeck,
      onReshuffle: () => setBattleLog(prev => [...prev, '♻️ Reshuffling discard pile...'])
    });

    // Reset flag after dispatch
    setTimeout(() => {
      isDrawingCards.current = false;
    }, 50);
  }, [shuffleDeck]);

  // ✅ FIXED: Initialize deck ONLY ONCE
  useEffect(() => {
    if (deckInitialized.current) {
      console.log('⏭️ Deck already initialized, skipping...');
      return;
    }

    const selectedCardNames = gameState.selectedCardTypes || [];
    const unlockedCards = gameState.unlockedCards || [];
    
    console.log('🎴 Initializing deck with cards:', selectedCardNames);
    
    const selectedCards = selectedCardNames
      .map(name => unlockedCards.find(card => card.name === name))
      .filter(card => card !== undefined);

    if (selectedCards.length === 0) {
      console.warn('⚠️ No cards selected! Using defaults.');
      setBattleLog(prev => [...prev, '⚠️ No cards selected! Using default cards.']);
      const defaultCards = unlockedCards.slice(0, 3);
      const defaultDeckCopies = [];
      
      defaultCards.forEach((card, cardIndex) => {
        for (let i = 0; i < 3; i++) {
          defaultDeckCopies.push({ 
            ...card, 
            id: generateUniqueCardId(card.name, `default_${cardIndex}_copy${i}`)
          });
        }
      });
      
      console.log('📦 Created default deck:', defaultDeckCopies.length, 'cards');
      dispatchCardState({
        type: 'INITIALIZE_DECK',
        deck: shuffleDeck(defaultDeckCopies)
      });
    } else {
      const deckCopies = [];

      selectedCards.forEach((card, cardIndex) => {
        for (let i = 0; i < 3; i++) {
          deckCopies.push({
            ...card,
            id: generateUniqueCardId(card.name, `card${cardIndex}_copy${i}`)
          });
        }
      });

      console.log('📦 Created deck:', deckCopies.length, 'cards from', selectedCards.length, 'unique cards');
      dispatchCardState({
        type: 'INITIALIZE_DECK',
        deck: shuffleDeck(deckCopies)
      });
    }

    deckInitialized.current = true;
  }, []); // Empty deps - only run once

  // ✅ Show coin flip after deck is initialized
  useEffect(() => {
    if (deck.length > 0 && !turnOrderDecided && !showCoinFlip) {
      console.log('🪙 Showing coin flip for turn order');
      setShowCoinFlip(true);
    }
  }, [deck.length, turnOrderDecided, showCoinFlip]);

  // ✅ FIXED: Draw initial hand ONLY ONCE (after turn order is decided AND if it's player's turn)
  useEffect(() => {
    // Guard: Only run if we have cards in deck, empty hand, haven't drawn yet, turn order is decided, AND it's not enemy's turn
    if (deck.length > 0 && hand.length === 0 && !initialHandDrawn.current && turnOrderDecided && !isEnemyTurn) {
      const handSize = gameState.maxHandSize || 6;
      console.log(`✋ Drawing initial hand of ${handSize} cards (deck has ${deck.length} cards)`);

      // Set flag IMMEDIATELY to prevent re-entry
      initialHandDrawn.current = true;

      // Draw cards
      drawMultipleCards(handSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.length, turnOrderDecided, isEnemyTurn]); // Trigger when deck, turn order, or enemy turn changes

  // Execute card effects
  const executeCard = useCallback((card, diceResult = null) => {
    const cardType = card.type;

    switch (cardType) {
      case 'damage':
        let diceRoll = null;
        if (card.diceRoll) {
          diceRoll = diceResult || Math.floor(Math.random() * 6) + 1;
          setBattleLog(prev => [...prev, `🎲 Rolled a ${diceRoll}!`]);
        }

        let baseDamage = card.baseDamage || 0;
        if (diceRoll) {
          baseDamage = baseDamage + (diceRoll * 3);
        }

        if (card.multiHit) {
          baseDamage = baseDamage * card.multiHit;
          setBattleLog(prev => [...prev, `${card.name}: Hit ${card.multiHit} times!`]);
        }

        const finalDamage = getModifiedDamage(baseDamage, playerStatuses, enemyStatuses);

        let talentBoostedDamage = finalDamage;
        if (gameState.profile?.unlockedTalents) {
          talentBoostedDamage = applyTalentDamageBonus(finalDamage, gameState.profile.unlockedTalents);
          if (talentBoostedDamage > finalDamage) {
            setBattleLog(prev => [...prev, `✨ Talent boost: ${finalDamage} → ${talentBoostedDamage} damage!`]);
          }
        }

        setBattleLog(prev => [...prev, `⚔️ ${card.name}: Dealt ${talentBoostedDamage} damage!`]);
        setEnemyHealth(prev => Math.max(0, prev - talentBoostedDamage));

        dispatch({ 
          type: 'UPDATE_RUN_STATS', 
          stats: { 
            cardsPlayed: 1,
            damageDealt: talentBoostedDamage
          }
        });

        if (card.selfDamage) {
          setTrackedTimeout(() => {
            setPlayerHealth(prev => Math.max(0, prev - card.selfDamage));
            setBattleLog(prev => [...prev, `💥 ${card.name}: Took ${card.selfDamage} recoil damage!`]);
          }, 300);
        }

        if (card.conditional === 'execute' && enemyHealth <= maxEnemyHealth * 0.3) {
          const bonusDamage = 15;
          setTrackedTimeout(() => {
            setEnemyHealth(prev => Math.max(0, prev - bonusDamage));
            setBattleLog(prev => [...prev, `💀 Execute bonus: ${bonusDamage} extra damage!`]);
          }, 500);
        }
        break;

      case 'heal':
        let healing = card.baseHeal || 0;
        if (card.diceRoll) {
          const roll = diceResult || Math.floor(Math.random() * 6) + 1;
          setBattleLog(prev => [...prev, `🎲 Rolled a ${roll}!`]);
          healing = healing + (roll * 2); // Add dice result * 2 to healing
        }
        setPlayerHealth(prev => Math.min(maxPlayerHealth, prev + healing));
        setBattleLog(prev => [...prev, `💚 ${card.name}: Restored ${healing} HP!`]);
        
        if (card.bonusEffect === 'draw') {
          drawCard();
          setBattleLog(prev => [...prev, `📖 Drew 1 card!`]);
        }
        
        if (card.bonusEffect === 'cleanse_all') {
          setPlayerStatuses([]);
          setBattleLog(prev => [...prev, `✨ All status effects removed!`]);
        }
        break;

      case 'utility':
        if (card.effect === 'energy') {
          setPlayerEnergy(prev => prev + 2);
          setBattleLog(prev => [...prev, `⚡ ${card.name}: Gained 2 energy!`]);
        }
        if (card.effect === 'energy_large') {
          setPlayerEnergy(prev => prev + 8);
          setBattleLog(prev => [...prev, `⚡ ${card.name}: Gained 8 energy!`]);
        }
        
        if (card.effect === 'draw') {
          drawCard();
          setBattleLog(prev => [...prev, `📖 ${card.name}: Drew 1 card!`]);
        }
        if (card.effect === 'drawRoll') {
          const roll = diceResult || Math.floor(Math.random() * 6) + 1;
          setBattleLog(prev => [...prev, `🎲 Rolled ${roll}!`]);
          drawMultipleCards(roll);
          setBattleLog(prev => [...prev, `📖 Drew ${roll} cards!`]);
        }
        if (card.effect === 'draw_multi') {
          drawMultipleCards(3);
          setBattleLog(prev => [...prev, `📖 ${card.name}: Drew 3 cards!`]);
        }
        if (card.effect === 'draw_energy') {
          drawMultipleCards(2);
          setPlayerEnergy(prev => prev + 2);
          setBattleLog(prev => [...prev, `⚡📖 ${card.name}: Drew 2 cards and gained 2 energy!`]);
        }
        if (card.effect === 'master_plan') {
          drawMultipleCards(4);
          setPlayerEnergy(prev => prev + 3);
          setBattleLog(prev => [...prev, `⚡📖 ${card.name}: Drew 4 cards and gained 3 energy!`]);
        }
        if (card.effect === 'adrenaline') {
          drawMultipleCards(2);
          setPlayerEnergy(prev => prev + 4);
          setPlayerHealth(prev => Math.min(maxPlayerHealth, prev + 10));
          setBattleLog(prev => [...prev, `🔥 ${card.name}: Drew 2 cards, gained 4 energy, and healed 10 HP!`]);
        }
        
        if (card.effect === 'shield') {
          const shieldAmount = card.shieldAmount || 10;
          const shieldStatus = createStatus('shield', shieldAmount);
          setPlayerStatuses(prev => applyStatus(prev, shieldStatus));
          setBattleLog(prev => [...prev, `🛡️ ${card.name}: Gained ${shieldAmount} shield!`]);
        }
        break;

      case 'cleanse':
        if (card.effect === 'cleanse_poison') {
          setPlayerStatuses(prev => prev.filter(s => s.type !== 'poison'));
          setBattleLog(prev => [...prev, `✨ ${card.name}: Removed Poison!`]);
        }
        if (card.effect === 'cleanse_dazed') {
          setPlayerStatuses(prev => prev.filter(s => s.type !== 'dazed'));
          setBattleLog(prev => [...prev, `✨ ${card.name}: Removed Dazed!`]);
        }
        if (card.effect === 'cleanse_bleed') {
          setPlayerStatuses(prev => prev.filter(s => s.type !== 'bleed'));
          const healAmount = card.baseHeal || 0;
          if (healAmount > 0) {
            setPlayerHealth(prev => Math.min(maxPlayerHealth, prev + healAmount));
            setBattleLog(prev => [...prev, `✨💚 ${card.name}: Removed Bleed and healed ${healAmount} HP!`]);
          }
        }
        if (card.effect === 'cleanse_all') {
          setPlayerStatuses([]);
          const healAmount = card.baseHeal || 0;
          if (healAmount > 0) {
            setPlayerHealth(prev => Math.min(maxPlayerHealth, prev + healAmount));
            setBattleLog(prev => [...prev, `✨💚 ${card.name}: Removed all statuses and healed ${healAmount} HP!`]);
          } else {
            setBattleLog(prev => [...prev, `✨ ${card.name}: Removed all status effects!`]);
          }
        }
        break;

      default:
        setBattleLog(prev => [...prev, `${card.name}: Unknown card type!`]);
    }
  }, [playerEnergy, playerStatuses, hand.length, enemyHealth, maxEnemyHealth, maxPlayerHealth, gameState, dispatch, drawCard, drawMultipleCards, setTrackedTimeout]);

  // ✅ FIXED: Card playing using reducer
  const handleCardPlay = useCallback((card) => {
    // Prevent playing cards after battle ends
    if (isBattleOver) {
      console.warn('⚠️ Cannot play cards - battle is over!');
      return;
    }

    const modifiedCost = getModifiedCardCost(card.energyCost, playerStatuses);

    if (playerEnergy < modifiedCost) {
      setBattleLog(prev => [...prev, '⚠️ Not enough energy!']);
      return;
    }

    console.log('🎴 Playing card:', card.name, 'ID:', card.id);
    console.log('✋ Hand before:', hand.length, 'cards');

    setPlayerEnergy(prev => prev - modifiedCost);

    // ✅ Use reducer to remove card from hand and add to discard
    dispatchCardState({
      type: 'PLAY_CARD',
      card
    });

    console.log('✋ Hand after:', hand.length - 1, 'cards');

    // Check if card requires dice roll
    if (card.diceRoll) {
      setPendingDiceCard(card);
      setShowDiceRoll(true);
    } else {
      executeCard(card);
    }
  }, [isBattleOver, playerEnergy, playerStatuses, hand.length, executeCard]);

  // ✅ Handle dice roll completion
  const handleDiceComplete = useCallback((diceResult) => {
    setShowDiceRoll(false);

    if (pendingDiceCard) {
      // Execute card with dice result
      executeCard(pendingDiceCard, diceResult);
      setPendingDiceCard(null);
    }
  }, [pendingDiceCard, executeCard]);

  // ✅ Handle coin flip completion
  const handleCoinFlipComplete = useCallback((winner) => {
    console.log('🪙 Coin flip result:', winner);
    setShowCoinFlip(false);
    setTurnOrderDecided(true);

    if (winner === 'enemy') {
      setBattleLog(prev => [...prev, '🪙 Enemy won the coin flip and attacks first!']);
      setIsEnemyTurn(true);
      // Trigger enemy turn after a delay
      setTimeout(() => {
        if (performEnemyTurnRef.current) {
          performEnemyTurnRef.current();
        }
      }, 1000);
    } else {
      setBattleLog(prev => [...prev, '🪙 You won the coin flip! Your turn to attack!']);
      setIsEnemyTurn(false);
    }
  }, []);

  // ✅ Item usage
  const handleUseItem = useCallback((item) => {
    if (usedConsumables.includes(item.instanceId)) {
      setBattleLog(prev => [...prev, '⚠️ Item already used this battle!']);
      return;
    }

    if (item.needsSpecialHandling) {
      if (item.specialEffect === 'draw_3_cards') {
        drawMultipleCards(3);
      } else if (item.specialEffect === 'draw_2_cards') {
        setPlayerEnergy(prev => prev + 8);
        drawMultipleCards(2);
      }
    }

    if (item.effect && typeof item.effect === 'function') {
      item.effect(dispatch, gameState);
    }

    // Mark as used for this battle
    setUsedConsumables(prev => [...prev, item.instanceId]);
    setBattleLog(prev => [...prev, `${item.emoji} Used ${item.name}!`]);

    // Remove consumable from toolBelt inventory
    if (item.type === 'consumable') {
      dispatch({ type: 'REMOVE_CONSUMABLE_FROM_TOOLBELT', instanceId: item.instanceId });
    }
  }, [usedConsumables, drawMultipleCards, dispatch, gameState]);

  // ✅ Handle end turn
  const handleEndTurn = useCallback(() => {
    if (isEnemyTurn) return;

    console.log('🔄 Ending turn...');
    setBattleLog(prev => [...prev, '--- Turn Ended ---']);

    const playerStatusDamage = calculateStatusDamage(playerStatuses);
    if (playerStatusDamage > 0) {
      setPlayerHealth(prev => Math.max(0, prev - playerStatusDamage));
      setBattleLog(prev => [...prev, `💥 Status effects: ${playerStatusDamage} damage!`]);
    }

    setPlayerStatuses(prev => tickStatuses(prev));

    const enemyStatusDamage = calculateStatusDamage(enemyStatuses);
    if (enemyStatusDamage > 0) {
      setEnemyHealth(prev => Math.max(0, prev - enemyStatusDamage));
      setBattleLog(prev => [...prev, `💥 Enemy status effects: ${enemyStatusDamage} damage!`]);
    }

    setEnemyStatuses(prev => tickStatuses(prev));

    console.log('🗑️ Discarding hand:', hand.length, 'cards');
    dispatchCardState({ type: 'DISCARD_HAND' });

    setTurnCount(prev => prev + 1);
    setIsEnemyTurn(true);

    setTrackedTimeout(() => {
      performEnemyTurnRef.current?.();
    }, 1000);
  }, [isEnemyTurn, playerStatuses, enemyStatuses, hand, setTrackedTimeout]);

  const performEnemyTurn = useCallback(() => {
    if (shouldSkipTurn(enemyStatuses)) {
      setBattleLog(prev => [...prev, `❄️ ${currentEnemy.name} is unable to act!`]);

      setTrackedTimeout(() => {
        console.log('🔄 Refilling hand and energy...');
        setPlayerEnergy(maxEnergy);
        drawMultipleCards(gameState.maxHandSize || 6);
        setIsEnemyTurn(false);
      }, 1500);
      return;
    }

    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let selectedAbility = currentEnemy.abilities[0];

    for (const ability of currentEnemy.abilities) {
      cumulativeChance += ability.chance;
      if (roll <= cumulativeChance) {
        selectedAbility = ability;
        break;
      }
    }

    setBattleLog(prev => [...prev, `${currentEnemy.name} ${selectedAbility.message}`]);

    switch (selectedAbility.type) {
      case 'damage':
        const damageRange = selectedAbility.damage;
        const baseDamage = Math.floor(Math.random() * (damageRange[1] - damageRange[0] + 1)) + damageRange[0];
        const modifiedDamage = getModifiedDamage(baseDamage, enemyStatuses, playerStatuses);

        // ✅ Apply shield blocking
        const shieldResult = applyShieldBlock(playerStatuses, modifiedDamage);
        const finalDamage = shieldResult.damage;

        setPlayerHealth(prev => Math.max(0, prev - finalDamage));
        setPlayerStatuses(shieldResult.newStatuses);
        dispatch({ type: 'DAMAGE_PLAYER', amount: finalDamage });

        if (shieldResult.blocked > 0) {
          setBattleLog(prev => [...prev, `🛡️ Blocked ${shieldResult.blocked} damage!`]);
          setBattleLog(prev => [...prev, `💥 ${currentEnemy.name} dealt ${finalDamage} damage!`]);
        } else {
          setBattleLog(prev => [...prev, `💥 ${currentEnemy.name} dealt ${finalDamage} damage!`]);
        }
        break;

      case 'status':
        const status = typeof selectedAbility.status === 'function' 
          ? selectedAbility.status() 
          : selectedAbility.status;
        
        if (status) {
          setPlayerStatuses(prev => applyStatus(prev, status));
          setBattleLog(prev => [...prev, `${status.emoji || '⚠️'} ${status.name || 'Status'} applied!`]);
        }
        break;

      case 'buff':
        if (selectedAbility.healing) {
          setEnemyHealth(prev => Math.min(maxEnemyHealth, prev + selectedAbility.healing));
          setBattleLog(prev => [...prev, `💚 ${currentEnemy.name} healed ${selectedAbility.healing} HP!`]);
        }
        break;

      case 'multi_action':
        selectedAbility.actions.forEach(action => {
          if (action.type === 'damage') {
            const dmg = Math.floor(Math.random() * (action.damage[1] - action.damage[0] + 1)) + action.damage[0];
            const modDmg = getModifiedDamage(dmg, enemyStatuses, playerStatuses);

            // ✅ Apply shield blocking
            setPlayerStatuses(prev => {
              const shieldResult = applyShieldBlock(prev, modDmg);
              setPlayerHealth(h => Math.max(0, h - shieldResult.damage));
              dispatch({ type: 'DAMAGE_PLAYER', amount: shieldResult.damage });

              if (shieldResult.blocked > 0) {
                setBattleLog(log => [...log, `🛡️ Blocked ${shieldResult.blocked} damage!`]);
              }
              setBattleLog(log => [...log, `💥 ${shieldResult.damage} damage!`]);

              return shieldResult.newStatuses;
            });
          } else if (action.type === 'status') {
            const actionStatus = typeof action.status === 'function' 
              ? action.status() 
              : action.status;
            
            if (actionStatus) {
              setPlayerStatuses(prev => applyStatus(prev, actionStatus));
              setBattleLog(prev => [...prev, `${actionStatus.emoji || '⚠️'} ${actionStatus.name || 'Status'} applied!`]);
            }
          } else if (action.type === 'rest') {
            setEnemyHealth(prev => Math.min(maxEnemyHealth, prev + action.healing));
            setBattleLog(prev => [...prev, `💚 Healed ${action.healing} HP!`]);
          }
        });
        break;

      case 'multi_hit':
        const hitDamage = Math.floor(Math.random() * (selectedAbility.damage[1] - selectedAbility.damage[0] + 1)) + selectedAbility.damage[0];
        const totalMultiDamage = hitDamage * selectedAbility.hits;
        const modMultiDamage = getModifiedDamage(totalMultiDamage, enemyStatuses, playerStatuses);

        // ✅ Apply shield blocking
        const multiHitShieldResult = applyShieldBlock(playerStatuses, modMultiDamage);
        const finalMultiDamage = multiHitShieldResult.damage;

        setPlayerHealth(prev => Math.max(0, prev - finalMultiDamage));
        setPlayerStatuses(multiHitShieldResult.newStatuses);
        dispatch({ type: 'DAMAGE_PLAYER', amount: finalMultiDamage });

        if (multiHitShieldResult.blocked > 0) {
          setBattleLog(prev => [...prev, `🛡️ Blocked ${multiHitShieldResult.blocked} damage!`]);
        }
        setBattleLog(prev => [...prev, `💥 ${currentEnemy.name} hit ${selectedAbility.hits} times for ${finalMultiDamage} total damage!`]);
        break;

      case 'rest':
        setEnemyHealth(prev => Math.min(maxEnemyHealth, prev + selectedAbility.healing));
        setBattleLog(prev => [...prev, `💚 ${currentEnemy.name} rested and healed ${selectedAbility.healing} HP!`]);
        break;

      case 'skip':
        break;

      default:
        setBattleLog(prev => [...prev, `${currentEnemy.name} did something unknown!`]);
    }

    setTrackedTimeout(() => {
      console.log('🔄 Refilling hand and energy...');
      setPlayerEnergy(maxEnergy);
      drawMultipleCards(gameState.maxHandSize || 6);
      setIsEnemyTurn(false);
      // Reset boss ability usage for new turn
      setHasUsedDrawAbility(false);
      setHasUsedDiscardAbility(false);
    }, 1500);
  }, [currentEnemy, enemyStatuses, maxEnergy, playerStatuses, gameState.maxHandSize, drawMultipleCards, setTrackedTimeout, dispatch]);

  // ✅ Keep ref updated
  useEffect(() => {
    performEnemyTurnRef.current = performEnemyTurn;
  }, [performEnemyTurn]);

  // ✅ Sync local playerHealth when global health INCREASES (from consumable use)
  useEffect(() => {
    // Only sync if global health increased (healing from consumable)
    if (gameState.playerHealth > lastSyncedHealth.current && gameState.playerHealth > playerHealth) {
      console.log(`💚 Healing: ${playerHealth} -> ${gameState.playerHealth}`);
      setPlayerHealth(gameState.playerHealth);
      lastSyncedHealth.current = gameState.playerHealth;
    } else if (gameState.playerHealth !== lastSyncedHealth.current) {
      // Update ref but don't override local battle health
      lastSyncedHealth.current = gameState.playerHealth;
    }
  }, [gameState.playerHealth, playerHealth]);

  const handleVictory = useCallback(() => {
    setIsBattleOver(true);
    setBattleLog(prev => [...prev, `🎉 Victory! ${currentEnemy.name} defeated!`]);

    // Calculate gold reward
    const goldReward = currentEnemy.goldReward
      ? Math.floor(Math.random() * (currentEnemy.goldReward[1] - currentEnemy.goldReward[0] + 1)) + currentEnemy.goldReward[0]
      : 10;

    // Calculate XP reward based on enemy type
    let xpReward = 15; // Base XP for regular enemies
    if (currentEnemy.isBoss) {
      xpReward = 100; // Bosses give 100 XP
    } else if (currentEnemy.isElite) {
      xpReward = 50; // Elites give 50 XP
    }

    console.log(`💰 Victory! Awarded ${goldReward} gold and ✨ ${xpReward} XP`);

    // Update game state
    dispatch({ type: 'UPDATE_HEALTH', health: playerHealth });
    dispatch({ type: 'ADD_GOLD', amount: goldReward });
    dispatch({ type: 'ADD_EXPERIENCE', amount: xpReward });
    dispatch({ type: 'ADVANCE_FLOOR' });

    // Update run statistics
    dispatch({
      type: 'UPDATE_RUN_STATS',
      stats: {
        enemiesKilled: 1,
        goldEarned: goldReward,
        floorsCleared: 1
      }
    });

    if (currentEnemy.isBoss) {
      dispatch({ type: 'INCREMENT_BOSSES_DEFEATED' });
    }
    if (currentEnemy.isElite) {
      dispatch({ type: 'INCREMENT_ELITES_DEFEATED' });
    }

    dispatch({ type: 'SET_CARD_REWARD', rarityWeights: { common: 60, rare: 30, epic: 10 } });

    if (currentEnemy.isBoss) {
      // Check if this is the final boss
      const isFinalBoss = currentEnemy.isFinalBoss === true;

      setTrackedTimeout(() => {
        if (isFinalBoss) {
          console.log('🎉 Final boss defeated! Navigating to victory screen...');
          navigate('/victory');
        } else {
          navigate('/boss-reward');
        }
      }, 2000);
      return;
    } else {
      const itemRoll = Math.random();
      if (itemRoll < 0.3) {
        dispatch({ type: 'SET_ITEM_REWARD', count: currentEnemy.isElite ? 2 : 1 });
      }
    }

    setTrackedTimeout(() => {
      navigate('/reward');
    }, 2000);
  }, [currentEnemy, playerHealth, dispatch, navigate, setTrackedTimeout]);

  const handleDefeat = useCallback(() => {
    setIsBattleOver(true);
    setBattleLog(prev => [...prev, '💀 Defeat! You have been slain...']);

    setTrackedTimeout(() => {
      navigate('/defeat');
    }, 2000);
  }, [navigate, setTrackedTimeout]);

  // ✅ Check for victory/defeat conditions
  useEffect(() => {
    if (enemyHealth <= 0) {
      handleVictory();
    }
  }, [enemyHealth, handleVictory]);

  useEffect(() => {
    if (playerHealth <= 0) {
      handleDefeat();
    }
  }, [playerHealth, handleDefeat]);

  const handleForfeit = () => {
    if (window.confirm('Are you sure you want to forfeit this battle? Your run will end.')) {
      navigate('/defeat');
    }
  };

  const equippedConsumables = gameState.inventory?.toolBelt?.consumables?.filter(item => item !== null) || [];

  // Determine enemy type for background
  const getEnemyType = () => {
    if (!currentEnemy) return 'normal';
    if (currentEnemy.isBoss) return 'boss';
    if (currentEnemy.isElite) return 'elite';
    return 'normal';
  };

  return (
    <PageTransition>
      {/* Torus Tunnel Background */}
      <TorusTunnelBackground
        enemyType={getEnemyType()}
        isPlayerAttacking={combatStates.isPlayerAttacking}
        isPlayerHealing={combatStates.isPlayerHealing}
        isPlayerDamaged={combatStates.isPlayerDamaged}
        isEnemyAttacking={combatStates.isEnemyAttacking}
        isEnemyHealing={combatStates.isEnemyHealing}
        isEnemyDamaged={combatStates.isEnemyDamaged}
        baseSpeed={2}
        baseRotation={0}
      />

      <div className="h-screen overflow-hidden relative">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-2 p-2">
          {/* Header - 10% */}
          <div className="h-[10%] bg-white bg-opacity-45 rounded-xl shadow-lg flex justify-between items-center px-4 py-2">
            <GameHeader
              battleNumber={gameState.currentFloor}
              gold={gameState.gold}
              turnCount={turnCount}
              onForfeit={handleForfeit}
            />
          </div>

          {/* Battle Area - 62% */}
          <div className="h-[62%] flex flex-col overflow-hidden gap-2">
            <BattleField
              enemy={currentEnemy}
              enemyHealth={enemyHealth}
              maxEnemyHealth={maxEnemyHealth}
              isEnemyTurn={isEnemyTurn}
              battleLog={battleLog}
              playerHealth={playerHealth}
              maxPlayerHealth={maxPlayerHealth}
              playerEnergy={playerEnergy}
              maxEnergy={maxEnergy}
              playerStatuses={playerStatuses}
              enemyStatuses={enemyStatuses}
              avatarSeed={gameState.profile?.avatarSeed || 'default'}
              onAttackAnimationChange={setIsAttackAnimationPlaying}
              onCombatStateChange={setCombatStates}
            />

            {equippedConsumables.length > 0 && (
              <div className="bg-white bg-opacity-45 p-2 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold">⚡ Battle Items ({equippedConsumables.length})</h3>
                  <button
                    onClick={() => setConsumablesBeltExpanded(!consumablesBeltExpanded)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold transition-all"
                  >
                    {consumablesBeltExpanded ? '▲ Collapse' : '▼ Expand'}
                  </button>
                </div>
                {consumablesBeltExpanded && (
                  <div className="flex gap-2 flex-wrap">
                    {equippedConsumables.map((item, index) => (
                      <ItemButton
                        key={index}
                        item={item}
                        onUse={handleUseItem}
                        disabled={isEnemyTurn || isAttackAnimationPlaying}
                        isUsed={usedConsumables.includes(item.instanceId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cards Area - 28% */}
          <div className="h-[28%] bg-white bg-opacity-45 px-3 py-2 rounded-xl shadow-lg flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-bold">Your Hand ({hand.length}/{gameState.maxHandSize})</h2>
              </div>
              <button
                onClick={handleEndTurn}
                disabled={isEnemyTurn || isAttackAnimationPlaying}
                className={`
                  px-4 py-2 rounded-lg font-bold text-sm transition-all
                  ${isEnemyTurn || isAttackAnimationPlaying
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105'}
                `}
              >
                {isEnemyTurn ? 'Enemy Turn...' : 'End Turn'}
              </button>
            </div>

            {/* Boss Abilities */}
            {(gameState.hasDrawAbility || gameState.hasDiscardAbility) && (
              <div className="mb-2 flex gap-2">
                {gameState.hasDrawAbility && (
                  <button
                    onClick={() => {
                      if (hasUsedDrawAbility) {
                        setBattleLog(prev => [...prev, '⚠️ Already used Draw Card this turn!']);
                      } else if (playerEnergy >= 3) {
                        setPlayerEnergy(prev => prev - 3);
                        drawCard();
                        setHasUsedDrawAbility(true);
                        setBattleLog(prev => [...prev, '🎴 Drew 1 card for 3 energy']);
                      } else {
                        setBattleLog(prev => [...prev, '⚠️ Not enough energy to draw!']);
                      }
                    }}
                    disabled={isEnemyTurn || isBattleOver || playerEnergy < 3 || hasUsedDrawAbility || isAttackAnimationPlaying}
                    className={`
                      px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 transition-all
                      ${playerEnergy >= 3 && !isEnemyTurn && !isBattleOver && !hasUsedDrawAbility && !isAttackAnimationPlaying
                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'}
                    `}
                  >
                    <span className="text-sm">🎴</span>
                    Draw (3⚡) {hasUsedDrawAbility && '✓'}
                  </button>
                )}

                {gameState.hasDiscardAbility && (
                  <button
                    onClick={() => {
                      if (hasUsedDiscardAbility) {
                        setBattleLog(prev => [...prev, '⚠️ Already used Discard this turn!']);
                      } else if (hand.length > 0) {
                        const cardToDiscard = hand[0];
                        dispatchCardState({ type: 'PLAY_CARD', card: cardToDiscard });
                        setPlayerEnergy(prev => prev + 1);
                        setHasUsedDiscardAbility(true);
                        setBattleLog(prev => [...prev, `🗑️ Discarded ${cardToDiscard.name} for 1 energy`]);
                      } else {
                        setBattleLog(prev => [...prev, '⚠️ No cards to discard!']);
                      }
                    }}
                    disabled={isEnemyTurn || isBattleOver || hand.length === 0 || hasUsedDiscardAbility || isAttackAnimationPlaying}
                    className={`
                      px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 transition-all
                      ${hand.length > 0 && !isEnemyTurn && !isBattleOver && !hasUsedDiscardAbility && !isAttackAnimationPlaying
                        ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'}
                    `}
                  >
                    <span className="text-sm">🗑️</span>
                    Discard {hasUsedDiscardAbility && '✓'}
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
              {hand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => !isEnemyTurn && !isBattleOver && !isAttackAnimationPlaying && handleCardPlay(card)}
                  disabled={isEnemyTurn || isBattleOver || isAttackAnimationPlaying}
                  playerEnergy={playerEnergy}
                  playerStatuses={playerStatuses}
                  compact={true}
                />
              ))}
            </div>

            {hand.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">
                No cards in hand. End your turn to draw new cards!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coin Flip Overlay */}
      {showCoinFlip && (
        <CoinFlip
          onFlipComplete={handleCoinFlipComplete}
          playerName="YOU"
          enemyName={currentEnemy?.name || "ENEMY"}
        />
      )}

      {/* Dice Roll Overlay */}
      {showDiceRoll && (
        <DiceRoll
          onRollComplete={handleDiceComplete}
          minValue={1}
          maxValue={6}
        />
      )}
    </PageTransition>
  );
};