import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  fetchUser,
  loginUser,
  registerUser,
  updateUserCredentials,
  updateUserProfile,
  type RegisterPayload,
} from '../../api/users';
import { SESSION_KEY } from '../../constants';
import type { LoadStatus, SafeUser } from '../../types';
import { getErrorMessage } from '../../utils/format';
import { pushToast } from './toastSlice';

interface AuthState {
  user: SafeUser | null;
  /** True while we check whether a saved session is still valid on startup. */
  initialising: boolean;
  status: LoadStatus;
  error: string | null;
}

const readSessionId = (): number | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (id: number | null) => {
  try {
    if (id === null) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, String(id));
  } catch {
    /* storage unavailable: the session simply will not persist */
  }
};

const initialState: AuthState = {
  user: null,
  initialising: readSessionId() !== null,
  status: 'idle',
  error: null,
};

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const id = readSessionId();
  if (id === null) return null;
  try {
    return await fetchUser(id);
  } catch {
    writeSession(null);
    return null;
  }
});

export const login = createAsyncThunk<
  SafeUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const user = await loginUser(email, password);
    writeSession(user.id);
    dispatch(pushToast('success', `Welcome back, ${user.name}!`));
    return user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const register = createAsyncThunk<
  SafeUser,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const user = await registerUser(payload);
    writeSession(user.id);
    dispatch(pushToast('success', 'Account created. Welcome to CartCraft!'));
    return user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const saveProfile = createAsyncThunk<
  SafeUser,
  { id: number; name: string; surname: string; cellNumber: string },
  { rejectValue: string }
>('auth/saveProfile', async ({ id, ...changes }, { dispatch, rejectWithValue }) => {
  try {
    const user = await updateUserProfile(id, changes);
    dispatch(pushToast('success', 'Profile updated.'));
    return user;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(pushToast('error', message));
    return rejectWithValue(message);
  }
});

export const saveCredentials = createAsyncThunk<
  SafeUser,
  { id: number; currentPassword: string; email?: string; newPassword?: string },
  { rejectValue: string }
>('auth/saveCredentials', async ({ id, currentPassword, ...changes }, { dispatch, rejectWithValue }) => {
  try {
    const user = await updateUserCredentials(id, currentPassword, changes);
    dispatch(pushToast('success', 'Login details updated.'));
    return user;
  } catch (error) {
    const message = getErrorMessage(error);
    dispatch(pushToast('error', message));
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      writeSession(null);
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialising = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initialising = false;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed.';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Registration failed.';
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(saveCredentials.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearAuthError, setAuthError } = authSlice.actions;
export default authSlice.reducer;
