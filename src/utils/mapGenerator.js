import { basicEnemies, eliteEnemies, bossEnemies, finalBoss } from '../data/enemies';

// Biome theme configurations (will be expanded to 15 biomes - 3 per act)
const BIOME_THEMES = {
  // ACT 1 BIOMES (Easy)
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
      enemy: 0.55,
      elite: 0.10,
      shop: 0.20,
      joker: 0.15
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
      enemy: 0.50,
      elite: 0.10,
      shop: 0.25,
      joker: 0.15
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
      enemy: 0.45,
      elite: 0.15,
      shop: 0.20,
      joker: 0.20
    }
  },

  // ACT 2 BIOMES (Medium) - Placeholder for now
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
      enemy: 0.60,
      elite: 0.20,
      shop: 0.10,
      joker: 0.10
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
      enemy: 0.55,
      elite: 0.20,
      shop: 0.15,
      joker: 0.10
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
      enemy: 0.50,
      elite: 0.20,
      shop: 0.20,
      joker: 0.10
    }
  },

  // PLACEHOLDERS for Acts 3, 4, 5 (will design these with the user later)
  // We'll add 9 more biomes during the biome design phase
};

// Generate node based on type
const generateNode = (nodeType, act, nodeId) => {
  if (nodeType === 'enemy') {
    const randomEnemy = basicEnemies[Math.floor(Math.random() * basicEnemies.length)];
    return {
      id: nodeId,
      type: 'enemy',
      enemyData: { ...randomEnemy, act },
      completed: false,
      available: false
    };
  } else if (nodeType === 'elite') {
    const randomElite = eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
    return {
      id: nodeId,
      type: 'elite',
      enemyData: { ...randomElite, act },
      completed: false,
      available: false
    };
  } else {
    return {
      id: nodeId,
      type: nodeType,
      completed: false,
      available: false
    };
  }
};

// Select node type based on path theme and position
const selectNodeTypeForPath = (theme, positionInPath, act) => {
  const themeConfig = PATH_THEMES[theme];
  const distribution = themeConfig.nodeDistribution;

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

// Get biome keys for a specific act
const getBiomesForAct = (act) => {
  if (act === 1) return ['swamp', 'forest', 'caves'];
  if (act === 2) return ['volcano', 'frost', 'desert'];
  // Placeholder for acts 3, 4, 5 - will add more biomes later
  if (act === 3) return ['swamp', 'volcano', 'forest']; // Reusing for now
  if (act === 4) return ['frost', 'desert', 'caves']; // Reusing for now
  if (act === 5) return ['swamp', 'volcano', 'frost']; // Reusing for now
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

    // For each node in previous floor, create 2-3 branches
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