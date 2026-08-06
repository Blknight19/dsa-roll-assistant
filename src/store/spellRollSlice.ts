import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AttributeKey } from './attributesSlice';
import type { TalentCheckResult } from '@/utils/rules';

export type SpellEntry = { attribute: AttributeKey; value: number };

/** Vollständiger Schnappschuss eines Zauberwurfs — die Anzeige rechnet nur hieraus. */
export type SpellRoll = {
	spellId: string;
	spellName: string;
	entries: SpellEntry[];
	modifier: number;
	taw: number;
	/** Tatsächlich gebuchte AsP — der Rückgängig-Knopf bucht genau diese zurück. */
	aspSpent: number;
	/** Wirkungsdauer aus dem Zauberbuch; „sofort" verhindert das Aufrechterhalten. */
	duration?: string;
	result: TalentCheckResult;
};

export type SpellRollState = {
	spellId: string | null;
	spellName: string;
	entries: SpellEntry[];
	modifier: number;
	taw: number;
	cost: number;
	duration?: string;
	lastRoll: SpellRoll | null;
	/** Ob die AsP des letzten Wurfs noch gebucht sind — schaltet den Rückgängig-Knopf. */
	lastRollBooked: boolean;
};

const initialState: SpellRollState = {
	spellId: null,
	spellName: '',
	entries: [
		{ attribute: 'KL', value: 8 },
		{ attribute: 'IN', value: 8 },
		{ attribute: 'IN', value: 8 }
	],
	modifier: 0,
	taw: 0,
	cost: 0,
	duration: undefined,
	lastRoll: null,
	lastRollBooked: false
};

const spellRollSlice = createSlice({
	name: 'spellRoll',
	initialState,
	reducers: {
		selectSpell: (state, action: PayloadAction<{
			id: string; name: string; entries: SpellEntry[]; taw: number; cost: number; duration?: string;
		}>) => {
			state.spellId = action.payload.id;
			state.spellName = action.payload.name;
			state.entries = action.payload.entries;
			state.taw = action.payload.taw;
			state.cost = action.payload.cost;
			state.duration = action.payload.duration;
			// Sonst steht das Ergebnis des vorigen Zaubers über der neuen Auswahl.
			state.lastRoll = null;
			state.lastRollBooked = false;
		},
		setSpellModifier: (state, action: PayloadAction<number>) => {
			state.modifier = action.payload;
		},
		setSpellTaw: (state, action: PayloadAction<number>) => {
			state.taw = action.payload;
		},
		setSpellCost: (state, action: PayloadAction<number>) => {
			state.cost = action.payload;
		},
		setSpellLastRoll: (state, action: PayloadAction<SpellRoll>) => {
			state.lastRoll = action.payload;
			state.lastRollBooked = true;
		},
		/** Rückgängig: der Wurf bleibt sichtbar, die Buchung gilt als zurückgenommen. */
		markLastRollRefunded: (state) => {
			state.lastRollBooked = false;
		}
	}
});

export const {
	selectSpell,
	setSpellModifier,
	setSpellTaw,
	setSpellCost,
	setSpellLastRoll,
	markLastRollRefunded
} = spellRollSlice.actions;
export const spellRollReducer = spellRollSlice.reducer;
