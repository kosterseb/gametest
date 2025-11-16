import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { useSettings } from '../../context/SettingsContext';

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
import { TurnBanner } from '../Battle/TurnBanner';
import { TorusTunnelBackground } from '../Battle/TorusTunnelBackground';
import { CardHand } from '../Cards/CardHand';
import { CardPlayParticles } from '../Effects/CardPlayParticles';
import { NBButton, NBDropdown, useNBConfirm } from '../UI/NeoBrutalUI';
import { BattleMenu } from '../UI/BattleMenu';
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

    case 'DISCARD_SINGLE_CARD': {
      const { card } = action;
      const newHand = state.hand.filter(c => c.id !== card.id);

      return {
        deck: state.deck,
        hand: newHand,
        discardPile: [...state.discardPile, card]
      };
    }

    default:
      return state;
  }
};

export const BattleRoute = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();
  const { settings } = useSettings();
  const { confirm, ConfirmDialog } = useNBConfirm();

  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // ✅ Store battle start stats once
  const battleStartStatsStored = useRef(false);

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

  // ✅ Store battle start stats ONCE when battle begins
  useEffect(() => {
    if (!battleStartStatsStored.current && gameState.profile) {
      dispatch({
        type: 'STORE_BATTLE_START_STATS',
        stats: {
          gold: gameState.gold,
          experience: gameState.profile.experience || 0,
          level: gameState.profile.level || 1,
          health: gameState.playerHealth || 100
        }
      });
      battleStartStatsStored.current = true;
    }
  }, [gameState.profile, gameState.gold, gameState.playerHealth, dispatch]);

  const [playerEnergy, setPlayerEnergy] = useState(gameState.maxEnergy || 10);
  const [maxEnergy] = useState(gameState.maxEnergy || 10);

  // Enemy energy state
  const [enemyEnergy, setEnemyEnergy] = useState(currentEnemy?.actionPoints || 10);
  const [maxEnemyEnergy] = useState(currentEnemy?.actionPoints || 10);

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

  // ✅ Track particle effects
  const [particleEffect, setParticleEffect] = useState(null);

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

  // ⏱️ Chess-style battle timer (2 minutes per player)
  const [playerTime, setPlayerTime] = useState(120); // 2 minutes in seconds
  const [enemyTime, setEnemyTime] = useState(120);

  // 🎭 Turn banner state
  const [showTurnBanner, setShowTurnBanner] = useState(false);
  const [isTurnStarting, setIsTurnStarting] = useState(false); // 3-second delay after banner
  const prevIsEnemyTurnRef = useRef(isEnemyTurn);
  const bannerCooldownRef = useRef(false); // Prevent banner from showing multiple times
  const pendingEnemyTurnRef = useRef(false); // Track if enemy turn should start after delay

  // 🎭 Show turn banner when turn changes
  useEffect(() => {
    // Only show banner after turn order is decided, when turn actually changes, and not on cooldown
    if (turnOrderDecided && prevIsEnemyTurnRef.current !== isEnemyTurn && !bannerCooldownRef.current) {
      prevIsEnemyTurnRef.current = isEnemyTurn;
      bannerCooldownRef.current = true; // Set cooldown
      setShowTurnBanner(true);
      setIsTurnStarting(true); // Start the 3-second delay

      // Release cooldown after banner completes (2 seconds)
      setTimeout(() => {
        bannerCooldownRef.current = false;
      }, 2500);
    }
  }, [isEnemyTurn, turnOrderDecided]);

  // 🎭 Handle banner completion and 1-second delay
  const handleBannerComplete = useCallback(() => {
    setShowTurnBanner(false);

    // Wait 1 second before allowing turn actions
    setTimeout(() => {
      setIsTurnStarting(false);

      // If it's enemy turn, trigger their actions now
      if (isEnemyTurn && pendingEnemyTurnRef.current) {
        pendingEnemyTurnRef.current = false;
        setTimeout(() => {
          performEnemyTurnRef.current?.();
        }, 100);
      }
    }, 1000);
  }, [isEnemyTurn]);

  // ⏱️ Timer countdown - only counts down for active player
  useEffect(() => {
    // Don't count down if battle is over, turn order not decided, or during animations/banner/turn starting
    if (isBattleOver || !turnOrderDecided || isAttackAnimationPlaying || showCoinFlip || showDiceRoll || showTurnBanner || isTurnStarting) {
      return;
    }

    const timerInterval = setInterval(() => {
      if (isEnemyTurn) {
        setEnemyTime(prev => {
          if (prev <= 0) {
            // Enemy time ran out - PLAYER WINS!
            console.log('⏰ Enemy time ran out! Player wins!');
            setBattleLog(prevLog => [...prevLog, '⏰ Enemy ran out of time! Victory!']);
            clearInterval(timerInterval);

            // Trigger victory
            setIsBattleOver(true);
            setEnemyHealth(0);
            handleVictory();

            return 0;
          }
          return prev - 1;
        });
      } else {
        setPlayerTime(prev => {
          if (prev <= 0) {
            // Player time ran out - PLAYER LOSES!
            console.log('⏰ Player time ran out! Defeat!');
            setBattleLog(prevLog => [...prevLog, '⏰ Time ran out! You lose!']);
            clearInterval(timerInterval);

            // Trigger defeat
            setIsBattleOver(true);
            setPlayerHealth(0);
            handleDefeat();

            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000); // Count down every second

    return () => clearInterval(timerInterval);
  }, [isEnemyTurn, isBattleOver, turnOrderDecided, isAttackAnimationPlaying, showCoinFlip, showDiceRoll, showTurnBanner, isTurnStarting]);

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
      // ✅ CHANGED: Max hand size is now 5 (hand persists between turns)
      const handSize = 5;
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

        // ✅ NEW BUFF CARD EFFECTS
        if (card.effect === 'buff_strength') {
          const statusEffect = Array.isArray(card.statusEffect) ? card.statusEffect[0] : card.statusEffect;
          const strengthStatus = createStatus('strength', statusEffect.stacks);
          setPlayerStatuses(prev => applyStatus(prev, strengthStatus));
          setBattleLog(prev => [...prev, `💪 ${card.name}: Gained Strength ${statusEffect.stacks}!`]);
        }

        if (card.effect === 'buff_regeneration') {
          const statusEffect = Array.isArray(card.statusEffect) ? card.statusEffect[0] : card.statusEffect;
          const regenStatus = createStatus('regeneration', statusEffect.stacks);
          setPlayerStatuses(prev => applyStatus(prev, regenStatus));
          setBattleLog(prev => [...prev, `💚 ${card.name}: Gained Regeneration ${statusEffect.stacks}!`]);
        }

        if (card.effect === 'buff_dodge') {
          const statusEffect = Array.isArray(card.statusEffect) ? card.statusEffect[0] : card.statusEffect;
          const dodgeStatus = createStatus('dodge', statusEffect.stacks);
          setPlayerStatuses(prev => applyStatus(prev, dodgeStatus));
          setBattleLog(prev => [...prev, `💨 ${card.name}: Gained Dodge ${statusEffect.stacks}!`]);
        }

        if (card.effect === 'buff_thorns') {
          const statusEffect = Array.isArray(card.statusEffect) ? card.statusEffect[0] : card.statusEffect;
          const thornsStatus = createStatus('thorns', statusEffect.stacks);
          setPlayerStatuses(prev => applyStatus(prev, thornsStatus));
          setBattleLog(prev => [...prev, `🌹 ${card.name}: Gained Thorns ${statusEffect.stacks}!`]);
        }

        if (card.effect === 'buff_shield_dodge') {
          // Combo effect - applies multiple status effects
          const statusEffects = card.statusEffect;
          statusEffects.forEach(effect => {
            if (effect.type === 'shield') {
              const shieldStatus = createStatus('shield', effect.stacks);
              setPlayerStatuses(prev => applyStatus(prev, shieldStatus));
            } else if (effect.type === 'dodge') {
              const dodgeStatus = createStatus('dodge', effect.stacks);
              setPlayerStatuses(prev => applyStatus(prev, dodgeStatus));
            }
          });
          setBattleLog(prev => [...prev, `✨ ${card.name}: Gained Shield 15 and Dodge 1!`]);
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

    // Trigger particle effect
    const getCardColor = (type) => {
      switch (type) {
        case 'damage': return 'red';
        case 'heal': return 'green';
        case 'utility': return 'blue';
        case 'cleanse': return 'purple';
        case 'status': return 'yellow';
        default: return 'blue';
      }
    };

    setParticleEffect({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.4, // Upper-middle of screen
      color: getCardColor(card.type)
    });

    // Check if card requires dice roll
    if (card.diceRoll) {
      setPendingDiceCard(card);
      setShowDiceRoll(true);
    } else {
      executeCard(card);
    }
  }, [isBattleOver, playerEnergy, playerStatuses, hand.length, executeCard]);

  // ✅ Manual discard handler
  const handleManualDiscard = useCallback((card) => {
    if (isEnemyTurn || isBattleOver || isAttackAnimationPlaying || isTurnStarting) {
      console.warn('⚠️ Cannot discard cards during enemy turn or animations');
      return;
    }

    console.log('🗑️ Manually discarding card:', card.name);
    dispatchCardState({
      type: 'DISCARD_SINGLE_CARD',
      card
    });

    setBattleLog(prev => [...prev, `🗑️ Discarded ${card.name}`]);
  }, [isEnemyTurn, isBattleOver, isAttackAnimationPlaying, isTurnStarting]);

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
      // Mark that enemy turn is pending (will be triggered after banner + 1s delay)
      pendingEnemyTurnRef.current = true;
    } else {
      setBattleLog(prev => [...prev, '🪙 You won the coin flip! Your turn to attack!']);
      setIsEnemyTurn(false);
    }

    // Show banner for first turn (for both player and enemy)
    setTimeout(() => {
      setShowTurnBanner(true);
      setIsTurnStarting(true);
      bannerCooldownRef.current = true;

      setTimeout(() => {
        bannerCooldownRef.current = false;
      }, 2500);
    }, 500);
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
    if (isEnemyTurn || isTurnStarting) return;

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

    // ✅ CHANGED: Hand now persists, no discard
    console.log('✋ Hand persists:', hand.length, 'cards');

    setTurnCount(prev => prev + 1);

    // Delay enemy turn to let status effects fully process
    setTrackedTimeout(() => {
      setIsEnemyTurn(true);
      // Mark that enemy turn is pending (will be triggered after banner + 3s delay)
      pendingEnemyTurnRef.current = true;
    }, 400);
  }, [isEnemyTurn, isTurnStarting, playerStatuses, enemyStatuses, hand, setTrackedTimeout]);

  const performEnemyTurn = useCallback(() => {
    if (shouldSkipTurn(enemyStatuses)) {
      setBattleLog(prev => [...prev, `❄️ ${currentEnemy.name} is unable to act!`]);

      setTrackedTimeout(() => {
        console.log('🔄 Refilling hand and energy...');
        setPlayerEnergy(maxEnergy);
        setEnemyEnergy(maxEnemyEnergy); // Refill enemy energy

        // ✅ CHANGED: Draw up to max hand size of 5 (hand persists now)
        const maxHandSize = 5;
        const cardsToDraw = Math.max(0, maxHandSize - hand.length);
        if (cardsToDraw > 0) {
          console.log(`📥 Drawing ${cardsToDraw} cards to fill hand to ${maxHandSize}`);
          drawMultipleCards(cardsToDraw);
        } else {
          console.log(`✋ Hand full (${hand.length} cards)`);
        }

        setIsEnemyTurn(false);
      }, 1500);
      return;
    }

    // Refill enemy energy at start of turn
    let currentEnemyEnergy = maxEnemyEnergy;
    setEnemyEnergy(currentEnemyEnergy);

    // Helper function to execute a single ability
    const executeAbility = (selectedAbility, energyCost) => {
      setBattleLog(prev => [...prev, `${currentEnemy.name} ${selectedAbility.message} (${energyCost} AP)`]);

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

          // Dispatch asynchronously to avoid render conflicts
          setTimeout(() => {
            dispatch({ type: 'DAMAGE_PLAYER', amount: finalDamage });
          }, 0);

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
              const multiShieldResult = applyShieldBlock(playerStatuses, modDmg);
              setPlayerHealth(h => Math.max(0, h - multiShieldResult.damage));
              setPlayerStatuses(multiShieldResult.newStatuses);

              // Dispatch asynchronously
              setTimeout(() => {
                dispatch({ type: 'DAMAGE_PLAYER', amount: multiShieldResult.damage });
              }, 0);

              if (multiShieldResult.blocked > 0) {
                setBattleLog(log => [...log, `🛡️ Blocked ${multiShieldResult.blocked} damage!`]);
              }
              setBattleLog(log => [...log, `💥 ${multiShieldResult.damage} damage!`]);
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

          // Dispatch asynchronously
          setTimeout(() => {
            dispatch({ type: 'DAMAGE_PLAYER', amount: finalMultiDamage });
          }, 0);

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
    };

    // Recursive function to perform actions sequentially with delays
    const performNextAction = (remainingEnergy, actionCount) => {
      const maxActions = 10; // Safety limit

      if (remainingEnergy <= 0 || actionCount >= maxActions) {
        // End turn after final action
        setTrackedTimeout(() => {
          console.log('🔄 Refilling hand and energy...');
          setPlayerEnergy(maxEnergy);
          setEnemyEnergy(maxEnemyEnergy);

          // ✅ CHANGED: Draw up to max hand size of 5 (hand persists now)
          const maxHandSize = 5;
          const cardsToDraw = Math.max(0, maxHandSize - hand.length);
          if (cardsToDraw > 0) {
            console.log(`📥 Drawing ${cardsToDraw} cards to fill hand to ${maxHandSize}`);
            drawMultipleCards(cardsToDraw);
          } else {
            console.log(`✋ Hand full (${hand.length} cards)`);
          }

          setIsEnemyTurn(false);
          setIsAttackAnimationPlaying(false); // Reset animation lock
          setHasUsedDrawAbility(false);
          setHasUsedDiscardAbility(false);
        }, 4000); // Increased to 4 seconds to prevent animation overwriting
        return;
      }

      // Find affordable abilities
      const affordableAbilities = currentEnemy.abilities.filter(ability =>
        (ability.cost || 0) <= remainingEnergy
      );

      if (affordableAbilities.length === 0) {
        setBattleLog(prev => [...prev, `${currentEnemy.name} doesn't have enough energy for more actions!`]);
        // End turn
        setTrackedTimeout(() => {
          console.log('🔄 Refilling hand and energy...');
          setPlayerEnergy(maxEnergy);
          setEnemyEnergy(maxEnemyEnergy);
          drawMultipleCards(gameState.maxHandSize || 6);
          setIsEnemyTurn(false);
          setIsAttackAnimationPlaying(false); // Reset animation lock
          setHasUsedDrawAbility(false);
          setHasUsedDiscardAbility(false);
        }, 4000); // Increased to 4 seconds to prevent animation overwriting
        return;
      }

      // Select random ability using weighted chance
      const roll = Math.random() * 100;
      let cumulativeChance = 0;
      let selectedAbility = affordableAbilities[0];

      for (const ability of affordableAbilities) {
        cumulativeChance += ability.chance;
        if (roll <= cumulativeChance) {
          selectedAbility = ability;
          break;
        }
      }

      const abilityCost = selectedAbility.cost || 0;

      // Execute the ability
      executeAbility(selectedAbility, abilityCost);

      // Update energy display
      const newEnergy = remainingEnergy - abilityCost;
      setEnemyEnergy(newEnergy);

      // Schedule next action after animation delay
      setTrackedTimeout(() => {
        performNextAction(newEnergy, actionCount + 1);
      }, 4000); // 4 second delay between actions to prevent animation overwriting
    };

    // Start the action sequence
    performNextAction(currentEnemyEnergy, 0);
  }, [currentEnemy, enemyStatuses, maxEnergy, maxEnemyEnergy, playerStatuses, gameState.maxHandSize, drawMultipleCards, setTrackedTimeout, dispatch, maxEnemyHealth]);

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

    // Store last battle rewards for display on reward screen
    dispatch({
      type: 'SET_LAST_BATTLE_REWARDS',
      rewards: { gold: goldReward, exp: xpReward }
    });

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

  const handleForfeit = async () => {
    const confirmed = await confirm({
      title: 'Forfeit Battle?',
      message: 'Are you sure you want to forfeit this battle? Your run will end.',
      confirmText: 'Forfeit',
      cancelText: 'Continue Fighting',
      confirmColor: 'danger',
      cancelColor: 'green'
    });

    if (confirmed) {
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
      {settings.animatedBackground ? (
        <TorusTunnelBackground
          baseSpeed={1}
          baseRotation={1.9}
        />
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
      )}

      <div className="h-screen overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-2 p-2">
          {/* Header - 10% */}
          <div className="h-[10%] flex justify-between items-center px-4 py-2">
            <GameHeader
              battleNumber={gameState.currentFloor}
              gold={gameState.gold}
              turnCount={turnCount}
              onForfeit={handleForfeit}
              onMenuClick={() => setIsMenuOpen(true)}
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
              playerName={gameState.profile?.profileName || 'Player'}
              enemyEnergy={enemyEnergy}
              maxEnemyEnergy={maxEnemyEnergy}
              playerTime={playerTime}
              enemyTime={enemyTime}
              onAttackAnimationChange={setIsAttackAnimationPlaying}
              onCombatStateChange={setCombatStates}
            />

            {equippedConsumables.length > 0 && (
              <div className="absolute top-1/2 -translate-y-1/2 left-2 z-40">
                <NBDropdown
                  isOpen={consumablesBeltExpanded}
                  onToggle={() => setConsumablesBeltExpanded(!consumablesBeltExpanded)}
                  triggerLabel={`ITEMS (${equippedConsumables.length})`}
                  triggerIcon="⚡"
                  color="orange"
                  position="right"
                  contentClassName="max-w-xs"
                >
                  <h3 className="text-xs font-black uppercase mb-3 text-center">⚡ BATTLE ITEMS</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {equippedConsumables.map((item, index) => (
                      <ItemButton
                        key={index}
                        item={item}
                        onUse={handleUseItem}
                        disabled={isEnemyTurn || isAttackAnimationPlaying || isTurnStarting}
                        isUsed={usedConsumables.includes(item.instanceId)}
                      />
                    ))}
                  </div>
                </NBDropdown>
              </div>
            )}
          </div>

          {/* Cards Area - 28% */}
          <div className="h-[28%] px-3 py-2 flex flex-col overflow-hidden relative">
            {/* End Turn Button - Floating on Right Side */}
            <NBButton
              onClick={handleEndTurn}
              disabled={isEnemyTurn || isAttackAnimationPlaying || isTurnStarting}
              variant={isEnemyTurn || isAttackAnimationPlaying || isTurnStarting ? 'white' : 'danger'}
              size="lg"
              className={`
                absolute top-4 right-4 z-50
                px-8 py-4 text-xl
                ${isEnemyTurn || isAttackAnimationPlaying || isTurnStarting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isEnemyTurn ? 'ENEMY TURN...' : isTurnStarting ? 'STARTING...' : 'END TURN'}
            </NBButton>

            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-lg">Your Hand ({hand.length}/5)</h2>
              </div>

              {/* Discard Area - Right side */}
              <div
                className={`
                  nb-border-md nb-bg-red px-4 py-2
                  flex items-center gap-2
                  transition-all duration-200
                  ${isEnemyTurn || isBattleOver || isAttackAnimationPlaying || isTurnStarting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                `}
                title="Click cards below to discard them"
              >
                <span className="text-2xl">🗑️</span>
                <div className="text-center">
                  <div className="font-black text-sm uppercase">DISCARD</div>
                  <div className="text-xs font-bold">Click to Remove</div>
                </div>
              </div>
            </div>

            {/* Boss Abilities */}
            {(gameState.hasDrawAbility || gameState.hasDiscardAbility) && (
              <div className="mb-2 flex gap-2">
                {gameState.hasDrawAbility && (
                  <NBButton
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
                    disabled={isEnemyTurn || isBattleOver || playerEnergy < 3 || hasUsedDrawAbility || isAttackAnimationPlaying || isTurnStarting}
                    variant={playerEnergy >= 3 && !isEnemyTurn && !isBattleOver && !hasUsedDrawAbility && !isAttackAnimationPlaying && !isTurnStarting ? 'success' : 'white'}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <span className="text-sm">🎴</span>
                    DRAW (3⚡) {hasUsedDrawAbility && '✓'}
                  </NBButton>
                )}

                {gameState.hasDiscardAbility && (
                  <NBButton
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
                    disabled={isEnemyTurn || isBattleOver || hand.length === 0 || hasUsedDiscardAbility || isAttackAnimationPlaying || isTurnStarting}
                    variant={hand.length > 0 && !isEnemyTurn && !isBattleOver && !hasUsedDiscardAbility && !isAttackAnimationPlaying && !isTurnStarting ? 'orange' : 'white'}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <span className="text-sm">🗑️</span>
                    DISCARD {hasUsedDiscardAbility && '✓'}
                  </NBButton>
                )}
              </div>
            )}

            <CardHand
              hand={hand}
              onCardClick={(card, event) => {
                if (isEnemyTurn || isBattleOver || isAttackAnimationPlaying || isTurnStarting) return;

                // Shift+Click to discard
                if (event?.shiftKey) {
                  handleManualDiscard(card);
                } else {
                  handleCardPlay(card);
                }
              }}
              onCardRightClick={handleManualDiscard}
              disabled={isEnemyTurn || isBattleOver || isAttackAnimationPlaying || isTurnStarting}
              playerEnergy={playerEnergy}
              playerStatuses={playerStatuses}
              compact={false}
              enableAnimations={settings.cardAnimations}
            />
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

      {/* Turn Banner */}
      <TurnBanner
        isEnemyTurn={isEnemyTurn}
        show={showTurnBanner}
        onComplete={handleBannerComplete}
      />

      {/* Dice Roll Overlay */}
      {showDiceRoll && (
        <DiceRoll
          onRollComplete={handleDiceComplete}
          minValue={1}
          maxValue={6}
        />
      )}

      {/* Card Play Particles */}
      {settings.particleEffects && particleEffect && (
        <CardPlayParticles
          x={particleEffect.x}
          y={particleEffect.y}
          color={particleEffect.color}
          onComplete={() => setParticleEffect(null)}
        />
      )}

      {/* Battle Menu */}
      <BattleMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        gameState={gameState}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </PageTransition>
  );
};