import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export type LoadingState = {
	isLoading: boolean;
}

const initialState: LoadingState = {
	isLoading: false
};

const loadingSlice = createSlice({
	name: 'loading',
	initialState,
	reducers: {
		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		}
	}
});


export const { setIsLoading } = loadingSlice.actions;
export const loadingReducer = loadingSlice.reducer;