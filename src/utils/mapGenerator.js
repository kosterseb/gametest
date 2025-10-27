import { basicEnemies, eliteEnemies, bossEnemies, finalBoss } from '../data/enemies';

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