import { configureStore } from '@reduxjs/toolkit';
import AppReducer from './slice/appSlice';
import NetworkReducer from './slice/networkSlice';

export const store = configureStore({
  reducer: {
    auth: AppReducer,
    network: NetworkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = ReturnType<typeof store.dispatch>;
