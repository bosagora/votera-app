/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface BottomSheetState {
    visibility: boolean;
    sheetHeight?: number;
    bodyComponent?: () => JSX.Element;
}

const initialState: BottomSheetState = {
    visibility: false,
};

const bottomSheetSlice = createSlice({
    name: 'bottomSheet',
    initialState,
    reducers: {
        showBottomSheet: (state, action: PayloadAction<{ sheetHeight: number; bodyComponent: () => JSX.Element }>) => {
            state.visibility = true;
            state.sheetHeight = action.payload.sheetHeight;
            state.bodyComponent = action.payload.bodyComponent;
        },
        hideBottomSheet: (state) => {
            state.visibility = false;
            state.sheetHeight = undefined;
            state.bodyComponent = undefined;
        },
    },
});

export const { showBottomSheet, hideBottomSheet } = bottomSheetSlice.actions;

export const selectBottomSheetState = (state: RootState) => state.bottomSheet;

export default bottomSheetSlice.reducer;
