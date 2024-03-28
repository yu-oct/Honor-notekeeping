import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './reducers';

interface AuthState {
    isLoggedIn: boolean;
    username: string;
    token: string;
    email: string;
    userId: string;
}

const initialState: AuthState = {
    isLoggedIn: false,
    username: '',
    token: '',
    email: '',
    userId: '',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ username: string, token: string, email: string, userId: string }>) => {
            state.isLoggedIn = true;
            state.username = action.payload.username;
            state.token = action.payload.token;
            state.email = action.payload.email;
            state.userId = action.payload.userId;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.username = '';
            state.token = '';
            state.email = '';
            state.userId = '';
        },
    },
});

export const { login, logout } = authSlice.actions;

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectUsername = (state: RootState) => state.auth.username;
export const selectToken = (state: RootState) => state.auth.token;
export const selectEmail = (state: RootState) => state.auth.email;
export const selectUserId = (state: RootState) => state.auth.userId;

export default authSlice.reducer;
