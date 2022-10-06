/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface LoadingAniModalState {
    visibility: boolean;
    step?: number;
}

const initialState: LoadingAniModalState = {
    visibility: false,
};

const loadingAniModalSlice = createSlice({
    name: 'loadingAniModal',
    initialState,
    reducers: {
        showLoadingAniModal: (state) => {
            state.visibility = true;
        },
        hideLoadingAniModal: (state) => {
            state.visibility = false;
        },
    },
});

export const { showLoadingAniModal, hideLoadingAniModal } = loadingAniModalSlice.actions;

export const selectLoadingAniModalState = (state: RootState) => state.loadingAniModal;

export default loadingAniModalSlice.reducer;
