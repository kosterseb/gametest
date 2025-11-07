import { basicEnemies, eliteEnemies, bossEnemies, finalBoss } from '../data/enemies';

// Path theme configurations
const PATH_THEMES = {
  combat: {
    name: 'Path of Battle',
    description: 'Face fierce enemies for greater glory and gold',
    color: 'red',
    icon: 'Swords',
    modifiers: {
      goldMultiplier: 1.2,
      expMultiplier: 1.2
    },
    nodeDistribution: {
      enemy: 0.60,
      elite: 0.30,
      shop: 0.10,
      joker: 0.00
    }
  },
  fortune: {
    name: 'Path of Fortune',
    description: 'Seek fortune through trade and discovery',
    color: 'yellow',
    icon: 'Coins',
    modifiers: {
      shopDiscount: 0.15,
      goldMultiplier: 1.1
    },
    nodeDistribution: {
      enemy: 0.40,
      elite: 0.00,
      shop: 0.40,
      joker: 0.20
    }
  },
  mystery: {
    name: 'Path of the Unknown',
    description: 'Embrace the unknown for unpredictable outcomes',
    color: 'cyan',
    icon: 'HelpCircle',
    modifiers: {
      jokerBonusMultiplier: 1.5
    },
    nodeDistribution: {
      enemy: 0.30,
      elite: 0.00,
      shop: 0.20,
      joker: 0.50
    }
  }
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

// Generate all 3 paths for an act
const generatePathsForAct = (act) => {
  const paths = [];
  const themes = ['combat', 'fortune', 'mystery'];

  themes.forEach(theme => {
    const themeConfig = PATH_THEMES[theme];
    const path = {
      pathId: `act${act}_${theme}`,
      theme: theme,
      name: themeConfig.name,
      description: themeConfig.description,
      color: themeConfig.color,
      icon: themeConfig.icon,
      modifiers: themeConfig.modifiers,
      floors: []
    };

    // Generate 4 floors for this path
    for (let i = 0; i < 4; i++) {
      const absoluteFloor = (act - 1) * 5 + i + 1;
      const nodeType = selectNodeTypeForPath(theme, i, act);

      path.floors.push({
        floor: absoluteFloor,
        positionInPath: i,
        node: generateNode(nodeType, act, `act${act}_${theme}_floor${i}`)
      });
    }

    paths.push(path);
  });

  return paths;
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

// Main map generation function with branching paths
export const generateBranchingMap = (totalActs = 5) => {
  const map = [];

  for (let act = 1; act <= totalActs; act++) {
    const actData = {
      actNumber: act,
      actRange: [(act - 1) * 5 + 1, act * 5],
      paths: generatePathsForAct(act),
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