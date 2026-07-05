import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';



export type CombatState = {
	attack: number;
	save: number;
	dodge: number;
	initiative: number;
	ranged: number;
	life: {
		current: number;
		max: number;
	}
}


export const initialCombatState: CombatState = {
	attack: 8,
	save: 8,
	dodge: 8,
	initiative: 8,
	ranged: 8,
	life: {
		current: 8,
		max: 8
	}
};

export type CombatStatKey = Exclude<keyof CombatState, 'life'>;

const combatSlice = createSlice({
	name: 'combat',
	initialState: initialCombatState,
	reducers: {
		updateCombatStat: (state, action: PayloadAction<{ key: CombatStatKey, value: number }>) => {
			state[action.payload.key] = action.payload.value;
		},
		updateLifeStat: (state, action: PayloadAction<{ current?: number, max?: number }>) => {
			if (action.payload.current !== undefined) {
				state.life.current = Math.max(0, action.payload.current);
			}

			if (action.payload.max !== undefined) {
				state.life.max = Math.max(1, action.payload.max);
			}
		}
	}
});

export const { updateCombatStat, updateLifeStat } = combatSlice.actions;
export const combatReducer = combatSlice.reducer;