import { createSlice } from "@reduxjs/toolkit";

interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean;
    isOnline: boolean;
}

const initialState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    isOnline: true,
};

const NetworkSlice = createSlice({
    name: "network",
    initialState,
    reducers: {
        setNetworkStatus: (state, action) => {
            const { isConnected, isInternetReachable } = action.payload;
            state.isConnected = isConnected;
            state.isInternetReachable = isInternetReachable;
            state.isOnline = isConnected && isInternetReachable;
        },
    },
});

export const { setNetworkStatus } = NetworkSlice.actions;
export default NetworkSlice.reducer;
