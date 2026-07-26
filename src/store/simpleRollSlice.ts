import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SimpleRoll = {
	count: number;
	sides: number;
	modifier: number;
	dice: number[];
	total: number;
};

export type SimpleRollState = {
	count: number;
	sides: number;
	modifier: number;
	lastRoll: SimpleRoll | null;
};

const initialState: SimpleRollState = {
	count: 1,
	sides: 20,
	modifier: 0,
	lastRoll: null
};

const simpleRollSlice = createSlice({
	name: 'simpleRoll',
	initialState,
	reducers: {
		setSimpleCount: (state, action: PayloadAction<number>) => {
			state.count = action.payload;
		},
		setSimpleSides: (state, action: PayloadAction<number>) => {
			state.sides = action.payload;
		},
		setSimpleModifier: (state, action: PayloadAction<number>) => {
			state.modifier = action.payload;
		},
		setSimpleLastRoll: (state, action: PayloadAction<SimpleRoll>) => {
			state.lastRoll = action.payload;
		}
	}
});

export const { setSimpleCount, setSimpleSides, setSimpleModifier, setSimpleLastRoll } =
	simpleRollSlice.actions;
export const simpleRollReducer = simpleRollSlice.reducer;
