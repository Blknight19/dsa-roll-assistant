import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export const HISTORY_LIMIT = 100;

export type RollHistoryEntry = {
	id: string,
	type: 'Einzel' | 'Talent' | 'Kampf',
	values: number[],
	result: string,
	date: string
}

type RollState = {
	history: RollHistoryEntry[]
}

const initialState: RollState = { history: [] };

const rollSlice = createSlice({
	name: 'roll',
	initialState,
	reducers: {
		addRoll: (state, action: PayloadAction<RollHistoryEntry>) => {
			state.history.unshift(action.payload);
			if (state.history.length > HISTORY_LIMIT) {
				state.history.length = HISTORY_LIMIT;
			}
		},
		clearHistory: (state) => {
			state.history = [];
		}
	}
});

export const { addRoll, clearHistory } = rollSlice.actions;
export const rollReducer = rollSlice.reducer;