import type { SortOption } from '../types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const SESSION_KEY = 'cartcraft.session';

export const CATEGORIES = [
  'Groceries',
  'Fruit & Veg',
  'Dairy & Eggs',
  'Meat & Fish',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Household',
  'Personal Care',
  'Baby',
  'Pets',
  'Electronics',
  'Other',
] as const;

export const DEFAULT_CATEGORY = 'Groceries';

export const SORT_OPTIONS: SortOption[] = [
  { value: 'date-desc', label: 'Newest first', key: 'date', direction: 'desc' },
  { value: 'date-asc', label: 'Oldest first', key: 'date', direction: 'asc' },
  { value: 'name-asc', label: 'Name (A to Z)', key: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Name (Z to A)', key: 'name', direction: 'desc' },
  { value: 'category-asc', label: 'Category (A to Z)', key: 'category', direction: 'asc' },
  { value: 'category-desc', label: 'Category (Z to A)', key: 'category', direction: 'desc' },
];

export const DEFAULT_SORT = 'date-desc';

export const MAX_IMAGES_PER_ITEM = 3;
export const MAX_IMAGE_DIMENSION = 480;
export const TOAST_DURATION_MS = 3500;
export const SEARCH_DEBOUNCE_MS = 250;
