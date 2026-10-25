import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import itemsReducer from './slices/itemsSlice';
import listsReducer from './slices/listsSlice';
import sharedReducer from './slices/sharedSlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lists: listsReducer,
    items: itemsReducer,
    shared: sharedReducer,
    toasts: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
