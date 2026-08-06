import {
	ATTRIBUTE_KEYS,
	clampAttribute,
	initialAttributeState,
	type AttributeKey,
	type AttributeState
} from './attributesSlice';
import {
	COMBAT_STAT_KEYS,
	clampCombatStat,
	clampLife,
	initialCombatState,
	type CombatState
} from './combatSlice';
import {
	DEFAULT_CHARACTER_ID,
	initialProfileState,
	sanitizeCharacterName,
	type ProfileState
} from './profileSlice';
import { HISTORY_LIMIT, type RollHistoryEntry } from './rollSlice';
import { initialSettingsState, type SettingsState } from './settingsSlice';
import {
	ASP_MAX,
	SPELL_LIMIT,
	clampAsp,
	clampSpellCost,
	initialSpellbookState,
	sanitizeSpellName,
	type Spell,
	type SpellbookState
} from './spellbookSlice';
import { clampTalentValue, initialTalentState, type Talent, type TalentState } from './talentsSlice';

const STORAGE_KEY = 'dsa-app-state';

export const PERSISTED_VERSION = 4;

/**
 * Ein Charakter im Dateiformat. Die App verwaltet heute genau einen, das Format trägt
 * aber bereits eine Liste — so kostet ein späterer Charakterwechsel keine Migration.
 */
export type PersistedCharacter = {
	id: string;
	name: string;
	attributes: AttributeState;
	talents: Pick<Talent, 'id' | 'value'>[];
	combat: CombatState;
	spellbook: SpellbookState;
};

/** Format des localStorage-Blobs ab Version 3. */
export type PersistedState = {
	version: number;
	activeCharacterId: string;
	characters: PersistedCharacter[];
	/** Historie und Regeleinstellungen gehören der App, nicht dem Charakter. */
	history: RollHistoryEntry[];
	settings: SettingsState;
};

/** Die persistierten Slices im Store-Shape (für preloadedState). */
export type PersistedSlices = {
	profile: ProfileState;
	attributes: AttributeState;
	talents: TalentState;
	combat: CombatState;
	spellbook: SpellbookState;
	roll: { history: RollHistoryEntry[] };
	settings: SettingsState;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

/** Schließt NaN und Infinity aus — `typeof NaN === 'number'` allein reicht nicht. */
export const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

export const sanitizeAttributes = (raw: unknown): AttributeState => {
	const attributes = { ...initialAttributeState };
	if (!isRecord(raw)) return attributes;
	for (const key of ATTRIBUTE_KEYS) {
		const value = raw[key];
		if (isFiniteNumber(value)) attributes[key] = clampAttribute(value);
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
		if (!isRecord(entry) || !isFiniteNumber(entry.value)) continue;
		const talent = talents.find(t => t.id === entry.id);
		if (talent) talent.value = clampTalentValue(entry.value);
	}
	return talents;
};

export const sanitizeCombat = (raw: unknown): CombatState => {
	const combat = { ...initialCombatState, life: { ...initialCombatState.life } };
	if (!isRecord(raw)) return combat;
	for (const key of COMBAT_STAT_KEYS) {
		const value = raw[key];
		if (isFiniteNumber(value)) combat[key] = clampCombatStat(value);
	}
	if (isRecord(raw.life)) {
		if (isFiniteNumber(raw.life.current)) combat.life.current = raw.life.current;
		if (isFiniteNumber(raw.life.max)) combat.life.max = raw.life.max;
	}
	combat.life = clampLife(combat.life);
	return combat;
};

const ROLL_TYPES = ['Einzel', 'Talent', 'Kampf', 'Zauber'];

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

const isAttributeKey = (value: unknown): value is AttributeKey =>
	typeof value === 'string' && (ATTRIBUTE_KEYS as readonly string[]).includes(value);

/**
 * Strenger als `sanitizeTalents`: Talente werden per id in eine Code-Liste gemerged,
 * fremde Werte können dort nur Zahlen sein. Zauber tragen freie Namen und freie
 * Eigenschaften — jeder davon kommt aus einer Datei, der man nicht traut.
 */
const sanitizeSpell = (raw: unknown): Spell | undefined => {
	if (!isRecord(raw)) return undefined;
	if (typeof raw.id !== 'string' || !raw.id) return undefined;
	if (typeof raw.name !== 'string') return undefined;
	if (!Array.isArray(raw.attributes) || raw.attributes.length !== 3) return undefined;
	if (!raw.attributes.every(isAttributeKey)) return undefined;
	if (!isFiniteNumber(raw.cost) || !isFiniteNumber(raw.value)) return undefined;

	return {
		id: raw.id,
		catalogId: typeof raw.catalogId === 'string' ? raw.catalogId : undefined,
		name: sanitizeSpellName(raw.name),
		attributes: raw.attributes as [AttributeKey, AttributeKey, AttributeKey],
		cost: clampSpellCost(raw.cost),
		costText: typeof raw.costText === 'string' ? raw.costText.slice(0, 120) : undefined,
		duration: typeof raw.duration === 'string' ? raw.duration.slice(0, 60) : undefined,
		value: clampTalentValue(raw.value),
		note: typeof raw.note === 'string' ? raw.note.slice(0, 500) : undefined
	};
};

export const sanitizeSpellbook = (raw: unknown): SpellbookState => {
	if (!isRecord(raw)) return { ...initialSpellbookState, asp: { ...initialSpellbookState.asp } };

	const spells: Spell[] = [];
	if (Array.isArray(raw.spells)) {
		for (const entry of raw.spells.slice(0, SPELL_LIMIT)) {
			const spell = sanitizeSpell(entry);
			if (spell) spells.push(spell);
		}
	}

	// Wie bei `spells` gedeckelt auf SPELL_LIMIT: mehr laufende Zauber, als man
	// überhaupt kennen kann, gehören nicht in eine ehrliche Importdatei.
	const upkeep = Array.isArray(raw.upkeep)
		? raw.upkeep
			.filter((entry): entry is SpellbookState['upkeep'][number] =>
				isRecord(entry) &&
				typeof entry.id === 'string' &&
				typeof entry.spellName === 'string' &&
				isFiniteNumber(entry.qs) &&
				entry.qs >= 1 && entry.qs <= 6)
			.slice(0, SPELL_LIMIT)
		: [];

	const asp = isRecord(raw.asp)
		? clampAsp({
			current: isFiniteNumber(raw.asp.current) ? raw.asp.current : 0,
			max: isFiniteNumber(raw.asp.max) ? Math.min(ASP_MAX, raw.asp.max) : 0
		})
		: { current: 0, max: 0 };

	return {
		isSpellcaster: raw.isSpellcaster === true,
		asp,
		spells,
		upkeep
	};
};

export const sanitizeProfile = (raw: unknown): ProfileState => {
	if (!isRecord(raw)) return { ...initialProfileState };
	return {
		id: typeof raw.id === 'string' && raw.id ? raw.id : DEFAULT_CHARACTER_ID,
		name: typeof raw.name === 'string' ? sanitizeCharacterName(raw.name) : ''
	};
};

/**
 * Wählt den aktiven Charakter aus einem v3-Blob. Unbekannte oder fehlende
 * `activeCharacterId` fallen auf den ersten Eintrag zurück.
 */
const activeCharacter = (raw: Record<string, unknown>): unknown => {
	if (!Array.isArray(raw.characters)) return undefined;
	const wanted = raw.characters.find(
		entry => isRecord(entry) && entry.id === raw.activeCharacterId
	);
	return wanted ?? raw.characters[0];
};

/**
 * Normalisiert einen persistierten Blob beliebiger Version in den Store-Shape.
 * - v3: Charakterliste mit aktivem Eintrag
 * - v2: flacher Charakter auf oberster Ebene
 * - ohne version: Alt-Format (kompletter Slice-Dump)
 */
export const migratePersisted = (raw: unknown): PersistedSlices | undefined => {
	if (!isRecord(raw)) return undefined;

	const version = isFiniteNumber(raw.version) ? raw.version : 0;
	const legacy = version === 0;

	// Ab v3 stehen die Charakterdaten eine Ebene tiefer; davor lagen sie flach im Blob.
	const character = version >= 3 ? activeCharacter(raw) : raw;
	const source = isRecord(character) ? character : {};

	const talents = legacy
		? (isRecord(source.talents) ? source.talents.talents : undefined)
		: source.talents;
	const history = legacy ? (isRecord(raw.roll) ? raw.roll.history : undefined) : raw.history;

	return {
		profile: version >= 3
			? sanitizeProfile(source)
			: { ...initialProfileState },
		attributes: sanitizeAttributes(source.attributes),
		talents: { talents: sanitizeTalents(talents) },
		combat: sanitizeCombat(source.combat),
		spellbook: sanitizeSpellbook(source.spellbook),
		roll: { history: sanitizeHistory(history) },
		settings: sanitizeSettings(legacy ? undefined : raw.settings)
	};
};

export const toPersisted = (state: PersistedSlices): PersistedState => ({
	version: PERSISTED_VERSION,
	activeCharacterId: state.profile.id,
	characters: [{
		id: state.profile.id,
		name: state.profile.name,
		attributes: state.attributes,
		talents: state.talents.talents.map(({ id, value }) => ({ id, value })),
		combat: state.combat,
		spellbook: state.spellbook
	}],
	history: state.roll.history.slice(0, HISTORY_LIMIT),
	settings: state.settings
});

export const loadState = (): PersistedSlices | undefined => {
	try {
		const serialized = localStorage.getItem(STORAGE_KEY);
		if (!serialized) return undefined;
		return migratePersisted(JSON.parse(serialized));
	} catch {
		// Ein unlesbarer Blob darf den Start nicht verhindern — dann eben Defaults.
		return undefined;
	}
};

export const saveState = (state: PersistedSlices) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersisted(state)));
	} catch {
		// Voller oder gesperrter Speicher (Privater Modus): der Wurf gilt trotzdem.
	}
};

export const clearPersistedState = () => {
	localStorage.removeItem(STORAGE_KEY);
};
