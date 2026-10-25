import type { ShoppingItem, ShoppingList } from '../types';
import { generateShareId } from '../utils/format';
import { request } from './client';

export type ListInput = Pick<ShoppingList, 'name' | 'category' | 'notes'>;
export type ItemInput = Pick<
  ShoppingItem,
  'name' | 'quantity' | 'notes' | 'category' | 'images'
>;

/* ----------------------------- Lists ----------------------------- */

export const fetchLists = (userId: number) =>
  request<ShoppingList[]>(`/lists?userId=${userId}`);

export const fetchListById = (id: number) => request<ShoppingList>(`/lists/${id}`);

export const fetchListByShareId = async (shareId: string): Promise<ShoppingList> => {
  const matches = await request<ShoppingList[]>(
    `/lists?shareId=${encodeURIComponent(shareId)}&isShared=true`,
  );
  if (!matches[0]) throw new Error('This shared list does not exist or is no longer shared.');
  return matches[0];
};

export const createList = (userId: number, input: ListInput) => {
  const now = new Date().toISOString();
  return request<ShoppingList>('/lists', 'POST', {
    userId,
    name: input.name.trim(),
    category: input.category,
    notes: input.notes.trim(),
    shareId: generateShareId(),
    isShared: false,
    createdAt: now,
    updatedAt: now,
  });
};

export const updateList = (id: number, changes: Partial<ShoppingList>) =>
  request<ShoppingList>(`/lists/${id}`, 'PATCH', {
    ...changes,
    updatedAt: new Date().toISOString(),
  });

/** Deleting a list also removes every item that belongs to it. */
export const deleteList = async (id: number): Promise<void> => {
  const items = await fetchItems(id);
  await Promise.all(items.map((item) => deleteItem(item.id)));
  await request<void>(`/lists/${id}`, 'DELETE');
};

/* ----------------------------- Items ----------------------------- */

export const fetchItems = (listId: number) =>
  request<ShoppingItem[]>(`/items?listId=${listId}`);

export const fetchItemsForUser = (userId: number) =>
  request<ShoppingItem[]>(`/items?userId=${userId}`);

export const createItem = (userId: number, listId: number, input: ItemInput) =>
  request<ShoppingItem>('/items', 'POST', {
    userId,
    listId,
    name: input.name.trim(),
    quantity: input.quantity,
    notes: input.notes.trim(),
    category: input.category,
    images: input.images,
    purchased: false,
    createdAt: new Date().toISOString(),
  });

export const updateItem = (id: number, changes: Partial<ShoppingItem>) =>
  request<ShoppingItem>(`/items/${id}`, 'PATCH', changes);

export const deleteItem = (id: number) => request<void>(`/items/${id}`, 'DELETE');
