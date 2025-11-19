/**
 * Dialogue Data Structure
 *
 * Each dialogue is an array of dialogue lines.
 * Each line has:
 * - character: { name, title, seed } - Character info for portrait
 * - text: String - The dialogue text
 * - choices: Array (optional) - Multiple choice options
 *   - text: Choice text
 *   - next: Next dialogue ID or action
 *   - variant: Button color variant (optional)
 */

// Character definitions
export const CHARACTERS = {
  STIJN: {
    name: 'Stijn',
    title: 'Your Best Friend',
    seed: 'stijn-friend'
  },
  REED: {
    name: 'Reed',
    title: 'The Programmer',
    seed: 'reed',
    avatarParams: {
      body: 'variant07',
      beard: 'variant08',
      beardProbability: '100',
      lips: 'variant04',
      hair: 'hat',
      eyes: 'variant05',
      brows: 'variant05',
      glassesProbability: '0'
    }
  },
  EDDY: {
    name: 'Eddy',
    title: 'The Elder Brother',
    seed: 'eddy-brother'
  },
  WILLY: {
    name: 'Willy',
    title: 'The Younger Brother',
    seed: 'willy-brother'
  },
  NARRATOR: {
    name: 'Narrator',
    title: null,
    seed: 'narrator'
  },
  MYSTERIOUS_FIGURE: {
    name: '???',
    title: 'Mysterious Figure',
    seed: 'mysterious-shadow'
  },
  FORTUNE_TELLER: {
    name: 'The Oracle',
    title: 'Seer of Fates',
    seed: 'oracle-fortune'
  },
  SHADOW_DEALER: {
    name: 'Shadow',
    title: 'Keeper of Bargains',
    seed: 'shadow-dealer'
  }
};

// Story Intro - First dialogue when starting story mode
export const STORY_INTRO = [
  {
    character: CHARACTERS.NARRATOR,
    text: "Your world was normal. Predictable. Mundane. Until it wasn't."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "Reality fractured. The rules changed. Everything became a game. A brutal, absurd, neo-gamified nightmare."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "Cards became weapons. Time became currency. Choices became survival."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Hey! You're still here! I thought I lost you when the world... well, when everything went crazy."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Look, I know this is insane. But we've got to adapt. The game has rules now. Learn them, or... don't. Your call."
  },
  {
    character: CHARACTERS.STIJN,
    text: "I'll help you through the first fight. After that, you're on your own. Welcome to Retenta.",
    choices: [
      {
        text: "Let's learn the basics. (Tutorial)",
        action: 'start_tutorial',
        variant: 'green'
      },
      {
        text: "I'll figure it out myself. (Skip Tutorial)",
        action: 'skip_tutorial',
        variant: 'red'
      }
    ]
  }
];

// Tutorial Dialogue - Stijn guides the player
export const TUTORIAL_INTRO = [
  {
    character: CHARACTERS.STIJN,
    text: "Alright, here's the deal. You've got cards. Each card costs energy. You've got a timer. Run out of time, and you start taking damage."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Drag a card UP to play it. Drag it to the RIGHT to discard it. Simple, right?"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Oh, and your hand? It sticks around. You draw up to 5 cards each turn. No more discarding everything like an amateur."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Watch out for the timer stages. Early game is chill. Mid game? Enemies get stronger. Late game? Things get desperate."
  },
  {
    character: CHARACTERS.STIJN,
    text: "If an enemy attacks and you have a counter card? You'll get a chance to block. 15 seconds. Make it count."
  },
  {
    character: CHARACTERS.STIJN,
    text: "That's the basics. Now let's see if you can actually survive. Good luck out there."
  }
];

// First Boss - Reed Introduction
export const REED_INTRO = [
  {
    character: CHARACTERS.REED,
    text: "Well, well, well. Look who made it this far. Impressive... for a beginner."
  },
  {
    character: CHARACTERS.REED,
    text: "I'm Reed. Programmer. Optimizer. And your first real challenge in this twisted game."
  },
  {
    character: CHARACTERS.REED,
    text: "You think you've learned the rules? I wrote better code before breakfast. Let me show you what efficiency looks like."
  },
  {
    character: CHARACTERS.REED,
    text: "Hope you're ready. Because I don't go easy on anyone. Not even friends."
  }
];

// Reed Defeat
export const REED_DEFEAT = [
  {
    character: CHARACTERS.REED,
    text: "...What? No. That's not possible. My calculations were perfect!"
  },
  {
    character: CHARACTERS.REED,
    text: "Fine. You win this round. But don't think this is over. The game's just getting started."
  },
  {
    character: CHARACTERS.REED,
    text: "You might be good, but you haven't met the brothers yet. Eddy and Willy make me look gentle."
  }
];

// Eddy and Willy Boss Introduction
export const BROTHERS_INTRO = [
  {
    character: CHARACTERS.EDDY,
    text: "Ah, the newcomer. Reed wasn't exaggerating. You've got some skill."
  },
  {
    character: CHARACTERS.WILLY,
    text: "Skill? Please. Reed was always too soft. We're different."
  },
  {
    character: CHARACTERS.EDDY,
    text: "I'm Eddy. The elder. The strategist. I play the long game."
  },
  {
    character: CHARACTERS.WILLY,
    text: "And I'm Willy. The younger. The aggressor. I end games fast."
  },
  {
    character: CHARACTERS.EDDY,
    text: "Together? We're unstoppable. Let's see if you can handle us both."
  }
];

// Random Event Dialogue Example
export const EVENT_MYSTERIOUS_STRANGER = [
  {
    character: {
      name: '???',
      title: 'Mysterious Figure',
      seed: 'mysterious-stranger'
    },
    text: "Wait. I have something that might interest you."
  },
  {
    character: {
      name: '???',
      title: 'Mysterious Figure',
      seed: 'mysterious-stranger'
    },
    text: "I can offer you power... for a price.",
    choices: [
      {
        text: "Take the deal. (+3 Strength, lose 20 max HP)",
        action: 'accept_deal',
        variant: 'red'
      },
      {
        text: "Refuse. (Gain 50 gold instead)",
        action: 'refuse_deal',
        variant: 'green'
      }
    ]
  }
];

// Victory Screen Dialogue
export const VICTORY_DIALOGUE = [
  {
    character: CHARACTERS.STIJN,
    text: "You did it! I knew you had it in you!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "But this was just the beginning. The game goes deeper than you think."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Rest up. Prepare. Because what's coming next... it's going to be rough."
  }
];

// 📚 Tutorial: Post-Battle Dialogue
export const POST_TUTORIAL_BATTLE = [
  {
    character: CHARACTERS.STIJN,
    text: "Not bad! You survived your first fight. That Training Dummy didn't stand a chance!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Before you start exploring the world, you need to understand something important - biomes."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Let me explain how they work. Ready?",
    choices: [
      {
        text: "Tell me about biomes! 🌍",
        action: 'start_biome_tutorial',
        variant: 'green'
      }
    ]
  }
];

// 📚 Tutorial: Biome Selection Explanation
export const BIOME_TUTORIAL = [
  {
    character: CHARACTERS.STIJN,
    text: "Alright! Before you start exploring, you need to choose a biome. Think of it as picking your adventure path."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Each biome has a unique theme and difficulty. Some are easier, some are tougher - but all have different enemies and rewards."
  },
  {
    character: CHARACTERS.STIJN,
    text: "You'll face multiple floors of enemies, then a boss at the end. Choose wisely - once you pick, you're locked in for this act!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "For now, just pick one that looks interesting. Once you choose, I'll show you how to navigate the map.",
    choices: [
      {
        text: "Got it! Let me choose 🌍",
        action: 'continue_to_map_tutorial',
        variant: 'green'
      }
    ]
  }
];

// 📚 Tutorial: Post-Map Tutorial Dialogue
export const POST_MAP_TUTORIAL = [
  {
    character: CHARACTERS.STIJN,
    text: "Great! You've got the hang of navigation. But there's one more thing you need to know..."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Your inventory and character progression. This is where you'll manage your gear, upgrade your talents, and build your deck."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Trust me, you'll want to know this stuff. Ready for a quick tour?",
    choices: [
      {
        text: "Show me everything! 📦",
        action: 'start_inventory_tutorial',
        variant: 'green'
      },
      {
        text: "I'll explore it later.",
        action: 'skip_inventory_tutorial',
        variant: 'white'
      }
    ]
  }
];

// 📚 Tutorial: Inventory & Character Menu
export const INVENTORY_TUTORIAL = [
  {
    character: CHARACTERS.STIJN,
    text: "One last thing - your character menu. Look for the menu button in the top-right corner during battles and on the map."
  },
  {
    character: CHARACTERS.STIJN,
    text: "It's where you'll manage everything important. Let me break down what's inside:"
  },
  {
    character: CHARACTERS.STIJN,
    text: "📦 DECK TAB: Manage your battle cards here. You can only bring a limited number into each fight, so build smart!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "🎒 INVENTORY TAB: All your items. Consumables you can use in battle, and passive items that give you permanent bonuses."
  },
  {
    character: CHARACTERS.STIJN,
    text: "⭐ TALENTS TAB: Spend talent points to unlock permanent upgrades. More health, more energy, better card options - the works!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "📊 STATS TAB: Track your run progress. See your wins, losses, damage dealt, floors cleared - all the juicy numbers."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Remember: Menu button = Top-right corner. You'll be clicking it a lot, trust me!",
    choices: [
      {
        text: "Got it, I'll find it! 👍",
        action: 'finish_inventory_tutorial',
        variant: 'green'
      }
    ]
  }
];

// 📚 Tutorial: Final Dialogue
export const TUTORIAL_COMPLETE = [
  {
    character: CHARACTERS.STIJN,
    text: "Alright, I think you're ready now. You know the basics: combat, navigation, and progression."
  },
  {
    character: CHARACTERS.STIJN,
    text: "From here on out, you're on your own. Make smart choices. Watch the timer. And don't die."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Good luck out there. You'll need it.",
    choices: [
      {
        text: "Let's do this! 🎮",
        action: 'start_real_game',
        variant: 'success'
      }
    ]
  }
];

// 🎭 STORY EVENT: Pre-Boss Encounter with Reed
export const REED_PRE_BATTLE_ENCOUNTER = [
  {
    character: CHARACTERS.STIJN,
    text: "Hold up. Someone's blocking the path ahead. That's... oh no."
  },
  {
    character: CHARACTERS.REED,
    text: "Well, well. If it isn't the new player everyone's talking about. And Stijn, still playing tour guide?"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Reed. Look, we don't want any trouble. We're just trying to get through."
  },
  {
    character: CHARACTERS.REED,
    text: "Oh, I'm not here for trouble. I'm here to see if you're worth the hype. The game's changed us all, but you... you're still fresh. Still naive."
  },
  {
    character: CHARACTERS.REED,
    text: "So tell me, newcomer. What makes you think you can survive in this world?",
    choices: [
      {
        text: "I've trained hard. I'm ready for anything.",
        action: 'reed_response_confident',
        variant: 'green'
      },
      {
        text: "I don't know if I can. But I have to try.",
        action: 'reed_response_humble',
        variant: 'white'
      },
      {
        text: "I'm not here to prove anything to you.",
        action: 'reed_response_defiant',
        variant: 'red'
      },
      {
        text: "Maybe we could work together instead of fighting?",
        action: 'reed_response_diplomatic',
        variant: 'cyan'
      }
    ]
  }
];

// 🎭 Reed Response: Confident Player
export const REED_RESPONSE_CONFIDENT = [
  {
    character: CHARACTERS.REED,
    text: "Confidence. I like that. Reminds me of myself before the world went to hell."
  },
  {
    character: CHARACTERS.REED,
    text: "But confidence without skill is just arrogance. I want to see if you can back it up."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Reed, come on. There's no need for this..."
  },
  {
    character: CHARACTERS.REED,
    text: "Relax, Stijn. I'm not going to fight them... yet. But if you really think you're ready, come find me later. I'll be waiting at the end of the path.",
    choices: [
      {
        text: "I will. Just wait and see.",
        action: 'reed_challenge_accepted',
        variant: 'success'
      }
    ]
  }
];

// 🎭 Reed Response: Humble Player
export const REED_RESPONSE_HUMBLE = [
  {
    character: CHARACTERS.REED,
    text: "Honesty. Rare trait these days. Most people either lie to themselves or to others."
  },
  {
    character: CHARACTERS.STIJN,
    text: "See? They're being reasonable. Maybe we can all just—"
  },
  {
    character: CHARACTERS.REED,
    text: "Reasonable doesn't survive in this world, Stijn. But... I respect the honesty."
  },
  {
    character: CHARACTERS.REED,
    text: "Tell you what. When you think you're ready, come find me at the end. Prove you can survive, and I might have something useful for you.",
    choices: [
      {
        text: "I'll do my best. Thank you.",
        action: 'reed_challenge_accepted',
        variant: 'success'
      }
    ]
  }
];

// 🎭 Reed Response: Defiant Player
export const REED_RESPONSE_DEFIANT = [
  {
    character: CHARACTERS.REED,
    text: "Ooh, defiant. I can work with that. The game loves players with attitude."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Uh, maybe dial it back a bit? Reed's not someone you want to provoke..."
  },
  {
    character: CHARACTERS.REED,
    text: "No, no. Let them talk. I've been waiting for someone with a spine. Everyone else just begs or runs."
  },
  {
    character: CHARACTERS.REED,
    text: "You want to prove you're different? Fine. Make it to the end of the path, and then we'll see if that fire is real or just talk.",
    choices: [
      {
        text: "Just wait. I'll be there soon.",
        action: 'reed_challenge_accepted',
        variant: 'success'
      }
    ]
  }
];

// 🎭 Reed Response: Diplomatic Player
export const REED_RESPONSE_DIPLOMATIC = [
  {
    character: CHARACTERS.REED,
    text: "...Work together? Hah. You really are new to this."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Actually, that's not a bad idea. We used to be friends, Reed. Remember?"
  },
  {
    character: CHARACTERS.REED,
    text: "That was before. Before the rules changed. Before everything became a transaction."
  },
  {
    character: CHARACTERS.REED,
    text: "But fine. You want cooperation? Prove you're worth cooperating with. Make it through the path ahead, and we'll talk at the end. Maybe.",
    choices: [
      {
        text: "Fair enough. I'll see you then.",
        action: 'reed_challenge_accepted',
        variant: 'success'
      }
    ]
  }
];

// 🎭 Reed Post-Battle: Victory (Different outcomes based on approach)
export const REED_DEFEAT_ENERGIZED = [
  {
    character: CHARACTERS.REED,
    text: "...Damn. You weren't kidding about being ready."
  },
  {
    character: CHARACTERS.STIJN,
    text: "I told you! They've been practicing!"
  },
  {
    character: CHARACTERS.REED,
    text: "Yeah, yeah. Fine. You earned my respect. Here, take this. It might help on the road ahead.",
    choices: [
      {
        text: "Thanks. Maybe next time we don't fight?",
        action: 'give_reward_energized',
        variant: 'green'
      }
    ]
  }
];

export const REED_DEFEAT_CAUTIOUS = [
  {
    character: CHARACTERS.REED,
    text: "Not bad. You played it smart. I can respect that."
  },
  {
    character: CHARACTERS.STIJN,
    text: "See? Honesty pays off!"
  },
  {
    character: CHARACTERS.REED,
    text: "Here. A deal's a deal. This should give you an edge. Use it wisely.",
    choices: [
      {
        text: "I will. Thank you for the challenge.",
        action: 'give_reward_cautious',
        variant: 'green'
      }
    ]
  }
];

export const REED_DEFEAT_AGGRESSIVE = [
  {
    character: CHARACTERS.REED,
    text: "Okay, okay! You made your point. That hurt more than I expected."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Maybe now you'll think twice before challenging random people?"
  },
  {
    character: CHARACTERS.REED,
    text: "Nah. But I'll think twice before underestimating them. Here, you earned this the hard way.",
    choices: [
      {
        text: "Good fight. No hard feelings.",
        action: 'give_reward_aggressive',
        variant: 'green'
      }
    ]
  }
];

export const REED_DEFEAT_TACTICAL = [
  {
    character: CHARACTERS.REED,
    text: "Alright. You've proven you can hold your own. Diplomacy backed by skill... that's rare."
  },
  {
    character: CHARACTERS.STIJN,
    text: "So does this mean you'll help us out?"
  },
  {
    character: CHARACTERS.REED,
    text: "Don't push your luck. But... here. Consider this an investment. If you survive, maybe we'll cross paths again.",
    choices: [
      {
        text: "I hope we do. Thanks, Reed.",
        action: 'give_reward_tactical',
        variant: 'green'
      }
    ]
  }
];

// 🔮 MYSTERY NODES: Fortune and Misfortune

// Mystery Event 1: The Flickering Lantern
export const MYSTERY_FLICKERING_LANTERN = [
  {
    character: CHARACTERS.MYSTERIOUS_FIGURE,
    text: "A lantern flickers in the darkness. Its light reveals a hooded figure, hand outstretched."
  },
  {
    character: CHARACTERS.MYSTERIOUS_FIGURE,
    text: "\"Fate is a fickle thing, traveler. Choose wisely...\"",
    choices: [
      {
        text: "Take the left path. (???)",
        action: 'mystery_lantern_left',
        variant: 'purple'
      },
      {
        text: "Take the right path. (???)",
        action: 'mystery_lantern_right',
        variant: 'purple'
      },
      {
        text: "Walk away. (Gain nothing)",
        action: 'mystery_leave',
        variant: 'white'
      }
    ]
  }
];

// Mystery Event 2: The Whispering Voice
export const MYSTERY_WHISPERING_VOICE = [
  {
    character: CHARACTERS.SHADOW_DEALER,
    text: "Whispers echo from the shadows. A voice, neither male nor female, speaks directly into your mind."
  },
  {
    character: CHARACTERS.SHADOW_DEALER,
    text: "\"Power... or safety... One must be sacrificed for the other. What do you value more?\"",
    choices: [
      {
        text: "\"Give me power.\" (???)",
        action: 'mystery_choose_power',
        variant: 'red'
      },
      {
        text: "\"I choose safety.\" (???)",
        action: 'mystery_choose_safety',
        variant: 'cyan'
      },
      {
        text: "\"I need neither.\" (Leave)",
        action: 'mystery_leave',
        variant: 'white'
      }
    ]
  }
];

// Mystery Event 3: The Oracle's Fortune
export const MYSTERY_ORACLE_FORTUNE = [
  {
    character: CHARACTERS.FORTUNE_TELLER,
    text: "An elderly figure sits before a crystal ball, eyes glowing with unnatural light."
  },
  {
    character: CHARACTERS.FORTUNE_TELLER,
    text: "\"I see your future, traveler... but knowledge comes at a price. Will you pay it?\"",
    choices: [
      {
        text: "\"Yes. Show me my fate.\" (Pay 50 Gold)",
        action: 'mystery_oracle_accept',
        variant: 'yellow'
      },
      {
        text: "\"No. I make my own fate.\" (Leave)",
        action: 'mystery_leave',
        variant: 'white'
      }
    ]
  }
];

// Mystery Event 4: The Cursed Chest
export const MYSTERY_CURSED_CHEST = [
  {
    character: CHARACTERS.NARRATOR,
    text: "A chest sits in the center of the path. It's covered in strange markings that seem to shift when you look away."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "Something about it feels... wrong. But it might contain treasure.",
    choices: [
      {
        text: "Open the chest. (???)",
        action: 'mystery_open_chest',
        variant: 'purple'
      },
      {
        text: "Destroy the chest. (???)",
        action: 'mystery_destroy_chest',
        variant: 'red'
      },
      {
        text: "Leave it alone.",
        action: 'mystery_leave',
        variant: 'white'
      }
    ]
  }
];

// Mystery Event 5: The Mirror
export const MYSTERY_DARK_MIRROR = [
  {
    character: CHARACTERS.MYSTERIOUS_FIGURE,
    text: "A tall mirror stands in your path. Your reflection stares back... but something's different."
  },
  {
    character: CHARACTERS.MYSTERIOUS_FIGURE,
    text: "\"Touch the glass, and your reflection will grant you a gift... or take something precious.\"",
    choices: [
      {
        text: "Touch the mirror. (???)",
        action: 'mystery_touch_mirror',
        variant: 'purple'
      },
      {
        text: "Shatter the mirror. (???)",
        action: 'mystery_shatter_mirror',
        variant: 'red'
      },
      {
        text: "Walk past it.",
        action: 'mystery_leave',
        variant: 'white'
      }
    ]
  }
];

// Mystery Outcomes - Good
export const MYSTERY_OUTCOME_FORTUNE = [
  {
    character: CHARACTERS.NARRATOR,
    text: "Fortune smiles upon you..."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "You gained gold and feel strangely energized!",
    choices: [
      {
        text: "Continue onward.",
        action: 'mystery_reward_fortune',
        variant: 'success'
      }
    ]
  }
];

export const MYSTERY_OUTCOME_POWER = [
  {
    character: CHARACTERS.NARRATOR,
    text: "Dark energy courses through you. You feel... stronger."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "You gained a powerful card, but at what cost?",
    choices: [
      {
        text: "Accept the power.",
        action: 'mystery_reward_power',
        variant: 'success'
      }
    ]
  }
];

export const MYSTERY_OUTCOME_BLESSING = [
  {
    character: CHARACTERS.NARRATOR,
    text: "A warm light washes over you. Your wounds begin to heal."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "You've been blessed with vitality!",
    choices: [
      {
        text: "Feel grateful.",
        action: 'mystery_reward_blessing',
        variant: 'success'
      }
    ]
  }
];

// Mystery Outcomes - Bad
export const MYSTERY_OUTCOME_MISFORTUNE = [
  {
    character: CHARACTERS.NARRATOR,
    text: "The shadows close in. You feel something taken from you..."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "You've been cursed! You lost gold and feel weakened.",
    choices: [
      {
        text: "Endure the curse.",
        action: 'mystery_penalty_misfortune',
        variant: 'danger'
      }
    ]
  }
];

export const MYSTERY_OUTCOME_CURSE = [
  {
    character: CHARACTERS.NARRATOR,
    text: "Pain shoots through your body. The curse takes hold..."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "You've been cursed with frailty!",
    choices: [
      {
        text: "Push through the pain.",
        action: 'mystery_penalty_curse',
        variant: 'danger'
      }
    ]
  }
];

export const MYSTERY_OUTCOME_NOTHING = [
  {
    character: CHARACTERS.NARRATOR,
    text: "Nothing happens. Perhaps that was for the best."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "Sometimes the wisest choice is caution.",
    choices: [
      {
        text: "Continue.",
        action: 'continue_to_map',
        variant: 'white'
      }
    ]
  }
];

// 📱 STIJN NOTIFICATION TUTORIALS

// Stijn explains the notification system (first time player gets a notification)
export const STIJN_NOTIFICATION_TUTORIAL = [
  {
    character: CHARACTERS.STIJN,
    text: "Hey! Did you see that?"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Your character menu button is glowing! That means you got something new - could be a new card, an item, or even a level up!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Click on your character icon (the one with your avatar) to check it out. The glowing dot will disappear once you open the menu and see what you got."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Trust me, you don't want to miss checking that out. New cards and items can make a huge difference in battle!",
    choices: [
      {
        text: "Got it! Thanks for the heads up.",
        action: 'notification_tutorial_complete',
        variant: 'success'
      }
    ]
  }
];

// Stijn encourages after first level up
export const STIJN_LEVEL_UP_ENCOURAGEMENT = [
  {
    character: CHARACTERS.STIJN,
    text: "Whoa! Nice! You just leveled up!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "That means you earned a talent point. You can spend it in the talent tree to unlock permanent upgrades!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Check your character menu - the talents tab should be glowing. Those upgrades carry over between runs, so choose wisely!",
    choices: [
      {
        text: "Awesome! I'll check it out.",
        action: 'level_up_tutorial_complete',
        variant: 'success'
      }
    ]
  }
];

// Stijn encouragement on floor 2
export const STIJN_FLOOR_2_ENCOURAGEMENT = [
  {
    character: CHARACTERS.STIJN,
    text: "Hey, you're doing great so far!"
  },
  {
    character: CHARACTERS.STIJN,
    text: "Just a few more battles before you reach Reed at the end of this act."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Make sure to check shops for upgrades and rest at campfires to save your progress!",
    choices: [
      {
        text: "Thanks for the tips!",
        action: 'floor_2_dialogue_complete',
        variant: 'success'
      }
    ]
  }
];

// Reed's surprise node placeholder (future mini game)
export const SURPRISE_NODE_PLACEHOLDER = [
  {
    character: CHARACTERS.REED,
    text: "Well, well... you found my little surprise!"
  },
  {
    character: CHARACTERS.REED,
    text: "I left this special challenge here to test if you're really ready to face me."
  },
  {
    character: CHARACTERS.REED,
    text: "Unfortunately, this mini-game isn't quite ready yet. But when it is, you'll find an exciting challenge here!",
    choices: [
      {
        text: "I'll be back when it's ready!",
        action: 'continue_to_map',
        variant: 'success'
      },
      {
        text: "Can't wait to try it!",
        action: 'continue_to_map',
        variant: 'primary'
      }
    ]
  }
];

// Stijn warning about floor 3 surprise
export const STIJN_FLOOR_3_SURPRISE = [
  {
    character: CHARACTERS.STIJN,
    text: "Wait, did you see that?"
  },
  {
    character: CHARACTERS.STIJN,
    text: "I swear I just saw something strange appear on the map... like a special node or something."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Reed must have left a surprise challenge for you! Keep an eye out for it - it might be worth checking out!",
    choices: [
      {
        text: "I'll keep my eyes open!",
        action: 'floor_3_dialogue_complete',
        variant: 'success'
      }
    ]
  }
];

// Helper function to get a random mystery event
export const getRandomMysteryEvent = () => {
  const mysteryEvents = [
    'mystery_flickering_lantern',
    'mystery_whispering_voice',
    'mystery_oracle_fortune',
    'mystery_cursed_chest',
    'mystery_dark_mirror'
  ];

  const randomIndex = Math.floor(Math.random() * mysteryEvents.length);
  return mysteryEvents[randomIndex];
};

// Helper function to get dialogue by ID
export const getDialogue = (dialogueId) => {
  const dialogues = {
    'story_intro': STORY_INTRO,
    'tutorial_intro': TUTORIAL_INTRO,
    'reed_intro': REED_INTRO,
    'reed_defeat': REED_DEFEAT,
    'brothers_intro': BROTHERS_INTRO,
    'event_mysterious_stranger': EVENT_MYSTERIOUS_STRANGER,
    'victory_dialogue': VICTORY_DIALOGUE,
    'post_tutorial_battle': POST_TUTORIAL_BATTLE,
    'biome_tutorial': BIOME_TUTORIAL,
    'post_map_tutorial': POST_MAP_TUTORIAL,
    'inventory_tutorial': INVENTORY_TUTORIAL,
    'tutorial_complete': TUTORIAL_COMPLETE,
    // New story dialogues
    'reed_pre_battle_encounter': REED_PRE_BATTLE_ENCOUNTER,
    'reed_response_confident': REED_RESPONSE_CONFIDENT,
    'reed_response_humble': REED_RESPONSE_HUMBLE,
    'reed_response_defiant': REED_RESPONSE_DEFIANT,
    'reed_response_diplomatic': REED_RESPONSE_DIPLOMATIC,
    'reed_defeat_energized': REED_DEFEAT_ENERGIZED,
    'reed_defeat_cautious': REED_DEFEAT_CAUTIOUS,
    'reed_defeat_aggressive': REED_DEFEAT_AGGRESSIVE,
    'reed_defeat_tactical': REED_DEFEAT_TACTICAL,
    // Mystery node dialogues
    'mystery_flickering_lantern': MYSTERY_FLICKERING_LANTERN,
    'mystery_whispering_voice': MYSTERY_WHISPERING_VOICE,
    'mystery_oracle_fortune': MYSTERY_ORACLE_FORTUNE,
    'mystery_cursed_chest': MYSTERY_CURSED_CHEST,
    'mystery_dark_mirror': MYSTERY_DARK_MIRROR,
    'mystery_outcome_fortune': MYSTERY_OUTCOME_FORTUNE,
    'mystery_outcome_power': MYSTERY_OUTCOME_POWER,
    'mystery_outcome_blessing': MYSTERY_OUTCOME_BLESSING,
    'mystery_outcome_misfortune': MYSTERY_OUTCOME_MISFORTUNE,
    'mystery_outcome_curse': MYSTERY_OUTCOME_CURSE,
    'mystery_outcome_nothing': MYSTERY_OUTCOME_NOTHING,
    // Stijn notification tutorials
    'stijn_notification_tutorial': STIJN_NOTIFICATION_TUTORIAL,
    'stijn_level_up_encouragement': STIJN_LEVEL_UP_ENCOURAGEMENT,
    // Floor dialogues
    'stijn_floor_2_encouragement': STIJN_FLOOR_2_ENCOURAGEMENT,
    'stijn_floor_3_surprise': STIJN_FLOOR_3_SURPRISE,
    // Surprise node
    'surprise_node_placeholder': SURPRISE_NODE_PLACEHOLDER
  };

  return dialogues[dialogueId] || null;
};
