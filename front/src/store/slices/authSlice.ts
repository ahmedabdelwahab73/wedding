import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  member: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Global window check for client-side only initialization
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const member = localStorage.getItem('member');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      return {
        member: member ? JSON.parse(member) : null,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        isAuthenticated: !!accessToken,
      };
    } catch (error) {
      console.error('Failed to load auth state from localStorage', error);
    }
  }
  return {
    member: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ member: any; accessToken: string; refreshToken: string }>
    ) => {
      const { member, accessToken, refreshToken } = action.payload;
      state.member = member;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      // Persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('member', JSON.stringify(member));
        localStorage.setItem('user', JSON.stringify(member)); // For compatibility
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    logout: (state) => {
      state.member = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('member');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.member = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('member', JSON.stringify(action.payload));
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
