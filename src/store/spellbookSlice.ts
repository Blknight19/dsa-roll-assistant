import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AttributeKey } from './attributesSlice';
import { clampTalentValue } from './talentsSlice';

/** Ein Zauber im Zauberbuch des Helden. Katalogeinträge werden hier hinein kopiert. */
export type Spell = {
	id: string;
	/** Herkunft, wenn aus dem Katalog übernommen. Nie zum Nachschlagen zur Laufzeit. */
	catalogId?: string;
	name: string;
	attributes: [AttributeKey, AttributeKey, AttributeKey];
	/** Im Zauberbuch immer eine Zahl — Formeln aus dem Katalog löst der Spieler auf. */
	cost: number;
	/** Wortlaut aus dem Katalog, z. B. „1 AsP pro LeP". Nur Erinnerung. */
	costText?: string;
	duration?: string;
	value: number;
	note?: string;
};

export type UpkeepEntry = { id: string; spellName: string; qs: number };

export type AspState = { current: number; max: number };

export type SpellbookState = {
	/** Einziger Schalter für das gesamte Magie-Modul. */
	isSpellcaster: boolean;
	asp: AspState;
	spells: Spell[];
	upkeep: UpkeepEntry[];
};

export const SPELL_NAME_MAX = 60;
/** Weit über jedem gespielten Magier — Grenze gegen präparierte Importdateien. */
export const SPELL_LIMIT = 100;
export const SPELL_COST_MAX = 99;
export const ASP_MAX = 999;

export const initialSpellbookState: SpellbookState = {
	isSpellcaster: false,
	asp: { current: 0, max: 0 },
	spells: [],
	upkeep: []
};

/**
 * Anders als `clampLife` ist ein Maximum von 0 erlaubt: ein Held, der gerade erst
 * zauberkundig geschaltet wurde, hat noch keine AsP eingetragen.
 */
export const clampAsp = ({ current, max }: AspState): AspState => {
	const safeMax = Math.min(ASP_MAX, Math.max(0, Math.round(max)));
	return {
		max: safeMax,
		current: Math.min(safeMax, Math.max(0, Math.round(current)))
	};
};

export const sanitizeSpellName = (name: string): string =>
	name.replace(/\s+/g, ' ').trimStart().slice(0, SPELL_NAME_MAX);

export const clampSpellCost = (value: number): number =>
	Math.min(SPELL_COST_MAX, Math.max(0, Math.round(value)));

const normalizeSpell = (spell: Spell): Spell => ({
	...spell,
	name: sanitizeSpellName(spell.name),
	cost: clampSpellCost(spell.cost),
	value: clampTalentValue(spell.value)
});

const spellbookSlice = createSlice({
	name: 'spellbook',
	initialState: initialSpellbookState,
	reducers: {
		setSpellcaster: (state, action: PayloadAction<boolean>) => {
			// Ausschalten versteckt nur — Zauberbuch, AsP und laufende Zauber bleiben.
			state.isSpellcaster = action.payload;
		},
		setAsp: (state, action: PayloadAction<Partial<AspState>>) => {
			state.asp = clampAsp({
				current: action.payload.current ?? state.asp.current,
				max: action.payload.max ?? state.asp.max
			});
		},
		/** Relative Buchung — der Rückgängig-Knopf bucht denselben Betrag positiv zurück. */
		changeAsp: (state, action: PayloadAction<number>) => {
			state.asp = clampAsp({ current: state.asp.current + action.payload, max: state.asp.max });
		},
		addSpell: (state, action: PayloadAction<Spell>) => {
			if (state.spells.length >= SPELL_LIMIT) return;
			state.spells.push(normalizeSpell(action.payload));
		},
		updateSpell: (state, action: PayloadAction<{ id: string; changes: Partial<Spell> }>) => {
			const index = state.spells.findIndex(spell => spell.id === action.payload.id);
			if (index === -1) return;
			state.spells[index] = normalizeSpell({ ...state.spells[index], ...action.payload.changes });
		},
		removeSpell: (state, action: PayloadAction<string>) => {
			state.spells = state.spells.filter(spell => spell.id !== action.payload);
		},
		addUpkeep: (state, action: PayloadAction<UpkeepEntry>) => {
			state.upkeep.push(action.payload);
		},
		removeUpkeep: (state, action: PayloadAction<string>) => {
			state.upkeep = state.upkeep.filter(entry => entry.id !== action.payload);
		},
		/** Ersetzt das Buch am Stück — für den Import. */
		setSpellbook: (state, action: PayloadAction<SpellbookState>) => {
			state.isSpellcaster = action.payload.isSpellcaster;
			state.asp = clampAsp(action.payload.asp);
			state.spells = action.payload.spells.slice(0, SPELL_LIMIT).map(normalizeSpell);
			state.upkeep = action.payload.upkeep;
		}
	}
});

export const {
	setSpellcaster,
	setAsp,
	changeAsp,
	addSpell,
	updateSpell,
	removeSpell,
	addUpkeep,
	removeUpkeep,
	setSpellbook
} = spellbookSlice.actions;
export const spellbookReducer = spellbookSlice.reducer;
