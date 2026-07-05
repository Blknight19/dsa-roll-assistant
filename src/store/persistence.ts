import { ATTRIBUTE_KEYS, initialAttributeState, type AttributeState } from './attributesSlice';
import { initialCombatState, type CombatState, type CombatStatKey } from './combatSlice';
import { HISTORY_LIMIT, type RollHistoryEntry } from './rollSlice';
import { initialSettingsState, type SettingsState } from './settingsSlice';
import { initialTalentState, type Talent, type TalentState } from './talentsSlice';

const STORAGE_KEY = 'dsa-app-state';

export const PERSISTED_VERSION = 2;

/** Format des localStorage-Blobs ab Version 2. */
export type PersistedState = {
	version: number;
	attributes: AttributeState;
	talents: Pick<Talent, 'id' | 'value'>[];
	combat: CombatState;
	history: RollHistoryEntry[];
	settings: SettingsState;
};

/** Die persistierten Slices im Store-Shape (für preloadedState). */
export type PersistedSlices = {
	attributes: AttributeState;
	talents: TalentState;
	combat: CombatState;
	roll: { history: RollHistoryEntry[] };
	settings: SettingsState;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const sanitizeAttributes = (raw: unknown): AttributeState => {
	const attributes = { ...initialAttributeState };
	if (!isRecord(raw)) return attributes;
	for (const key of ATTRIBUTE_KEYS) {
		const value = raw[key];
		if (typeof value === 'number' && Number.isFinite(value)) attributes[key] = value;
	}
	return attributes;
};

/**
 * Merged persistierte Talentwerte per id in die Code-Talentliste: neue Talente
 * aus dem Code erscheinen mit Standardwert, unbekannte ids werden verworfen.
 */
export const sanitizeTalents = (raw: unknown): Talent[] => {
	const talents = initialTalentState.talents.map(talent => ({ ...talent }));
	if (!Array.isArray(raw)) return talents;
	for (const entry of raw) {
		if (!isRecord(entry) || typeof entry.value !== 'number' || !Number.isFinite(entry.value)) continue;
		const talent = talents.find(t => t.id === entry.id);
		if (talent) talent.value = entry.value;
	}
	return talents;
};

const COMBAT_STAT_KEYS: CombatStatKey[] = ['attack', 'save', 'dodge', 'initiative', 'ranged'];

export const sanitizeCombat = (raw: unknown): CombatState => {
	const combat = { ...initialCombatState, life: { ...initialCombatState.life } };
	if (!isRecord(raw)) return combat;
	for (const key of COMBAT_STAT_KEYS) {
		const value = raw[key];
		if (typeof value === 'number' && Number.isFinite(value)) combat[key] = value;
	}
	if (isRecord(raw.life)) {
		if (typeof raw.life.current === 'number' && Number.isFinite(raw.life.current)) combat.life.current = raw.life.current;
		if (typeof raw.life.max === 'number' && Number.isFinite(raw.life.max)) combat.life.max = raw.life.max;
	}
	return combat;
};

const ROLL_TYPES = ['Einzel', 'Talent', 'Kampf'];

export const sanitizeHistory = (raw: unknown): RollHistoryEntry[] => {
	if (!Array.isArray(raw)) return [];
	return raw
		.filter((entry): entry is RollHistoryEntry =>
			isRecord(entry) &&
			typeof entry.id === 'string' &&
			typeof entry.result === 'string' &&
			typeof entry.date === 'string' &&
			ROLL_TYPES.includes(entry.type as string) &&
			Array.isArray(entry.values) &&
			entry.values.every(value => typeof value === 'number'))
		.slice(0, HISTORY_LIMIT);
};

export const sanitizeSettings = (raw: unknown): SettingsState => {
	const settings = { ...initialSettingsState };
	if (isRecord(raw) && typeof raw.confirmCriticals === 'boolean') {
		settings.confirmCriticals = raw.confirmCriticals;
	}
	return settings;
};

/**
 * Normalisiert einen persistierten Blob beliebiger Version in den Store-Shape.
 * Blobs ohne version-Feld sind Alt-Format (kompletter Slice-Dump).
 */
export const migratePersisted = (raw: unknown): PersistedSlices | undefined => {
	if (!isRecord(raw)) return undefined;

	const legacy = raw.version === undefined;
	const talents = legacy ? (isRecord(raw.talents) ? raw.talents.talents : undefined) : raw.talents;
	const history = legacy ? (isRecord(raw.roll) ? raw.roll.history : undefined) : raw.history;

	return {
		attributes: sanitizeAttributes(raw.attributes),
		talents: { talents: sanitizeTalents(talents) },
		combat: sanitizeCombat(raw.combat),
		roll: { history: sanitizeHistory(history) },
		settings: sanitizeSettings(legacy ? undefined : raw.settings)
	};
};

export const toPersisted = (state: PersistedSlices): PersistedState => ({
	version: PERSISTED_VERSION,
	attributes: state.attributes,
	talents: state.talents.talents.map(({ id, value }) => ({ id, value })),
	combat: state.combat,
	history: state.roll.history.slice(0, HISTORY_LIMIT),
	settings: state.settings
});

export const loadState = (): PersistedSlices | undefined => {
	try {
		const serialized = localStorage.getItem(STORAGE_KEY);
		if (!serialized) return undefined;
		return migratePersisted(JSON.parse(serialized));
	} catch (error) {
		console.warn('Gespeicherter Zustand konnte nicht geladen werden:', error);
		return undefined;
	}
};

export const saveState = (state: PersistedSlices) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersisted(state)));
	} catch (error) {
		console.warn('Zustand konnte nicht gespeichert werden:', error);
	}
};

export const clearPersistedState = () => {
	localStorage.removeItem(STORAGE_KEY);
};
