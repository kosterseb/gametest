import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export const BattleRoute = () => {
  const { gameState, dispatch } = useGame();
  const { navigate } = useRouter();

  // Get current enemy from context
  const currentEnemy = gameState.currentEnemyData;

  // ✅ Use ref to track if deck is initialized
  const deckInitialized = useRef(false);
  const initialHandDrawn = useRef(false);

  // ✅ Track all timeouts for cleanup
  const timeoutsRef = useRef([]);

  // ✅ Ref to store performEnemyTurn to avoid circular dependencies
  const performEnemyTurnRef = useRef();

  // ✅ Initialize battle state correctly (BEFORE any early returns!)
  const [playerHealth, setPlayerHealth] = useState(gameState.playerHealth || 100);
  const [maxPlayerHealth] = useState(gameState.maxPlayerHealth || 100);
  const [enemyHealth, setEnemyHealth] = useState(currentEnemy?.health || 100);
  const [maxEnemyHealth] = useState(currentEnemy?.health || 100);

  const [playerEnergy, setPlayerEnergy] = useState(gameState.maxEnergy || 10);
  const [maxEnergy] = useState(gameState.maxEnergy || 10);

  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);

  const [isEnemyTurn, setIsEnemyTurn] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [turnCount, setTurnCount] = useState(1);

  const [playerStatuses, setPlayerStatuses] = useState([]);
  const [enemyStatuses, setEnemyStatuses] = useState([]);

  // ✅ Track used consumables
  const [usedConsumables, setUsedConsumables] = useState([]);

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

  // ✅ FIXED: Draw card with proper state updates
  const drawCard = useCallback(() => {
    setDeck(currentDeck => {
      if (currentDeck.length === 0) {
        // Try to reshuffle discard pile
        setDiscardPile(currentDiscard => {
          if (currentDiscard.length === 0) {
            setBattleLog(prev => [...prev, '⚠️ No cards left to draw!']);
            return currentDiscard;
          }
          
          console.log('♻️ Reshuffling', currentDiscard.length, 'cards from discard');
          const reshuffled = shuffleDeck(currentDiscard);
          const drawnCard = reshuffled[0];
          
          setHand(prev => {
            console.log('✋ Adding card to hand:', drawnCard.name);
            return [...prev, drawnCard];
          });
          setDeck(reshuffled.slice(1));
          setBattleLog(prev => [...prev, '♻️ Reshuffling discard pile into deck...']);
          
          return [];
        });
        return currentDeck;
      }

      const drawnCard = currentDeck[0];
      console.log('✋ Drawing card:', drawnCard.name, 'ID:', drawnCard.id);
      setHand(prev => [...prev, drawnCard]);
      
      return currentDeck.slice(1);
    });
  }, []);

  // ✅ FIXED: Draw multiple cards - use refs to coordinate state updates
  const drawMultipleCards = useCallback((count) => {
    console.log(`📚 Attempting to draw ${count} cards...`);

    // Use a ref to share data between setState callbacks
    const sharedData = { deck: null, discard: null, drawn: [] };

    // Step 1: Update deck and collect drawn cards
    setDeck(prevDeck => {
      sharedData.deck = [...prevDeck];

      setDiscardPile(prevDiscard => {
        sharedData.discard = [...prevDiscard];

        // Draw cards
        for (let i = 0; i < count; i++) {
          // Reshuffle if needed
          if (sharedData.deck.length === 0 && sharedData.discard.length > 0) {
            console.log('♻️ Reshuffling', sharedData.discard.length, 'cards');
            sharedData.deck = shuffleDeck(sharedData.discard);
            sharedData.discard = [];
            setBattleLog(prev => [...prev, '♻️ Reshuffling discard pile...']);
          }

          // Draw card
          if (sharedData.deck.length > 0) {
            const card = sharedData.deck.shift();
            sharedData.drawn.push(card);
            console.log('✋ Drawn:', card.name);
          } else {
            break;
          }
        }

        console.log(`📥 Drew ${sharedData.drawn.length} cards total`);

        // Step 2: Update hand
        if (sharedData.drawn.length > 0) {
          setHand(prevHand => {
            const updated = [...prevHand, ...sharedData.drawn];
            console.log(`✋ Hand: ${prevHand.length} -> ${updated.length}`);
            console.log(`✋ Cards in hand:`, updated.map(c => c.name));
            return updated;
          });
        }

        return sharedData.discard;
      });

      return sharedData.deck;
    });
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
      setDeck(shuffleDeck(defaultDeckCopies));
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
      setDeck(shuffleDeck(deckCopies));
    }

    deckInitialized.current = true;
  }, []); // Empty deps - only run once

  // ✅ FIXED: Draw initial hand ONLY ONCE
  useEffect(() => {
    if (deck.length > 0 && hand.length === 0 && !initialHandDrawn.current) {
      const handSize = gameState.maxHandSize || 6;
      console.log('✋ Drawing initial hand of', handSize, 'cards');
      initialHandDrawn.current = true;
      drawMultipleCards(handSize);
    }
  }, [deck.length, hand.length, gameState.maxHandSize, drawMultipleCards]);

  // Execute card effects
  const executeCard = useCallback((card) => {
    const cardType = card.type;

    switch (cardType) {
      case 'damage':
        let diceRoll = null;
        if (card.diceRoll) {
          diceRoll = Math.floor(Math.random() * 6) + 1;
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
        const healing = card.baseHeal || 0;
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
          const roll = Math.floor(Math.random() * 6) + 1;
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

  // ✅ FIXED: Card playing with proper removal
  const handleCardPlay = useCallback((card) => {
    const modifiedCost = getModifiedCardCost(card.energyCost, playerStatuses);

    if (playerEnergy < modifiedCost) {
      setBattleLog(prev => [...prev, '⚠️ Not enough energy!']);
      return;
    }

    console.log('🎴 Playing card:', card.name, 'ID:', card.id);
    console.log('✋ Hand before:', hand.length, 'cards');

    setPlayerEnergy(prev => prev - modifiedCost);

    // ✅ Remove card from hand using ID
    setHand(prev => {
      const filtered = prev.filter(c => c.id !== card.id);
      console.log('✋ Hand after:', filtered.length, 'cards');
      return filtered;
    });

    setDiscardPile(prev => [...prev, card]);

    executeCard(card);
  }, [playerEnergy, playerStatuses, hand.length, executeCard]);

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

    setUsedConsumables(prev => [...prev, item.instanceId]);
    setBattleLog(prev => [...prev, `${item.emoji} Used ${item.name}!`]);
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
    setDiscardPile(prev => [...prev, ...hand]);
    setHand([]);

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
    }, 1500);
  }, [currentEnemy, enemyStatuses, maxEnergy, playerStatuses, gameState.maxHandSize, drawMultipleCards, setTrackedTimeout, dispatch]);

  // ✅ Keep ref updated
  useEffect(() => {
    performEnemyTurnRef.current = performEnemyTurn;
  }, [performEnemyTurn]);

  // ✅ FIXED: Sync player health to GameContext regularly
  useEffect(() => {
    if (playerHealth !== gameState.playerHealth) {
      dispatch({ type: 'UPDATE_HEALTH', health: playerHealth });
    }
  }, [playerHealth, gameState.playerHealth, dispatch]);

  const handleVictory = useCallback(() => {
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
      setTrackedTimeout(() => {
        navigate('/boss-reward');
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <GameHeader
            battleNumber={gameState.currentFloor}
            gold={gameState.gold}
            turnCount={turnCount}
          />

          <div className="mb-4 flex justify-end">
            <button
              onClick={handleForfeit}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Forfeit
            </button>
          </div>

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
          />

          {equippedConsumables.length > 0 && (
            <div className="bg-white bg-opacity-90 p-4 rounded-xl mb-4 shadow-lg">
              <h3 className="text-lg font-bold mb-3">⚡ Battle Items</h3>
              <div className="flex gap-3 flex-wrap">
                {equippedConsumables.map((item, index) => (
                  <ItemButton
                    key={index}
                    item={item}
                    onUse={handleUseItem}
                    disabled={isEnemyTurn}
                    isUsed={usedConsumables.includes(item.instanceId)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Your Hand ({hand.length}/{gameState.maxHandSize})</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">
                    {playerEnergy}/{maxEnergy} Energy
                  </span>
                </div>
              </div>
              <button
                onClick={handleEndTurn}
                disabled={isEnemyTurn}
                className={`
                  px-6 py-3 rounded-lg font-bold text-lg transition-all
                  ${isEnemyTurn 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105'}
                `}
              >
                {isEnemyTurn ? 'Enemy Turn...' : 'End Turn'}
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {hand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => !isEnemyTurn && handleCardPlay(card)}
                  disabled={isEnemyTurn}
                  playerEnergy={playerEnergy}
                  playerStatuses={playerStatuses}
                />
              ))}
            </div>

            {hand.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No cards in hand. End your turn to draw new cards!
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};