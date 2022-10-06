/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface SnackBarState {
    visibility: boolean;
    text?: string;
}

const initialState: SnackBarState = {
    visibility: false,
    text: '',
};

const snackBarSlice = createSlice({
    name: 'snackBar',
    initialState,
    reducers: {
        showSnackBar: (state, action: PayloadAction<string>) => {
            state.visibility = true;
            state.text = action.payload;
        },
        hideSnackBar: (state) => {
            state.visibility = false;
            state.text = '';
        },
    },
});

export const { showSnackBar, hideSnackBar } = snackBarSlice.actions;

export const selectSnackBarState = (state: RootState) => state.snackBar;

export default snackBarSlice.reducer;
