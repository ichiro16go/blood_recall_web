import type { Card, Jinki } from '../types/type';
import { CardType } from '../types/type';

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const MOCK_CARDS: Card[] = [
  {
    id: 'c_slash_1',
    name: 'Weak Slash',
    type: CardType.ASSAULT,
    attack: 2,
    cost: 0,
    level: 1,
    description: 'A basic attack.'
  },
  {
    id: 'c_blood_1',
    name: 'Blood Rite',
    type: CardType.BLOOD,
    attack: 0,
    cost: 0,
    level: 1,
    description: 'Draw 1 card.'
  },
  {
    id: 'c_heavy_slash',
    name: 'Heavy Slash',
    type: CardType.RECALL,
    attack: 5,
    cost: 3,
    level: 2,
    description: 'A heavy blow.'
  },
  {
    id: 'c_crimson_shield',
    name: 'Crimson Shield',
    type: CardType.RECALL,
    attack: 3,
    cost: 2,
    level: 2,
    description: '+2 Attack if you have < 10 Life.'
  },
  {
    id: 'c_vampiric_strike',
    name: 'Vampire Strike',
    type: CardType.RECALL,
    attack: 4,
    cost: 4,
    level: 3,
    description: 'Recover 1 Life (Not impl in mock).'
  },
  {
    id: 'c_frenzy',
    name: 'Blood Frenzy',
    type: CardType.RECALL,
    attack: 8,
    cost: 6,
    level: 3,
    description: 'High power, high cost.'
  },
  {
    id: 'c_phantom_blade',
    name: 'Phantom Blade',
    type: CardType.RECALL,
    attack: 6,
    cost: 4,
    level: 2,
    description: 'Ignores some defense.'
  }
];



export const STARTING_DECK_SIZE = 10;
export const INITIAL_LIFE_COUNT = 20;
export const LIFE_THRESHOLD_AWAKEN = 10;