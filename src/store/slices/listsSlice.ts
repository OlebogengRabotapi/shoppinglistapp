import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createList,
  deleteList,
  fetchLists,
  updateList,
  type ListInput,
} from '../../api/lists';
import type { LoadStatus, ShoppingList } from '../../types';
import { getErrorMessage } from '../../utils/format';
import { pushToast } from './toastSlice';

interface ListsState {
  entries: ShoppingList[];
  status: LoadStatus;
  error: string | null;
}

const initialState: ListsState = { entries: [], status: 'idle', error: null };

type ThunkConfig = { rejectValue: string };

export const loadLists = createAsyncThunk<ShoppingList[], number, ThunkConfig>(
  'lists/load',
  async (userId, { rejectWithValue }) => {
    try {
      return await fetchLists(userId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const addList = createAsyncThunk<
  ShoppingList,
  { userId: number; input: ListInput },
  ThunkConfig
>('lists/add', async ({ userId, input }, { dispatch, rejectWithValue }) => {
  try {
    const list = await createList(userId, input);
    dispatch(pushToast('success', `"${list.name}" created.`));
    return list;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(pushToast('error', message));
    return rejectWithValue(message);
  }
});

export const editList = createAsyncThunk<
  ShoppingList,
  { id: number; changes: Partial<ShoppingList>; silent?: boolean },
  ThunkConfig
>('lists/edit', async ({ id, changes, silent }, { dispatch, rejectWithValue }) => {
  try {
    const list = await updateList(id, changes);
    if (!silent) dispatch(pushToast('success', `"${list.name}" updated.`));
    return list;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(pushToast('error', message));
    return rejectWithValue(message);
  }
});

export const removeList = createAsyncThunk<number, ShoppingList, ThunkConfig>(
  'lists/remove',
  async (list, { dispatch, rejectWithValue }) => {
    try {
      await deleteList(list.id);
      dispatch(pushToast('success', `"${list.name}" deleted.`));
      return list.id;
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch(pushToast('error', message));
      return rejectWithValue(message);
    }
  },
);

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearLists: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLists.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadLists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entries = action.payload;
      })
      .addCase(loadLists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Could not load your lists.';
      })
      .addCase(addList.fulfilled, (state, action) => {
        state.entries.push(action.payload);
      })
      .addCase(editList.fulfilled, (state, action) => {
        const index = state.entries.findIndex((list) => list.id === action.payload.id);
        if (index >= 0) state.entries[index] = action.payload;
      })
      .addCase(removeList.fulfilled, (state, action) => {
        state.entries = state.entries.filter((list) => list.id !== action.payload);
      });
  },
});

export const { clearLists } = listsSlice.actions;
export default listsSlice.reducer;
