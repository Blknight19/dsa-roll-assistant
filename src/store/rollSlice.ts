import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// const generateMockHistory = (count = 20): RollHistoryEntry[] =>
// 	Array.from({ length: count }, (_, i) => {
// 		const isTalent = Math.random() > 0.5;

// 		const values = isTalent
// 			? [Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20), Math.ceil(Math.random() * 20)]
// 			: [Math.ceil(Math.random() * 20)];

// 		const result = isTalent
// 			? `Ergebnis: ${Math.ceil(Math.random() * 10)} (QS ${Math.ceil(Math.random() * 6)})`
// 			: `Wurf: ${values[0]}`;

// 		return {
// 			id: String(i),
// 			type: isTalent ? "Talent" : "Einzel",
// 			values,
// 			result,
// 			date: new Date(Date.now() - i * 1000 * 60 * 15).toISOString(),
// 		};
// 	});

export type RollHistoryEntry = {
	id: string,
	type: 'Einzel' | 'Talent',
	values: number[],
	result: string,
	date: string
}

type RollState = {
	history: RollHistoryEntry[]
}

const initialState: RollState = { history: [] }

const rollSlice = createSlice({
	name: 'roll',
	initialState,
	reducers: {
		addRoll: (state, action: PayloadAction<RollHistoryEntry>) => {
			state.history.unshift(action.payload)
		},
		clearHistory: (state) => {
			state.history = []
		}
	}
})

export const { addRoll, clearHistory } = rollSlice.actions
export const rollReducer = rollSlice.reducer