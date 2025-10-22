import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AttributeKey = 'MU' | 'KL' | 'IN' | 'CH' | 'FF' | 'GE' | 'KO' | 'KK';

type AttributeState = {
	'MU': number;
	'KL': number;
	'IN': number;
	'CH': number;
	'FF': number;
	'GE': number;
	'KO': number;
	'KK': number;
}

const initialState: AttributeState = {
	'MU': 8,
	'KL': 8,
	'IN': 8,
	'CH': 8,
	'FF': 8,
	'GE': 8,
	'KO': 8,
	'KK': 8
};

const attributesSlice = createSlice({
	name: 'attributes',
	initialState,
	reducers: {
		setAttribute: (state, action: PayloadAction<{ key: AttributeKey, value: number }>) => {
			state[action.payload.key] = action.payload.value;
		},
		resetAttributes: () => initialState
	}
});

export const { setAttribute, resetAttributes } = attributesSlice.actions;
export const attributeReducer = attributesSlice.reducer;