import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CombatRollResult } from '@/utils/rules';

export type CombatType = 'AT' | 'PA' | 'AW' | 'FK' | 'INI';

/** Vollständiger Schnappschuss eines Kampfwurfs — die Anzeige rechnet nur hieraus. */
export type CombatRoll = {
	type: CombatType;
	/** Kampfwert vor dem Modifikator, für die Herleitung in der Anzeige. */
	base: number;
	modifier: number;
	/** Nur bei INI gesetzt: Basiswert + 1W6 + Modifikator. */
	initiative?: number;
	/** Bei INI der W6, sonst der W20 (plus Bestätigungswurf, falls geworfen). */
	dice: number[];
	result?: CombatRollResult;
};

export type CombatRollState = {
	modifier: number;
	lastRoll: CombatRoll | null;
};

const initialState: CombatRollState = {
	modifier: 0,
	lastRoll: null
};

const combatRollSlice = createSlice({
	name: 'combatRoll',
	initialState,
	reducers: {
		setCombatModifier: (state, action: PayloadAction<number>) => {
			state.modifier = action.payload;
		},
		setCombatLastRoll: (state, action: PayloadAction<CombatRoll>) => {
			state.lastRoll = action.payload;
		}
	}
});

export const { setCombatModifier, setCombatLastRoll } = combatRollSlice.actions;
export const combatRollReducer = combatRollSlice.reducer;
