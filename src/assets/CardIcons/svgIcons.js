import React from 'react';
import {
  Swords, Heart, Shield, Zap, Flame, Droplet, Wind, Sparkles,
  Target, Hammer, Repeat, Skull, Rocket, TrendingUp, Cross,
  Pill, Activity, CheckCircle, Users, Eye, Battery, Brain,
  RefreshCw, Clock, Lightbulb, Plus, Droplets, AlertCircle,
  Award, Disc, Crosshair
} from 'lucide-react';

/**
 * Card Icon Mapping
 * Maps card names to Lucide React icons
 * Comprehensive mapping for all 45 cards in the game
 */
const iconMap = {
  // ==================== DAMAGE CARDS ====================
  'Quick Jab': Swords,
  'Power Slam': Hammer,
  'Swift Strike': Wind,
  'Heavy Blow': Hammer,
  'Lucky Strike': Target,
  'Crushing Hammer': Hammer,
  'Double Tap': Repeat,
  'Execute': Skull,
  'Devastating Blow': Rocket,
  'Meteor Strike': Flame,
  'Blade Flurry': TrendingUp,

  // ==================== HEAL CARDS ====================
  'First Aid': Cross,
  'Minor Heal': Heart,
  'Healing Potion': Pill,
  'Big Heal': Heart,
  'Regeneration': Activity,
  'Full Restore': Heart,
  'Miracle Cure': Sparkles,

  // ==================== UTILITY CARDS ====================
  'Shield Wall': Shield,
  'Card Draw': Plus,
  'Energy Boost': Zap,
  'Focus': Eye,
  'Lucky Draw': Target,
  'Second Wind': Wind,
  'Preparation': Brain,
  'Fortify': Shield,
  'Time Warp': Clock,
  'Master Plan': Lightbulb,
  'Adrenaline Rush': Rocket,

  // ==================== CLEANSE CARDS ====================
  'Antidote': Droplets,
  'Clear Mind': Brain,
  'Bandage': Cross,
  'Purify': Sparkles,
  'Cleansing Fire': Flame,
  'Battle Cry': Users,
  'Regenerate': Activity,

  // ==================== COUNTER CARDS ====================
  'Evasion': Wind,
  'Thorny Armor': Shield,
  'Power Surge': Zap,
  'Divine Protection': Sparkles,
  'Perfect Block': Shield,
  'Riposte': Swords,
  'Counter Strike': Crosshair,
  'Lucky Counter': Target,
  'Parry': Shield,

  // Default fallback
  'default': Disc
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
