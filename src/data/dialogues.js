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
    seed: 'reed-programmer'
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
    text: "Now comes the tricky part - navigating the map. You'll see different paths, different enemies, different rewards."
  },
  {
    character: CHARACTERS.STIJN,
    text: "Let me show you how this works. Ready?",
    choices: [
      {
        text: "Show me the map! 🗺️",
        action: 'continue_to_map_tutorial',
        variant: 'green'
      },
      {
        text: "I'll figure it out myself.",
        action: 'skip_map_tutorial',
        variant: 'white'
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
    text: "Alright, quick overview of your character menu. You can access this anytime during the game to manage your stuff."
  },
  {
    character: CHARACTERS.STIJN,
    text: "DECK: This is where you manage your cards. You can only bring a limited number of cards into battle, so choose wisely."
  },
  {
    character: CHARACTERS.STIJN,
    text: "INVENTORY: Items you find during your run. Consumables for in-battle use, passive items for permanent boosts."
  },
  {
    character: CHARACTERS.STIJN,
    text: "TALENTS: Use talent points to unlock permanent upgrades. More health, more energy, better cards - all here."
  },
  {
    character: CHARACTERS.STIJN,
    text: "STATS: Your current run statistics. Track your progress, see how you're doing."
  },
  {
    character: CHARACTERS.STIJN,
    text: "That's the quick tour! The menu button is in the top-right during battles and on the map. Use it!",
    choices: [
      {
        text: "Got it! 👍",
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
    'post_map_tutorial': POST_MAP_TUTORIAL,
    'inventory_tutorial': INVENTORY_TUTORIAL,
    'tutorial_complete': TUTORIAL_COMPLETE
  };

  return dialogues[dialogueId] || null;
};
