/**
 * Mini Game Manager
 *
 * Handles random selection and configuration of mini-games for event nodes.
 * Easily extensible - just add new games to the MINI_GAMES array!
 */

// Available mini-games registry
const MINI_GAMES = [
  {
    id: 'tower',
    name: 'Tower Stack',
    route: '/tower-game',
    description: 'Stack blocks to build the tallest tower!',
    icon: '🏗️',
    // Random variation in game modes and difficulties
    variations: [
      { gameMode: 'score', difficulty: 'easy' },
      { gameMode: 'score', difficulty: 'medium' },
      { gameMode: 'score', difficulty: 'hard' },
      { gameMode: 'time', difficulty: 'easy' },
      { gameMode: 'time', difficulty: 'medium' },
      { gameMode: 'time', difficulty: 'hard' },
    ]
  },
  // 🎮 ADD MORE GAMES HERE IN THE FUTURE!
  // Example:
  // {
  //   id: 'memory',
  //   name: 'Memory Match',
  //   route: '/memory-game',
  //   description: 'Match the cards!',
  //   icon: '🃏',
  //   variations: [
  //     { difficulty: 'easy' },
  //     { difficulty: 'medium' },
  //     { difficulty: 'hard' },
  //   ]
  // },
];

/**
 * Get a random mini-game configuration
 * @param {Object} options - Options for filtering games
 * @param {string} options.excludeId - Game ID to exclude
 * @param {number} options.actNumber - Current act number (can influence difficulty)
 * @returns {Object} Selected game configuration
 */
export const getRandomMiniGame = (options = {}) => {
  const { excludeId, actNumber } = options;

  // Filter available games
  let availableGames = MINI_GAMES.filter(game => game.id !== excludeId);

  if (availableGames.length === 0) {
    console.warn('No mini-games available! Returning first game as fallback.');
    availableGames = MINI_GAMES;
  }

  // Select random game
  const selectedGame = availableGames[Math.floor(Math.random() * availableGames.length)];

  // Select random variation
  let variation = selectedGame.variations[Math.floor(Math.random() * selectedGame.variations.length)];

  // Optional: Adjust difficulty based on act number
  if (actNumber) {
    if (actNumber >= 4) {
      // Acts 4-5: favor hard difficulty
      const hardVariations = selectedGame.variations.filter(v => v.difficulty === 'hard');
      if (hardVariations.length > 0 && Math.random() > 0.5) {
        variation = hardVariations[Math.floor(Math.random() * hardVariations.length)];
      }
    } else if (actNumber <= 2) {
      // Acts 1-2: favor easy/medium difficulty
      const easyVariations = selectedGame.variations.filter(v => v.difficulty !== 'hard');
      if (easyVariations.length > 0 && Math.random() > 0.3) {
        variation = easyVariations[Math.floor(Math.random() * easyVariations.length)];
      }
    }
  }

  return {
    ...selectedGame,
    ...variation
  };
};

/**
 * Get mini-game by ID
 * @param {string} id - Game ID
 * @returns {Object|null} Game configuration
 */
export const getMiniGameById = (id) => {
  return MINI_GAMES.find(game => game.id === id) || null;
};

/**
 * Get all available mini-games
 * @returns {Array} List of all mini-games
 */
export const getAllMiniGames = () => {
  return [...MINI_GAMES];
};

/**
 * Get stats about mini-games (for debugging/testing)
 * @returns {Object} Stats
 */
export const getMiniGameStats = () => {
  return {
    totalGames: MINI_GAMES.length,
    totalVariations: MINI_GAMES.reduce((sum, game) => sum + game.variations.length, 0),
    games: MINI_GAMES.map(game => ({
      id: game.id,
      name: game.name,
      variations: game.variations.length
    }))
  };
};

export default {
  getRandomMiniGame,
  getMiniGameById,
  getAllMiniGames,
  getMiniGameStats
};
