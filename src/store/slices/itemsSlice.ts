import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createItem,
  deleteItem,
  fetchItems,
  fetchItemsForUser,
  updateItem,
  type ItemInput,
} from '../../api/lists';
import type { LoadStatus, ShoppingItem } from '../../types';
import { getErrorMessage } from '../../utils/format';
import { removeList } from './listsSlice';
import { pushToast } from './toastSlice';

interface ItemsState {
  entries: ShoppingItem[];
  status: LoadStatus;
  error: string | null;
}

const initialState: ItemsState = { entries: [], status: 'idle', error: null };

type ThunkConfig = { rejectValue: string };

/** Loads every item the user owns (used for the item counts on the home page). */
export const loadUserItems = createAsyncThunk<ShoppingItem[], number, ThunkConfig>(
  'items/loadForUser',
  async (userId, { rejectWithValue }) => {
    try {
      return await fetchItemsForUser(userId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const loadItems = createAsyncThunk<ShoppingItem[], number, ThunkConfig>(
  'items/load',
  async (listId, { rejectWithValue }) => {
    try {
      return await fetchItems(listId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const addItem = createAsyncThunk<
  ShoppingItem,
  { userId: number; listId: number; input: ItemInput },
  ThunkConfig
>('items/add', async ({ userId, listId, input }, { dispatch, rejectWithValue }) => {
  try {
    const item = await createItem(userId, listId, input);
    dispatch(pushToast('success', `"${item.name}" added.`));
    return item;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(pushToast('error', message));
    return rejectWithValue(message);
  }
});

export const editItem = createAsyncThunk<
  ShoppingItem,
  { id: number; changes: Partial<ShoppingItem>; silent?: boolean },
  ThunkConfig
>('items/edit', async ({ id, changes, silent }, { dispatch, rejectWithValue }) => {
  try {
    const item = await updateItem(id, changes);
    if (!silent) dispatch(pushToast('success', `"${item.name}" updated.`));
    return item;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(pushToast('error', message));
    return rejectWithValue(message);
  }
});

export const removeItem = createAsyncThunk<number, ShoppingItem, ThunkConfig>(
  'items/remove',
  async (item, { dispatch, rejectWithValue }) => {
    try {
      await deleteItem(item.id);
      dispatch(pushToast('success', `"${item.name}" removed.`));
      return item.id;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(pushToast('error', message));
      return rejectWithValue(message);
    }
  },
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearItems: () => initialState,
  },
  extraReducers: (builder) => {
    const pending = (state: ItemsState) => {
      state.status = 'loading';
      state.error = null;
    };
    const fulfilled = (state: ItemsState, action: { payload: ShoppingItem[] }) => {
      state.status = 'succeeded';
      state.entries = action.payload;
    };
    const rejected = (state: ItemsState, action: { payload?: string }) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Could not load items.';
    };

    builder
      .addCase(loadUserItems.pending, pending)
      .addCase(loadUserItems.fulfilled, fulfilled)
      .addCase(loadUserItems.rejected, rejected)
      .addCase(loadItems.pending, pending)
      .addCase(loadItems.fulfilled, fulfilled)
      .addCase(loadItems.rejected, rejected)
      .addCase(addItem.fulfilled, (state, action) => {
        state.entries.push(action.payload);
      })
      .addCase(editItem.fulfilled, (state, action) => {
        const index = state.entries.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.entries[index] = action.payload;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.entries = state.entries.filter((item) => item.id !== action.payload);
      })
      .addCase(removeList.fulfilled, (state, action) => {
        state.entries = state.entries.filter((item) => item.listId !== action.payload);
      });
  },
});

export const { clearItems } = itemsSlice.actions;
export default itemsSlice.reducer;
