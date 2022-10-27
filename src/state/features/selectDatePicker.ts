/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface SelectDatePickerState {
    startDate?: string;
    endDate?: string;
}

const initialState: SelectDatePickerState = {};

const selectDatePickerSlice = createSlice({
    name: 'selectDatePicker',
    initialState,
    reducers: {
        resetDatePicker: (state) => {
            state.startDate = undefined;
            state.endDate = undefined;
        },
        selectDatePicker: (state, action: PayloadAction<SelectDatePickerState>) => {
            state.startDate = action.payload.startDate;
            state.endDate = action.payload.endDate;
        },
    },
});

export const { resetDatePicker, selectDatePicker } = selectDatePickerSlice.actions;

export const selectDatePickerState = (state: RootState) => state.selectDatePicker;

export default selectDatePickerSlice.reducer;
