import {createContext, Dispatch, SetStateAction} from 'react';

export interface AppContextData {
  isTransactionAdded: boolean;
  setIsTransactionAdded: Dispatch<SetStateAction<boolean>>;
}
const defaultValue: AppContextData = {
  isTransactionAdded: false,
  setIsTransactionAdded: () => {},
};
const AppContext = createContext<AppContextData>(defaultValue);

export default AppContext;
