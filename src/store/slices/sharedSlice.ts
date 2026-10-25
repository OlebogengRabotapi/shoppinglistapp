import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchItems, fetchListByShareId } from '../../api/lists';
import type { LoadStatus, ShoppingItem, ShoppingList } from '../../types';
import { getErrorMessage } from '../../utils/format';

interface SharedState {
  list: ShoppingList | null;
  items: ShoppingItem[];
  status: LoadStatus;
  error: string | null;
}

const initialState: SharedState = { list: null, items: [], status: 'idle', error: null };

/** Loads a list through its public share link (read-only view). */
export const loadSharedList = createAsyncThunk<
  { list: ShoppingList; items: ShoppingItem[] },
  string,
  { rejectValue: string }
>('shared/load', async (shareId, { rejectWithValue }) => {
  try {
    const list = await fetchListByShareId(shareId);
    const items = await fetchItems(list.id);
    return { list, items };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const sharedSlice = createSlice({
  name: 'shared',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSharedList.pending, () => ({ ...initialState, status: 'loading' as const }))
      .addCase(loadSharedList.fulfilled, (_state, action) => ({
        ...action.payload,
        status: 'succeeded' as const,
        error: null,
      }))
      .addCase(loadSharedList.rejected, (_state, action) => ({
        ...initialState,
        status: 'failed' as const,
        error: action.payload ?? 'Could not load this list.',
      }));
  },
});

export default sharedSlice.reducer;
