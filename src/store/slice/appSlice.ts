import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface IntialStateInterface {
  isLoggedIn: boolean;
  isFabToggleOpen: boolean;
  userDetails: {
    name?: string;
    picture?: string;
    id?: string;
    email?: string;
    isSetupDone?: boolean;
    currencySymbol?: string;
    currentLanguage?: string;
    securityMethod?: 'PIN' | 'FINGERPRINT';
  };
}

const initialState: IntialStateInterface = {
  isLoggedIn: false,
  userDetails: {},
  isFabToggleOpen: false,
};

export const AppSlice = createSlice({
  initialState: initialState,
  name: 'AppSlice',
  reducers: {
    updateIsLoggedin: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    updateIsFabToggleOpen: (state, action: PayloadAction<boolean>) => {
      state.isFabToggleOpen = action.payload;
    },
    updateCurrentUser: (
      state,
      action: PayloadAction<IntialStateInterface['userDetails']>,
    ) => {
      state.userDetails = action.payload;
    },
  },
});

export default AppSlice.reducer;
export const {updateIsLoggedin, updateCurrentUser, updateIsFabToggleOpen} =
  AppSlice.actions;
