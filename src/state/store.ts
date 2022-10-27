import { configureStore } from '@reduxjs/toolkit';
import loadingAniModal from './features/loadingAniModal';
import snackBar from './features/snackBar';
import selectDatePicker from './features/selectDatePicker';
import bottomSheet from './features/bottomSheet';

const store = configureStore({
    reducer: {
        loadingAniModal,
        snackBar,
        selectDatePicker,
        bottomSheet,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
