# Branching Path System Design

## Overview
Transform the linear 25-floor progression into a branching path system where players choose between 3 distinct paths per act, all converging at the act boss.

## Current System
- 25 floors across 5 acts (5 floors per act)
- Boss floors: 5, 10, 15, 20, 25
- Each non-boss floor has 2-5 random nodes
- Player picks one node, advances to next floor
- Visibility: current floor + 3 floors ahead
- No true path divergence

## New System Architecture

### Act Structure
Each act consists of:
- **3 themed paths** (4 floors each)
- **1 convergence boss floor**
- Total: 5 floors per act

### Path Themes

#### 1. Combat Path (Red)
- **Theme**: High risk, high reward combat encounters
- **Node Distribution**:
  - 60% Enemy battles
  - 30% Elite battles
  - 10% Shop
- **Rewards**: +20% gold from battles
- **Description**: "Face fierce enemies for greater glory and gold"

#### 2. Fortune Path (Yellow)
- **Theme**: Economic focus with shops and gold opportunities
- **Node Distribution**:
  - 40% Enemy battles
  - 40% Shops
  - 20% Mystery nodes
- **Rewards**: Better shop deals, more gold drops
- **Description**: "Seek fortune through trade and discovery"

#### 3. Mystery Path (Cyan)
- **Theme**: Unpredictable rewards and challenges
- **Node Distribution**:
  - 30% Enemy battles
  - 20% Shops
  - 50% Mystery nodes
- **Rewards**: High variance outcomes (big risks, big rewards)
- **Description**: "Embrace the unknown for unpredictable outcomes"

### Data Structure

```javascript
// New map structure
{
  actNumber: 1,
  actRange: [1, 5], // Floors 1-5

  // Path selection phase (only at start of act)
  pathSelectionFloor: 0, // Virtual floor for path selection

  paths: [
    {
      pathId: 'act1_combat',
      theme: 'combat',
      name: 'Path of Battle',
      description: 'Face fierce enemies for greater glory and gold',
      color: 'red',
      icon: 'Swords',
      modifiers: {
        goldMultiplier: 1.2,
        encounterDifficulty: 1.1
      },
      floors: [
        {
          floor: 1,
          positionInPath: 0,
          node: {
            id: 'act1_combat_floor1',
            type: 'enemy',
            enemyData: {...},
            available: false, // Set true when path chosen
            completed: false
          }
        },
        { floor: 2, positionInPath: 1, node: {...} },
        { floor: 3, positionInPath: 2, node: {...} },
        { floor: 4, positionInPath: 3, node: {...} }
      ]
    },
    {
      pathId: 'act1_fortune',
      theme: 'fortune',
      // ... similar structure
    },
    {
      pathId: 'act1_mystery',
      theme: 'mystery',
      // ... similar structure
    }
  ],

  // Boss floor where all paths converge
  bossFloor: {
    floor: 5,
    node: {
      id: 'act1_boss',
      type: 'boss',
      bossIndex: 0,
      enemyData: {...},
      available: false, // Set true when any path completes floor 4
      completed: false
    }
  }
}
```

### State Management Changes

```javascript
// GameContext additions
{
  progressionMap: [], // New structure: array of act objects
  currentAct: 1, // 1-5
  currentActProgress: 'path_selection', // 'path_selection' | 'traversing' | 'boss'
  selectedPath: null, // 'combat' | 'fortune' | 'mystery'
  currentFloorInPath: 0, // 0-3 (position within the chosen path)
  currentAbsoluteFloor: 1, // 1-25 (for compatibility)
  completedFloors: [], // Array of floor numbers
}
```

### Visual Layout

```
ACT 1 - CHOOSE YOUR PATH

Path of Battle (RED)         Path of Fortune (YELLOW)      Path of the Unknown (CYAN)
[High Risk, High Reward]      [Shops & Treasures]           [Mystery & Chaos]

Floor 1: [ENEMY]              Floor 1: [ENEMY]              Floor 1: [MYSTERY]
    ↓                             ↓                             ↓
Floor 2: [ELITE]              Floor 2: [SHOP]               Floor 2: [MYSTERY]
    ↓                             ↓                             ↓
Floor 3: [ENEMY]              Floor 3: [ENEMY]              Floor 3: [ENEMY]
    ↓                             ↓                             ↓
Floor 4: [ELITE]              Floor 4: [SHOP]               Floor 4: [MYSTERY]
    ↓                             ↓                             ↓
    └─────────────────────────────┴─────────────────────────────┘
                                  ↓
                            Floor 5: [BOSS]
```

### Visibility Changes

**Old**: Show current floor + 3 floors ahead (4 floors total)
**New**: Show all floors from path selection to boss (5 floors total per act)

This allows players to:
- See all 3 complete paths before choosing
- Plan their route based on current needs (gold, items, exp)
- See the boss waiting at the end

### Generation Algorithm

```javascript
function generateBranchingMap(totalActs = 5) {
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
}

function generatePathsForAct(act) {
  const paths = [];
  const themes = ['combat', 'fortune', 'mystery'];

  themes.forEach(theme => {
    const path = {
      pathId: `act${act}_${theme}`,
      theme: theme,
      name: getPathName(theme),
      description: getPathDescription(theme),
      color: getPathColor(theme),
      modifiers: getPathModifiers(theme),
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
}
```

### User Flow

1. **Start of Act**: Player sees path selection screen
   - All 3 paths displayed side-by-side
   - Can see all 4 floors + boss for each path
   - Player selects one path

2. **Path Traversal**: Player follows chosen path
   - Other paths fade out/become disabled
   - Player progresses floor by floor (1 → 2 → 3 → 4)
   - Each floor has a single node to complete

3. **Boss Convergence**: After completing floor 4
   - Boss floor becomes available
   - All visual paths converge at boss
   - Player must defeat boss to proceed to next act

4. **Repeat**: After boss, move to next act's path selection

### Balancing

Each path theme should be balanced but different:
- **Combat Path**: Higher difficulty, higher rewards (gold/exp)
- **Fortune Path**: Moderate difficulty, guaranteed shops for preparation
- **Mystery Path**: Variable difficulty, potential for rare rewards or setbacks

This creates meaningful strategic choices without one path being strictly better.

## Implementation Checklist

- [ ] Create new `generateBranchingMap()` function
- [ ] Update GameContext state structure
- [ ] Create `PathSelectionScreen` component
- [ ] Update `ProgressionMapView` to show branching paths
- [ ] Add path theme modifiers system
- [ ] Update visibility to show full act
- [ ] Handle path selection and locking
- [ ] Visual indicators for active/inactive paths
- [ ] Boss convergence animation
- [ ] Test all 5 acts with different path choices
