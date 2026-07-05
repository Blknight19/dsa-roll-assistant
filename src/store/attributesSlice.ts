import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export const ATTRIBUTE_KEYS = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export type AttributeState = Record<AttributeKey, number>;

export const initialAttributeState: AttributeState = {
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
	initialState: initialAttributeState,
	reducers: {
		setAttribute: (state, action: PayloadAction<{ key: AttributeKey, value: number }>) => {
			state[action.payload.key] = action.payload.value;
		},
		resetAttributes: () => initialAttributeState
	}
});

export const { setAttribute, resetAttributes } = attributesSlice.actions;
export const attributeReducer = attributesSlice.reducer;