import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Toast, ToastKind } from '../../types';

const toastSlice = createSlice({
  name: 'toasts',
  initialState: [] as Toast[],
  reducers: {
    pushToast: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.push(action.payload);
        if (state.length > 4) state.shift();
      },
      prepare: (kind: ToastKind, message: string) => ({
        payload: { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, message },
      }),
    },
    dismissToast: (state, action: PayloadAction<string>) =>
      state.filter((toast) => toast.id !== action.payload),
  },
});

export const { pushToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
