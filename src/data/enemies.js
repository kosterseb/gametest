// src/data/enemies.js
import { createStatus } from './statusEffects';

// Enemy difficulty tiers
export const ENEMY_TIERS = {
  BASIC: 'basic',
  ELITE: 'elite',
  BOSS: 'boss'
};

// Basic enemies (Floors 1-20)
export const basicEnemies = [
  {
    name: "Goblin Scout",
    health: 70,
    goldReward: [8, 15],
    actionPoints: 20,
    abilities: [
      {
        name: "Quick Slash",
        type: "damage",
        damage: [4, 7],
        cost: 4,
        chance: 60,
        message: "slashes at you!"
      },
      {
        name: "Dodge",
        type: "skip",
        cost: 3,
        chance: 20,
        message: "dodges your attack!"
      },
      {
        name: "Rally",
        type: "buff",
        healing: 5,
        cost: 3,
        chance: 20,
        message: "rallies and recovers!"
      }
    ]
  },
  {
    name: "Bandit",
    health: 80,
    goldReward: [10, 18],
    actionPoints: 20,
    abilities: [
      {
        name: "Dagger Strike",
        type: "damage",
        damage: [6, 10],
        cost: 5,
        chance: 50,
        message: "strikes with a dagger!"
      },
      {
        name: "Poison Blade",
        type: "status",
        status: () => createStatus('poison', 2),
        cost: 4,
        chance: 30,
        message: "coats their blade in poison!"
      },
      {
        name: "Steal",
        type: "skip",
        cost: 2,
        chance: 20,
        message: "attempts to steal but misses!"
      }
    ]
  },
  {
    name: "Wild Wolf",
    health: 90,
    goldReward: [8, 12],
    actionPoints: 20,
    abilities: [
      {
        name: "Bite",
        type: "damage",
        damage: [8, 12],
        cost: 6,
        chance: 60,
        message: "bites ferociously!"
      },
      {
        name: "Howl",
        type: "status",
        status: () => createStatus('weak', 1, 2),
        cost: 4,
        chance: 25,
        message: "howls, weakening you!"
      },
      {
        name: "Pounce",
        type: "damage",
        damage: [5, 8],
        cost: 4,
        chance: 15,
        message: "pounces quickly!"
      }
    ]
  },
  {
    name: "Skeleton Warrior",
    health: 100,
    goldReward: [12, 20],
    actionPoints: 20,
    abilities: [
      {
        name: "Bone Sword",
        type: "damage",
        damage: [7, 11],
        cost: 5,
        chance: 50,
        message: "swings a bone sword!"
      },
      {
        name: "Rattle",
        type: "status",
        status: () => createStatus('dazed', 1, 2),
        cost: 4,
        chance: 30,
        message: "rattles its bones, dazing you!"
      },
      {
        name: "Bone Shield",
        type: "buff",
        cost: 3,
        chance: 20,
        message: "raises a bone shield!"
      }
    ]
  },
  {
    name: "Dark Cultist",
    health: 84,
    goldReward: [15, 22],
    actionPoints: 20,
    abilities: [
      {
        name: "Dark Bolt",
        type: "damage",
        damage: [9, 13],
        cost: 6,
        chance: 50,
        message: "fires a dark bolt!"
      },
      {
        name: "Curse",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [5, 8]
          },
          {
            type: "status",
            status: () => createStatus('cursed', 1)
          }
        ],
        cost: 7,
        chance: 35,
        message: "casts a cursing spell!"
      },
      {
        name: "Shadow Step",
        type: "skip",
        cost: 2,
        chance: 15,
        message: "steps into shadows!"
      }
    ]
  },
  {
    name: "Flame Imp",
    health: 76,
    goldReward: [10, 16],
    actionPoints: 20,
    abilities: [
      {
        name: "Fireball",
        type: "damage",
        damage: [10, 14],
        cost: 6,
        chance: 50,
        message: "hurls a fireball!"
      },
      {
        name: "Burning Touch",
        type: "status",
        status: () => createStatus('burn', 3),
        cost: 5,
        chance: 35,
        message: "ignites you with burning flames!"
      },
      {
        name: "Ember Shield",
        type: "rest",
        healing: 8,
        cost: 4,
        chance: 15,
        message: "creates an ember shield and recovers!"
      }
    ]
  },
  {
    name: "Ice Sprite",
    health: 72,
    goldReward: [12, 18],
    actionPoints: 20,
    abilities: [
      {
        name: "Frost Bite",
        type: "damage",
        damage: [6, 10],
        cost: 5,
        chance: 50,
        message: "attacks with frost!"
      },
      {
        name: "Freeze",
        type: "status",
        status: () => createStatus('freeze', 1),
        cost: 4,
        chance: 30,
        message: "attempts to freeze you!"
      },
      {
        name: "Ice Armor",
        type: "rest",
        healing: 10,
        cost: 4,
        chance: 20,
        message: "forms ice armor and heals!"
      }
    ]
  },
  {
    name: "Poison Spider",
    health: 64,
    goldReward: [8, 14],
    actionPoints: 20,
    abilities: [
      {
        name: "Venomous Bite",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [4, 7]
          },
          {
            type: "status",
            status: () => createStatus('poison', 3)
          }
        ],
        cost: 6,
        chance: 60,
        message: "bites with venomous fangs!"
      },
      {
        name: "Web Trap",
        type: "status",
        status: () => createStatus('slow', 2),
        cost: 4,
        chance: 25,
        message: "traps you in webbing!"
      },
      {
        name: "Scurry",
        type: "skip",
        cost: 2,
        chance: 15,
        message: "scurries away!"
      }
    ]
  }
];

// Elite enemies (appear every 5 floors)
export const eliteEnemies = [
  {
    name: "Ogre Brute",
    health: 160,
    goldReward: [30, 50],
    isElite: true,
    actionPoints: 28,
    abilities: [
      {
        name: "Club Smash",
        type: "damage",
        damage: [15, 22],
        cost: 8,
        chance: 50,
        message: "smashes with a massive club!"
      },
      {
        name: "Ground Slam",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [10, 15]
          },
          {
            type: "status",
            status: () => createStatus('stun', 1)
          }
        ],
        cost: 9,
        chance: 30,
        message: "slams the ground, stunning you!"
      },
      {
        name: "Berserker Rage",
        type: "buff",
        healing: 15,
        cost: 5,
        chance: 20,
        message: "enters a berserker rage!"
      }
    ]
  },
  {
    name: "Shadow Assassin",
    health: 130,
    goldReward: [35, 55],
    isElite: true,
    actionPoints: 30,
    abilities: [
      {
        name: "Backstab",
        type: "damage",
        damage: [20, 28],
        cost: 10,
        chance: 40,
        message: "backstabs with deadly precision!"
      },
      {
        name: "Shadow Strike",
        type: "multi_hit",
        damage: [8, 12],
        hits: 3,
        cost: 9,
        chance: 35,
        message: "strikes from the shadows multiple times!"
      },
      {
        name: "Smoke Bomb",
        type: "skip",
        cost: 3,
        chance: 25,
        message: "vanishes in smoke!"
      }
    ]
  },
  {
    name: "Corrupted Knight",
    health: 180,
    goldReward: [40, 60],
    isElite: true,
    actionPoints: 30,
    abilities: [
      {
        name: "Dark Slash",
        type: "damage",
        damage: [12, 18],
        cost: 7,
        chance: 45,
        message: "slashes with a corrupted blade!"
      },
      {
        name: "Cursed Strike",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [10, 14]
          },
          {
            type: "status",
            status: () => createStatus('weak', 1, 3)
          }
        ],
        cost: 8,
        chance: 35,
        message: "strikes with cursed energy!"
      },
      {
        name: "Dark Recovery",
        type: "rest",
        healing: 20,
        cost: 6,
        chance: 20,
        message: "recovers with dark magic!"
      }
    ]
  },
  {
    name: "Flame Golem",
    health: 190,
    goldReward: [45, 65],
    isElite: true,
    actionPoints: 28,
    abilities: [
      {
        name: "Molten Punch",
        type: "damage",
        damage: [18, 24],
        cost: 9,
        chance: 45,
        message: "punches with molten fists!"
      },
      {
        name: "Inferno",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [12, 16]
          },
          {
            type: "status",
            status: () => createStatus('burn', 5)
          }
        ],
        cost: 10,
        chance: 40,
        message: "unleashes an inferno!"
      },
      {
        name: "Magma Shield",
        type: "rest",
        healing: 18,
        cost: 5,
        chance: 15,
        message: "creates a magma shield and heals!"
      }
    ]
  }
];

// Boss enemies (floors 8, 16, 24)
export const bossEnemies = [
  {
    name: "Reed",
    health: 240,
    goldReward: [60, 100],
    isBoss: true,
    actionPoints: 32,
    avatarParams: {
      body: 'variant07',
      beard: 'variant08',
      beardProbability: '100',
      lips: 'variant04',
      hair: 'hat',
      eyes: 'variant05',
      brows: 'variant05',
      glassesProbability: '0'
    },
    abilities: [
      {
        name: "Royal Strike",
        type: "damage",
        damage: [20, 28],
        cost: 10,
        chance: 40,
        message: "strikes with royal authority!"
      },
      {
        name: "Summon Minions",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [8, 12]
          },
          {
            type: "status",
            status: () => createStatus('vulnerable', 1, 3)
          }
        ],
        cost: 11,
        chance: 35,
        message: "summons minions to attack!"
      },
      {
        name: "Crown's Blessing",
        type: "rest",
        healing: 25,
        cost: 7,
        chance: 25,
        message: "the crown's magic heals the king!"
      }
    ]
  },
  {
    name: "Ancient Lich",
    health: 300,
    goldReward: [80, 120],
    isBoss: true,
    actionPoints: 34,
    abilities: [
      {
        name: "Death Ray",
        type: "damage",
        damage: [25, 35],
        cost: 12,
        chance: 35,
        message: "fires a death ray!"
      },
      {
        name: "Necromancy",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [15, 20]
          },
          {
            type: "rest",
            healing: 20
          }
        ],
        cost: 13,
        chance: 35,
        message: "uses necromancy to damage and heal!"
      },
      {
        name: "Life Drain",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [18, 25]
          },
          {
            type: "status",
            status: () => createStatus('weak', 1, 3)
          }
        ],
        cost: 11,
        chance: 30,
        message: "drains your life force!"
      }
    ]
  },
  {
    name: "Dragon Lord",
    health: 360,
    goldReward: [100, 150],
    isBoss: true,
    actionPoints: 36,
    abilities: [
      {
        name: "Dragon Breath",
        type: "multi_action",
        actions: [
          {
            type: "damage",
            damage: [30, 40]
          },
          {
            type: "status",
            status: () => createStatus('burn', 6)
          }
        ],
        cost: 15,
        chance: 40,
        message: "breathes scorching fire!"
      },
      {
        name: "Tail Swipe",
        type: "multi_hit",
        damage: [15, 20],
        hits: 2,
        cost: 10,
        chance: 35,
        message: "swipes with its massive tail!"
      },
      {
        name: "Intimidating Roar",
        type: "status",
        status: () => createStatus('weak', 1, 4),
        cost: 7,
        chance: 25,
        message: "roars with terrifying might!"
      }
    ]
  }
];

// Final boss (floor 25)
export const finalBoss = {
  name: "Shadow Demon",
  health: 400,
  goldReward: [150, 200],
  isBoss: true,
  isFinalBoss: true,
  actionPoints: 40,
  abilities: [
    {
      name: "Shadow Claw",
      type: "damage",
      damage: [28, 38],
      cost: 12,
      chance: 30,
      message: "slashes with shadow claws!"
    },
    {
      name: "Dark Ritual",
      type: "multi_action",
      actions: [
        {
          type: "damage",
          damage: [20, 28]
        },
        {
          type: "status",
          status: () => createStatus('cursed', 2)
        },
        {
          type: "status",
          status: () => createStatus('weak', 1, 3)
        }
      ],
      cost: 15,
      chance: 30,
      message: "performs a dark ritual!"
    },
    {
      name: "Void Strike",
      type: "multi_hit",
      damage: [18, 25],
      hits: 2,
      cost: 11,
      chance: 25,
      message: "strikes from the void!"
    },
    {
      name: "Demon's Recovery",
      type: "rest",
      healing: 30,
      cost: 8,
      chance: 15,
      message: "recovers with demonic energy!"
    }
  ]
};

// Get random enemy for a floor
export const getEnemyForFloor = (floor) => {
  // Boss floors
  if (floor === 25) {
    return { ...finalBoss, act: 3 };
  }
  if (floor % 8 === 0) {
    const boss = bossEnemies[Math.floor(Math.random() * bossEnemies.length)];
    return { ...boss, act: Math.ceil(floor / 8) };
  }
  
  // Elite floors
  if (floor % 5 === 0) {
    const elite = eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
    return { ...elite, act: Math.ceil(floor / 8) };
  }
  
  // Regular enemies
  const enemy = basicEnemies[Math.floor(Math.random() * basicEnemies.length)];
  return { ...enemy, act: Math.ceil(floor / 8) };
};

console.log('👹 Enemies loaded:', basicEnemies.length, 'basic,', eliteEnemies.length, 'elite,', bossEnemies.length, 'bosses');