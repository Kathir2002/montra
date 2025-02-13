import {PayloadAction, createSlice} from '@reduxjs/toolkit';
export type SecurityType = 'FINGERPRINT' | 'PIN';

interface IntialStateInterface {
  isLoggedIn: boolean;
  isFabToggleOpen: boolean;
  isTransactionAdded: boolean;
  modalOpen: boolean;
  userDetails: {
    name?: string;
    picture?: string;
    id?: string;
    email?: string;
    isSetupDone?: boolean;
    currencySymbol?: string;
    currentLanguage?: string;
    securityMethod?: SecurityType;
    phoneNumber?: string;
    activeContactRequestCount: number;
    isAdmin: boolean;
  };
}

const initialState: IntialStateInterface = {
  isLoggedIn: false,
  userDetails: {activeContactRequestCount: 0, isAdmin: false},
  isFabToggleOpen: false,
  isTransactionAdded: false,
  modalOpen: false,
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
    updateIsTransactionAdded: (state, action: PayloadAction<boolean>) => {
      state.isTransactionAdded = action.payload;
    },
    updateIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
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
export const {
  updateIsLoggedin,
  updateCurrentUser,
  updateIsFabToggleOpen,
  updateIsTransactionAdded,
  updateIsModalOpen,
} = AppSlice.actions;
