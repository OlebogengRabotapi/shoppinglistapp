export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  surname: string;
  cellNumber: string;
  createdAt: string;
}

/** The user object kept in Redux: never contains the password hash. */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface ShoppingList {
  id: number;
  userId: number;
  name: string;
  category: string;
  notes: string;
  shareId: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: number;
  listId: number;
  userId: number;
  name: string;
  quantity: number;
  notes: string;
  category: string;
  images: string[];
  purchased: boolean;
  createdAt: string;
}

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type SortKey = 'name' | 'category' | 'date';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  value: string; // e.g. "name-asc"
  label: string;
  key: SortKey;
  direction: SortDirection;
}

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}
