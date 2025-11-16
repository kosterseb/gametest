import React from 'react';
import { Swords, Heart, Shield, Zap, Flame, Droplet, Wind, Sparkles } from 'lucide-react';

/**
 * Card Icon Mapping
 * Maps card names to Lucide React icons
 */
const iconMap = {
  // Damage cards
  'Strike': Swords,
  'Heavy Strike': Swords,
  'Slash': Swords,
  'Fireball': Flame,
  'Lightning Bolt': Zap,
  'Ice Shard': Droplet,
  'Wind Slash': Wind,

  // Heal cards
  'Heal': Heart,
  'Greater Heal': Heart,
  'Regenerate': Heart,

  // Utility cards
  'Shield': Shield,
  'Block': Shield,
  'Counter': Shield,

  // Default
  'default': Sparkles
};

/**
 * Get icon component for a card
 */
export const getCardIcon = (cardName) => {
  return iconMap[cardName] || iconMap['default'];
};

/**
 * Get color scheme for card type
 */
export const getCardTypeColor = (cardType) => {
  const colors = {
    'damage': {
      primary: '#ef4444',
      secondary: '#dc2626',
      gradient: 'from-red-500 to-red-700'
    },
    'heal': {
      primary: '#22c55e',
      secondary: '#16a34a',
      gradient: 'from-green-500 to-green-700'
    },
    'utility': {
      primary: '#3b82f6',
      secondary: '#2563eb',
      gradient: 'from-blue-500 to-blue-700'
    },
    'status': {
      primary: '#eab308',
      secondary: '#ca8a04',
      gradient: 'from-yellow-500 to-yellow-700'
    },
    'cleanse': {
      primary: '#a855f7',
      secondary: '#9333ea',
      gradient: 'from-purple-500 to-purple-700'
    },
    'counter': {
      primary: '#06b6d4',
      secondary: '#0891b2',
      gradient: 'from-cyan-500 to-cyan-700'
    }
  };

  return colors[cardType] || colors['utility'];
};
