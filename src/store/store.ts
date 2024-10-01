import {configureStore} from '@reduxjs/toolkit';
import AppReducer from './slice/appSlice';

export const store = configureStore({
  reducer: {
    auth: AppReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = ReturnType<typeof store.dispatch>;
