import { basicEnemies, eliteEnemies, bossEnemies, finalBoss } from '../data/enemies';

// Biome theme configurations - 15 TOTAL BIOMES (3 per act)
const BIOME_THEMES = {
  // ========== ACT 1 BIOMES (Easy/Tutorial) ==========
  swamp: {
    names: ['Poisonmire', 'Toxicrest', 'Venomhaven', 'Murkmire', 'Rotfen'],
    suffix: ['Depths', 'Marshlands', 'Basin', 'Wetlands', 'Bog'],
    icon: '🐸',
    color: 'green',
    description: 'A toxic swamp filled with venomous creatures',
    theme: 'poison',
    modifiers: {
      poisonDamage: 1.2,
      goldMultiplier: 1.0
    },
    nodeDistribution: {
      enemy: 0.45,
      elite: 0.08,
      shop: 0.18,
      event: 0.15,
      mystery: 0.05,
      god: 0.01,
      rest: 0.08,
      joker: 0.00 // Deprecated in favor of event nodes
    }
  },
  forest: {
    names: ['Wildwood', 'Thornvale', 'Greenbark', 'Leafshade', 'Rootglen'],
    suffix: ['Grove', 'Thicket', 'Woods', 'Canopy', 'Wilds'],
    icon: '🌲',
    color: 'green',
    description: 'An ancient forest teeming with wildlife',
    theme: 'nature',
    modifiers: {
      healingBonus: 1.3,
      goldMultiplier: 1.0
    },
    nodeDistribution: {
      enemy: 0.40,
      elite: 0.08,
      shop: 0.20,
      event: 0.18,
      mystery: 0.05,
      god: 0.01,
      rest: 0.08,
      joker: 0.00
    }
  },
  caves: {
    names: ['Deepstone', 'Shadowcave', 'Crystalmine', 'Darkholm', 'Stonedeep'],
    suffix: ['Caverns', 'Tunnels', 'Mines', 'Depths', 'Grottos'],
    icon: '⛏️',
    color: 'gray',
    description: 'Dark caverns filled with ancient secrets',
    theme: 'earth',
    modifiers: {
      goldMultiplier: 1.15,
      itemDropBonus: 1.1
    },
    nodeDistribution: {
      enemy: 0.35,
      elite: 0.12,
      shop: 0.18,
      event: 0.15,
      mystery: 0.08,
      god: 0.02,
      rest: 0.10,
      joker: 0.00
    }
  },

  // ========== ACT 2 BIOMES (Medium) ==========
  volcano: {
    names: ['Emberfall', 'Magmapeak', 'Ashcrown', 'Cindermont', 'Blazerock'],
    suffix: ['Caldera', 'Peaks', 'Summit', 'Crater', 'Ridge'],
    icon: '🌋',
    color: 'red',
    description: 'A volcanic wasteland of fire and ash',
    theme: 'fire',
    modifiers: {
      burnDamage: 1.25,
      goldMultiplier: 1.1
    },
    nodeDistribution: {
      enemy: 0.50,
      elite: 0.15,
      shop: 0.12,
      event: 0.12,
      mystery: 0.04,
      god: 0.01,
      rest: 0.06,
      joker: 0.00
    }
  },
  frost: {
    names: ['Frostwind', 'Icepeak', 'Snowveil', 'Glaciercrest', 'Winterhold'],
    suffix: ['Hollow', 'Tundra', 'Wastes', 'Fjord', 'Expanse'],
    icon: '❄️',
    color: 'cyan',
    description: 'A frozen wasteland of ice and snow',
    theme: 'ice',
    modifiers: {
      freezeDuration: 1.3,
      goldMultiplier: 1.1
    },
    nodeDistribution: {
      enemy: 0.48,
      elite: 0.15,
      shop: 0.14,
      event: 0.12,
      mystery: 0.04,
      god: 0.01,
      rest: 0.06,
      joker: 0.00
    }
  },
  desert: {
    names: ['Sandscorch', 'Duneveil', 'Sunblight', 'Aridcrest', 'Miragefall'],
    suffix: ['Dunes', 'Wastes', 'Expanse', 'Plains', 'Basin'],
    icon: '🏜️',
    color: 'yellow',
    description: 'A scorching desert of endless sand',
    theme: 'sand',
    modifiers: {
      exhaustDamage: 1.2,
      goldMultiplier: 1.05
    },
    nodeDistribution: {
      enemy: 0.45,
      elite: 0.15,
      shop: 0.15,
      event: 0.14,
      mystery: 0.04,
      god: 0.01,
      rest: 0.06,
      joker: 0.00
    }
  },

  // ========== ACT 3 BIOMES (Advanced) ==========
  ocean: {
    names: ['Deepcurrent', 'Tidecrest', 'Abyssreach', 'Coralspire', 'Wavecrash'],
    suffix: ['Depths', 'Reef', 'Trench', 'Abyss', 'Current'],
    icon: '🌊',
    color: 'blue',
    description: 'Underwater ruins filled with ancient horrors',
    theme: 'water',
    modifiers: {
      waterDamage: 1.25,
      goldMultiplier: 1.15
    },
    nodeDistribution: {
      enemy: 0.45,
      elite: 0.18,
      shop: 0.10,
      event: 0.14,
      mystery: 0.06,
      god: 0.02,
      rest: 0.05,
      joker: 0.00
    }
  },
  sky: {
    names: ['Cloudpeak', 'Stormcrest', 'Windspire', 'Skyreach', 'Thundervale'],
    suffix: ['Citadel', 'Spire', 'Heights', 'Summit', 'Peaks'],
    icon: '☁️',
    color: 'cyan',
    description: 'Floating islands among the clouds',
    theme: 'air',
    modifiers: {
      lightningDamage: 1.3,
      goldMultiplier: 1.15
    },
    nodeDistribution: {
      enemy: 0.42,
      elite: 0.18,
      shop: 0.12,
      event: 0.15,
      mystery: 0.06,
      god: 0.02,
      rest: 0.05,
      joker: 0.00
    }
  },
  shadow: {
    names: ['Darkveil', 'Shadowmire', 'Voidcrest', 'Duskrealm', 'Nightfall'],
    suffix: ['Depths', 'Realm', 'Domain', 'Void', 'Expanse'],
    icon: '🌑',
    color: 'purple',
    description: 'A realm of corruption and darkness',
    theme: 'shadow',
    modifiers: {
      corruptionDamage: 1.3,
      goldMultiplier: 1.2
    },
    nodeDistribution: {
      enemy: 0.48,
      elite: 0.20,
      shop: 0.08,
      event: 0.12,
      mystery: 0.07,
      god: 0.02,
      rest: 0.03,
      joker: 0.00
    }
  },

  // ========== ACT 4 BIOMES (Hard) ==========
  crystal: {
    names: ['Prismpeak', 'Gemcrest', 'Crystalspire', 'Arcanefall', 'Shardreach'],
    suffix: ['Caverns', 'Mines', 'Sanctum', 'Grotto', 'Nexus'],
    icon: '💎',
    color: 'purple',
    description: 'Crystal caverns humming with arcane energy',
    theme: 'arcane',
    modifiers: {
      magicDamage: 1.35,
      goldMultiplier: 1.25
    },
    nodeDistribution: {
      enemy: 0.42,
      elite: 0.22,
      shop: 0.10,
      event: 0.12,
      mystery: 0.08,
      god: 0.02,
      rest: 0.04,
      joker: 0.00
    }
  },
  graveyard: {
    names: ['Bonecrest', 'Tombvale', 'Deadreach', 'Soulfen', 'Crypthollow'],
    suffix: ['Cemetery', 'Graveyard', 'Crypts', 'Tombs', 'Barrows'],
    icon: '⚰️',
    color: 'gray',
    description: 'A cursed graveyard where the dead walk',
    theme: 'undead',
    modifiers: {
      curseDamage: 1.3,
      goldMultiplier: 1.2
    },
    nodeDistribution: {
      enemy: 0.50,
      elite: 0.22,
      shop: 0.08,
      event: 0.10,
      mystery: 0.06,
      god: 0.01,
      rest: 0.03,
      joker: 0.00
    }
  },
  clockwork: {
    names: ['Gearcrest', 'Cogspire', 'Steamvale', 'Clockreach', 'Ironforge'],
    suffix: ['Factory', 'Foundry', 'Workshop', 'Forge', 'Complex'],
    icon: '⚙️',
    color: 'orange',
    description: 'A mechanical realm of gears and steam',
    theme: 'mechanical',
    modifiers: {
      mechanicalDamage: 1.3,
      goldMultiplier: 1.3
    },
    nodeDistribution: {
      enemy: 0.45,
      elite: 0.22,
      shop: 0.12,
      event: 0.10,
      mystery: 0.06,
      god: 0.02,
      rest: 0.03,
      joker: 0.00
    }
  },

  // ========== ACT 5 BIOMES (Endgame/Cosmic) ==========
  tiret: {
    names: ['Celestia', 'Divinecrest', 'Holyspire', 'Lightreach', 'Heavengate'],
    suffix: ['Haven', 'Sanctum', 'Paradise', 'Realm', 'Gates'],
    icon: '☀️',
    color: 'yellow',
    description: 'The divine realm of Tiret, where angels dwell',
    theme: 'holy',
    modifiers: {
      holyDamage: 1.4,
      goldMultiplier: 1.5
    },
    nodeDistribution: {
      enemy: 0.40,
      elite: 0.25,
      shop: 0.08,
      event: 0.10,
      mystery: 0.10,
      god: 0.05,
      rest: 0.02,
      joker: 0.00
    }
  },
  lumio: {
    names: ['Infernopeak', 'Hellcrest', 'Doomspire', 'Blazereach', 'Brimstone'],
    suffix: ['Abyss', 'Inferno', 'Pits', 'Depths', 'Hell'],
    icon: '🔥',
    color: 'red',
    description: 'The hellish realm of Lumio, domain of demons',
    theme: 'demonic',
    modifiers: {
      demonicDamage: 1.4,
      goldMultiplier: 1.5
    },
    nodeDistribution: {
      enemy: 0.50,
      elite: 0.25,
      shop: 0.05,
      event: 0.08,
      mystery: 0.08,
      god: 0.02,
      rest: 0.02,
      joker: 0.00
    }
  },
  celta: {
    names: ['Voidreach', 'Nullcrest', 'Nothingspire', 'Limbofall', 'Emptyvale'],
    suffix: ['Void', 'Limbo', 'Nothingness', 'Between', 'Expanse'],
    icon: '⚫',
    color: 'gray',
    description: 'The realm of Celta, the eternal nothingness',
    theme: 'void',
    modifiers: {
      voidDamage: 1.5,
      goldMultiplier: 1.5
    },
    nodeDistribution: {
      enemy: 0.45,
      elite: 0.25,
      shop: 0.06,
      event: 0.12,
      mystery: 0.08,
      god: 0.03,
      rest: 0.01,
      joker: 0.00
    }
  }
};

// Generate node based on type
const generateNode = (nodeType, act, nodeId) => {
  const baseNode = {
    id: nodeId,
    type: nodeType,
    completed: false,
    available: false
  };

  if (nodeType === 'enemy') {
    const randomEnemy = basicEnemies[Math.floor(Math.random() * basicEnemies.length)];
    return {
      ...baseNode,
      enemyData: { ...randomEnemy, act }
    };
  }

  if (nodeType === 'elite') {
    const randomElite = eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
    return {
      ...baseNode,
      enemyData: { ...randomElite, act }
    };
  }

  if (nodeType === 'event') {
    const randomEvent = MINI_GAME_EVENTS[Math.floor(Math.random() * MINI_GAME_EVENTS.length)];
    return {
      ...baseNode,
      eventData: {
        eventId: randomEvent.id,
        name: randomEvent.name,
        description: randomEvent.description
      }
    };
  }

  if (nodeType === 'mystery') {
    return {
      ...baseNode,
      mysteryData: {
        description: 'A mysterious encounter awaits...',
        rarity: 'rare'
      }
    };
  }

  if (nodeType === 'god') {
    return {
      ...baseNode,
      godData: {
        description: 'A divine blessing awaits!',
        rarity: 'legendary',
        rewards: {
          goldBonus: 100,
          cardReward: true,
          itemReward: true,
          upgradeBonus: 2
        }
      }
    };
  }

  if (nodeType === 'rest') {
    return {
      ...baseNode,
      restData: {
        description: 'A safe place to rest and save your progress',
        healAmount: 0.5, // 50% heal
        savesCheckpoint: true
      }
    };
  }

  // Shop, joker, and other types
  return baseNode;
};

// Select node type based on biome theme and position
const selectNodeTypeForPath = (biomeKey, positionInPath, act) => {
  const biomeConfig = BIOME_THEMES[biomeKey];
  const distribution = biomeConfig.nodeDistribution;

  // Act 1: No elites
  if (act === 1 && distribution.elite > 0) {
    // Redistribute elite chance to enemy
    const adjustedDist = {
      ...distribution,
      enemy: distribution.enemy + distribution.elite,
      elite: 0
    };
    return weightedRandomSelection(adjustedDist);
  }

  return weightedRandomSelection(distribution);
};

// Weighted random selection helper
const weightedRandomSelection = (distribution) => {
  const rand = Math.random();
  let cumulative = 0;

  for (const [nodeType, weight] of Object.entries(distribution)) {
    cumulative += weight;
    if (rand < cumulative && weight > 0) {
      return nodeType;
    }
  }

  // Fallback to enemy
  return 'enemy';
};

// Generate random biome name
const generateBiomeName = (biomeKey) => {
  const biome = BIOME_THEMES[biomeKey];
  const randomName = biome.names[Math.floor(Math.random() * biome.names.length)];
  const randomSuffix = biome.suffix[Math.floor(Math.random() * biome.suffix.length)];
  return `${randomName} ${randomSuffix}`;
};

// Mini-game event definitions (20+ types - empty stubs for now)
const MINI_GAME_EVENTS = [
  { id: 'rock_paper_scissors', name: 'Rock Paper Scissors', description: 'Best 2 out of 3' },
  { id: 'typing_speed', name: 'Speed Typing', description: 'Type 5 words in 10 seconds' },
  { id: 'tic_tac_toe', name: 'Tic Tac Toe', description: 'Beat the AI' },
  { id: 'sudoku', name: 'Sudoku Puzzle', description: 'Complete the puzzle' },
  { id: 'memory_match', name: 'Memory Match', description: 'Match pairs in time' },
  { id: 'simon_says', name: 'Pattern Memory', description: 'Repeat the pattern' },
  { id: 'math_quiz', name: 'Math Challenge', description: 'Solve 3 problems quickly' },
  { id: 'word_scramble', name: 'Word Unscramble', description: 'Unscramble the word' },
  { id: 'reaction_time', name: 'Reaction Test', description: 'Click when you see green' },
  { id: 'coin_flip', name: 'Coin Flip Gamble', description: 'Call heads or tails' },
  { id: 'dice_roll', name: 'Dice Challenge', description: 'Roll higher than the dealer' },
  { id: 'color_match', name: 'Color Matcher', description: 'Match the color' },
  { id: 'sequence_builder', name: 'Sequence Builder', description: 'Complete the sequence' },
  { id: 'riddle', name: 'Riddle Challenge', description: 'Solve the riddle' },
  { id: 'trivia', name: 'Trivia Question', description: 'Answer correctly' },
  { id: 'minesweeper', name: 'Minesweeper', description: 'Find safe spots' },
  { id: 'blackjack', name: 'Blackjack', description: 'Beat the dealer' },
  { id: 'number_guess', name: 'Number Guess', name: 'Guess the number 1-100' },
  { id: 'rapid_click', name: 'Rapid Clicker', description: 'Click 20 times in 5 seconds' },
  { id: 'maze_mini', name: 'Mini Maze', description: 'Find the exit' },
  { id: 'spot_difference', name: 'Spot the Difference', description: 'Find 3 differences' },
  { id: 'card_higher_lower', name: 'Higher or Lower', description: 'Guess the next card' },
];

// Get biome keys for a specific act (15 total biomes, 3 per act)
const getBiomesForAct = (act) => {
  if (act === 1) return ['swamp', 'forest', 'caves'];
  if (act === 2) return ['volcano', 'frost', 'desert'];
  if (act === 3) return ['ocean', 'sky', 'shadow'];
  if (act === 4) return ['crystal', 'graveyard', 'clockwork'];
  if (act === 5) return ['tiret', 'lumio', 'celta'];
  return ['swamp', 'forest', 'caves'];
};

// Generate a branching tree of nodes for a biome
const generateBranchingTree = (act, biomeKey, biomeId) => {
  const biome = BIOME_THEMES[biomeKey];
  const floors = [];
  let nodeIdCounter = 0;

  // Floor 1: Start with 1 node
  const startNode = {
    id: `${biomeId}_node_${nodeIdCounter++}`,
    type: selectNodeTypeForPath(biomeKey, 0, act),
    floor: (act - 1) * 5 + 1,
    position: { x: 0, y: 0 },
    parentIds: [],
    childrenIds: [],
    available: false,
    completed: false
  };

  if (startNode.type === 'enemy' || startNode.type === 'elite') {
    const enemyPool = startNode.type === 'elite' ? eliteEnemies : basicEnemies;
    const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    startNode.enemyData = { ...randomEnemy, act };
  }

  floors.push({
    floor: (act - 1) * 5 + 1,
    nodes: [startNode]
  });

  // Floors 2-4: Generate branching structure
  for (let floorNum = 2; floorNum <= 4; floorNum++) {
    const absoluteFloor = (act - 1) * 5 + floorNum;
    const previousFloor = floors[floorNum - 2];
    const newNodes = [];

    // Floor 4 special handling: create exactly 3 nodes total
    if (floorNum === 4) {
      // Create exactly 3 nodes for floor 4
      for (let i = 0; i < 3; i++) {
        const childNode = {
          id: `${biomeId}_node_${nodeIdCounter++}`,
          type: selectNodeTypeForPath(biomeKey, floorNum - 1, act),
          floor: absoluteFloor,
          position: { x: i - 1, y: floorNum - 1 }, // Position -1, 0, 1 (left, center, right)
          parentIds: [],
          childrenIds: [],
          available: false,
          completed: false
        };

        if (childNode.type === 'enemy' || childNode.type === 'elite') {
          const enemyPool = childNode.type === 'elite' ? eliteEnemies : basicEnemies;
          const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
          childNode.enemyData = { ...randomEnemy, act };
        }

        newNodes.push(childNode);
      }

      // Connect each floor 3 node to 1-2 random floor 4 nodes
      previousFloor.nodes.forEach((parentNode) => {
        const connectionCount = Math.floor(Math.random() * 2) + 1; // 1-2 connections
        const availableChildren = [...newNodes];

        for (let i = 0; i < connectionCount && availableChildren.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableChildren.length);
          const childNode = availableChildren[randomIndex];

          childNode.parentIds.push(parentNode.id);
          parentNode.childrenIds.push(childNode.id);

          // Remove to avoid duplicate connections from same parent
          availableChildren.splice(randomIndex, 1);
        }
      });
    } else {
      // For floors 2-3, create 2-3 branches per parent node
      previousFloor.nodes.forEach((parentNode, parentIndex) => {
        const branchCount = Math.floor(Math.random() * 2) + 2; // 2-3 branches

        for (let branch = 0; branch < branchCount; branch++) {
          // Calculate horizontal position for visual layout
          const baseX = parentIndex * branchCount + branch - 1;

          const childNode = {
            id: `${biomeId}_node_${nodeIdCounter++}`,
            type: selectNodeTypeForPath(biomeKey, floorNum - 1, act),
            floor: absoluteFloor,
            position: { x: baseX, y: floorNum - 1 },
            parentIds: [parentNode.id],
            childrenIds: [],
            available: false,
            completed: false
          };

          if (childNode.type === 'enemy' || childNode.type === 'elite') {
            const enemyPool = childNode.type === 'elite' ? eliteEnemies : basicEnemies;
            const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            childNode.enemyData = { ...randomEnemy, act };
          }

          newNodes.push(childNode);
          parentNode.childrenIds.push(childNode.id);
        }
      });
    }

    // Add convergence (merge some paths) - 30% chance per floor
    if (floorNum < 4 && newNodes.length > 3 && Math.random() < 0.3) {
      const mergeIndex = Math.floor(Math.random() * (newNodes.length - 1));
      const nodeToMerge = newNodes[mergeIndex];
      const mergeTarget = newNodes[mergeIndex + 1];

      // Merge nodeToMerge into mergeTarget
      mergeTarget.parentIds = [...new Set([...mergeTarget.parentIds, ...nodeToMerge.parentIds])];

      // Update parent nodes to point to merge target instead
      nodeToMerge.parentIds.forEach(parentId => {
        const parentFloor = floors[floorNum - 2];
        const parent = parentFloor.nodes.find(n => n.id === parentId);
        if (parent) {
          parent.childrenIds = parent.childrenIds.map(id =>
            id === nodeToMerge.id ? mergeTarget.id : id
          );
          parent.childrenIds = [...new Set(parent.childrenIds)]; // Remove duplicates
        }
      });

      // Remove the merged node
      newNodes.splice(mergeIndex, 1);
    }

    floors.push({
      floor: absoluteFloor,
      nodes: newNodes
    });
  }

  return floors;
};

// Generate all 3 biome options for an act (each with branching tree)
const generateBiomeOptionsForAct = (act) => {
  const biomeKeys = getBiomesForAct(act);
  const biomeOptions = [];

  biomeKeys.forEach((biomeKey, index) => {
    const biomeConfig = BIOME_THEMES[biomeKey];
    const biomeId = `act${act}_${biomeKey}`;
    const biomeName = generateBiomeName(biomeKey);

    const biomeOption = {
      biomeId: biomeId,
      biomeKey: biomeKey,
      name: biomeName,
      description: biomeConfig.description,
      icon: biomeConfig.icon,
      color: biomeConfig.color,
      theme: biomeConfig.theme,
      modifiers: biomeConfig.modifiers,
      floors: generateBranchingTree(act, biomeKey, biomeId)
    };

    biomeOptions.push(biomeOption);
  });

  return biomeOptions;
};

// Generate boss floor
const generateBossFloor = (act) => {
  const absoluteFloor = act * 5;
  const isFinalBoss = act === 5;
  const bossIndex = act - 1;

  let bossData;
  if (isFinalBoss) {
    bossData = { ...finalBoss };
  } else {
    bossData = { ...bossEnemies[bossIndex % bossEnemies.length] };
  }

  return {
    floor: absoluteFloor,
    node: {
      id: `act${act}_boss`,
      type: 'boss',
      enemyData: bossData,
      bossIndex: isFinalBoss ? 'final' : bossIndex,
      completed: false,
      available: false
    }
  };
};

// Main map generation function with branching tree system
export const generateBranchingMap = (totalActs = 5) => {
  const map = [];

  for (let act = 1; act <= totalActs; act++) {
    const actData = {
      actNumber: act,
      actRange: [(act - 1) * 5 + 1, act * 5],
      biomeOptions: generateBiomeOptionsForAct(act),
      bossFloor: generateBossFloor(act)
    };

    map.push(actData);
  }

  return map;
};

// Legacy compatibility - keep old function for gradual migration
export const generateMap = (totalNodes = 25) => {
  const map = [];
  const nodesPerAct = 5;
  const totalActs = Math.ceil(totalNodes / nodesPerAct);
  const bossFloors = [5, 10, 15, 20, 25];

  for (let act = 0; act < totalActs; act++) {
    for (let nodeInAct = 0; nodeInAct < nodesPerAct; nodeInAct++) {
      const nodeNumber = act * nodesPerAct + nodeInAct + 1;

      if (nodeNumber > totalNodes) break;

      const isBossFloor = bossFloors.includes(nodeNumber);

      if (isBossFloor) {
        const bossIndex = Math.floor((nodeNumber - 5) / 5);
        const isFinalBoss = nodeNumber === 25;

        // Get the appropriate boss
        let bossData;
        if (isFinalBoss) {
          bossData = { ...finalBoss };
        } else {
          bossData = { ...bossEnemies[bossIndex % bossEnemies.length] };
        }

        map.push({
          floor: nodeNumber,
          act: act + 1,
          isActEnd: true,
          isBossFloor: true,
          nodes: [{
            id: `act${act + 1}_boss`,
            type: 'boss',
            enemyData: bossData,
            bossIndex: isFinalBoss ? 'final' : bossIndex,
            completed: false,
            available: nodeNumber === 1
          }]
        });
      } else {
        const choiceCount = Math.floor(Math.random() * 4) + 2;
        const nodes = [];

        for (let i = 0; i < choiceCount; i++) {
          const nodeType = getRandomNodeType(act + 1);
          const nodeId = `act${act + 1}_node${nodeNumber}_choice${i}`;

          if (nodeType === 'enemy') {
            // Pick random basic enemy
            const randomEnemy = basicEnemies[Math.floor(Math.random() * basicEnemies.length)];
            nodes.push({
              id: nodeId,
              type: 'enemy',
              enemyData: { ...randomEnemy, act: act + 1 },
              completed: false,
              available: nodeNumber === 1
            });
          } else if (nodeType === 'elite') {
            // Pick random elite enemy
            const randomElite = eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
            nodes.push({
              id: nodeId,
              type: 'elite',
              enemyData: { ...randomElite, act: act + 1 },
              completed: false,
              available: nodeNumber === 1
            });
          } else {
            nodes.push({
              id: nodeId,
              type: nodeType,
              completed: false,
              available: nodeNumber === 1
            });
          }
        }

        map.push({
          floor: nodeNumber,
          act: act + 1,
          isActEnd: false,
          isBossFloor: false,
          nodes
        });
      }
    }
  }

  return map;
};

// Updated node type distribution
// Act 1: No elites
// Acts 2-5: Can have elites
const getRandomNodeType = (act) => {
  const roll = Math.random() * 100;

  // Act 1: No elites
  if (act === 1) {
    if (roll < 60) return 'enemy';
    if (roll < 85) return 'shop';
    return 'joker';
  }

  // Acts 2-5: Include elites (15% chance)
  if (roll < 50) return 'enemy';
  if (roll < 65) return 'elite';
  if (roll < 85) return 'shop';
  return 'joker';
};