// Static list of quick-add suggestions for Phase 1.
// In a later phase this could come from a real ingredient database.

export const SUGGESTED_INGREDIENTS = [
  'Plantain',
  'Eggs',
  'Rice',
  'Chicken',
  'Tomato',
  'Onion',
  'Potatoes',
  'Beans',
];

// Simple emoji lookup so chips/pills feel friendly.
// Falls back to a generic ingredient emoji if there's no exact match.
const INGREDIENT_EMOJIS = {
  plantain: '🍌',
  eggs: '🥚',
  egg: '🥚',
  rice: '🍚',
  chicken: '🍗',
  tomato: '🍅',
  onion: '🧅',
  potatoes: '🥔',
  potato: '🥔',
  beans: '🫘',
  garlic: '🧄',
  pepper: '🌶️',
  fish: '🐟',
  beef: '🥩',
  carrot: '🥕',
  cabbage: '🥬',
};

export function getIngredientEmoji(name) {
  const key = name.trim().toLowerCase();
  return INGREDIENT_EMOJIS[key] || '🥗';
}
