# Dialogue & Cutscene System

The dialogue system provides a flexible way to create cutscenes, story moments, tutorials, and character interactions.

## Features

- **Neo-brutalist UI** matching game aesthetic
- **Character portraits** using DiceBear avatars
- **Typewriter effect** for dialogue text
- **Linear dialogue** sequences
- **Multiple choice** branching
- **Progress indicator** showing dialogue position
- **Reusable** across different contexts

## Usage

### 1. Navigate to Dialogue Route

```javascript
navigate('/dialogue', {
  dialogueId: 'story_intro',  // ID of dialogue in dialogues.js
  nextRoute: '/map'            // Where to go after dialogue completes
});
```

### 2. Define Dialogue Data

In `src/data/dialogues.js`:

```javascript
export const MY_DIALOGUE = [
  {
    character: CHARACTERS.STIJN,
    text: "This is what Stijn says."
  },
  {
    character: CHARACTERS.NARRATOR,
    text: "Narrator text has no portrait."
  },
  {
    character: CHARACTERS.REED,
    text: "This line has choices!",
    choices: [
      {
        text: "Option 1",
        action: 'some_action',
        variant: 'green'
      },
      {
        text: "Option 2",
        action: 'other_action',
        variant: 'red'
      }
    ]
  }
];
```

### 3. Character Definition

```javascript
export const CHARACTERS = {
  MY_CHARACTER: {
    name: 'Character Name',
    title: 'Character Title',  // Optional
    seed: 'unique-seed-for-avatar'
  }
};
```

## Integration Points

### Story Intro
- Triggers when starting Story Mode
- Defined in `STORY_INTRO`
- Offers tutorial choice

### Tutorial
- Defined in `TUTORIAL_INTRO`
- Explains game mechanics with Stijn

### Boss Intros
- `REED_INTRO` - First boss
- `BROTHERS_INTRO` - Eddy and Willy
- Trigger before boss battles

### Events
- `EVENT_MYSTERIOUS_STRANGER` - Example random event
- Can trigger from surprise nodes

### Victory/Defeat
- `VICTORY_DIALOGUE` - Post-battle celebration
- Can show different dialogues based on context

## Adding New Dialogues

1. **Define dialogue array** in `dialogues.js`
2. **Add to getDialogue()** function with unique ID
3. **Navigate to dialogue route** with the ID

Example:
```javascript
// In dialogues.js
export const MY_NEW_DIALOGUE = [
  { character: CHARACTERS.STIJN, text: "Hello!" }
];

// In getDialogue()
export const getDialogue = (dialogueId) => {
  const dialogues = {
    'my_new_dialogue': MY_NEW_DIALOGUE,
    // ... other dialogues
  };
  return dialogues[dialogueId] || null;
};

// To trigger
navigate('/dialogue', {
  dialogueId: 'my_new_dialogue',
  nextRoute: '/battle'
});
```

## Choice Actions

Built-in actions in `DialogueRoute.jsx`:
- `start_tutorial` - Begin tutorial battle
- `skip_tutorial` - Skip to first battle
- `accept_deal` - Accept event offer
- `refuse_deal` - Refuse event offer
- `continue_to_battle` - Go to battle
- `continue_to_map` - Go to map

Add custom actions by editing `handleChoice()` in `DialogueRoute.jsx`.

## Styling

The dialogue box uses neo-brutalist components:
- `NBButton` for choices and continue
- `NBCard` styling for the dialogue box
- Character portraits use DiceBear Notionists style
- Progress bars show dialogue position

## Testing

Start story mode to see the full flow:
1. Splash Screen → Main Menu
2. Save Select → Profile Creation
3. Game Mode Selection → **Story Intro Dialogue**
4. Tutorial Choice → Map or Battle

Navigate directly for testing:
```javascript
navigate('/dialogue', { dialogueId: 'story_intro' });
```
