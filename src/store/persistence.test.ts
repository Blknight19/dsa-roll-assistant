import { describe, expect, it } from 'vitest';
import { migratePersisted, toPersisted, sanitizeHistory, PERSISTED_VERSION } from './persistence';
import { initialTalentState } from './talentsSlice';
import { initialSettingsState } from './settingsSlice';
import { HISTORY_LIMIT, type RollHistoryEntry } from './rollSlice';

const historyEntry = (id: string): RollHistoryEntry => ({
	id,
	type: 'Talent',
	values: [4, 8, 15],
	result: 'Ergebnis: 3 (QS: 1)',
	date: '2026-07-05T12:00:00.000Z'
});

describe('migratePersisted', () => {
	it('verwirft Nicht-Objekte', () => {
		expect(migratePersisted(null)).toBeUndefined();
		expect(migratePersisted('kaputt')).toBeUndefined();
		expect(migratePersisted(42)).toBeUndefined();
	});

	it('migriert einen Legacy-Blob (Slice-Dump ohne version)', () => {
		const legacy = {
			roll: { history: [historyEntry('a')] },
			talents: { talents: [{ id: '3', name: 'Klettern', attribute1: 'MU', attribute2: 'GE', attribute3: 'KK', value: 7 }] },
			attributes: { MU: 13, KL: 11 },
			combat: { attack: 12, life: { current: 20, max: 30 } }
		};

		const state = migratePersisted(legacy);
		expect(state).toBeDefined();
		expect(state!.attributes.MU).toBe(13);
		expect(state!.attributes.KL).toBe(11);
		expect(state!.attributes.KK).toBe(8); // fehlt im Blob -> Default
		expect(state!.talents.talents.find(t => t.id === '3')!.value).toBe(7);
		expect(state!.combat.attack).toBe(12);
		expect(state!.combat.life).toEqual({ current: 20, max: 30 });
		expect(state!.roll.history).toHaveLength(1);
		expect(state!.settings).toEqual(initialSettingsState);
	});

	it('Talente aus dem Code überleben, die im Blob fehlen', () => {
		const state = migratePersisted({ version: 2, talents: [{ id: '1', value: 5 }] });
		expect(state!.talents.talents).toHaveLength(initialTalentState.talents.length);
		expect(state!.talents.talents.find(t => t.id === '1')!.value).toBe(5);
		expect(state!.talents.talents.find(t => t.id === '59')!.value).toBe(0);
	});

	it('verwirft unbekannte Talent-ids und korrupte Werte', () => {
		const state = migratePersisted({
			version: 2,
			talents: [
				{ id: 'gibtsnicht', value: 9 },
				{ id: '2', value: 'zwölf' },
				{ id: '4', value: 4 }
			]
		});
		expect(state!.talents.talents).toHaveLength(initialTalentState.talents.length);
		expect(state!.talents.talents.find(t => t.id === '2')!.value).toBe(0);
		expect(state!.talents.talents.find(t => t.id === '4')!.value).toBe(4);
	});

	it('fällt bei korrupten Werten feldweise auf Defaults zurück', () => {
		const state = migratePersisted({
			version: 2,
			attributes: { MU: 'vierzehn', KL: 12 },
			combat: { attack: 'kaputt', dodge: 9, life: { current: 'x', max: 24 } },
			history: 'keine Liste',
			settings: { confirmCriticals: 'ja' }
		});
		expect(state!.attributes.MU).toBe(8);
		expect(state!.attributes.KL).toBe(12);
		expect(state!.combat.attack).toBe(8);
		expect(state!.combat.dodge).toBe(9);
		expect(state!.combat.life).toEqual({ current: 8, max: 24 });
		expect(state!.roll.history).toEqual([]);
		expect(state!.settings.confirmCriticals).toBe(true);
	});

	it('übernimmt persistierte Settings', () => {
		const state = migratePersisted({ version: 2, settings: { confirmCriticals: false } });
		expect(state!.settings.confirmCriticals).toBe(false);
	});
});

describe('Wertgrenzen beim Laden', () => {
	// Die Persistenz setzt preloadedState und umgeht damit die Reducer — sie muss
	// dieselben Grenzen selbst durchsetzen.
	it('repariert ein LeP-Maximum von 0, statt den Balken durch null teilen zu lassen', () => {
		const state = migratePersisted({ version: 2, combat: { life: { current: 5, max: 0 } } });
		expect(state!.combat.life.max).toBeGreaterThanOrEqual(1);
		expect(Number.isFinite(state!.combat.life.current / state!.combat.life.max)).toBe(true);
	});

	it('zieht einen aktuellen LeP-Wert über dem Maximum herunter', () => {
		const state = migratePersisted({ version: 2, combat: { life: { current: 99, max: 30 } } });
		expect(state!.combat.life).toEqual({ current: 30, max: 30 });
	});

	it('übernimmt LeP über 20 unverändert', () => {
		const state = migratePersisted({ version: 2, combat: { life: { current: 27, max: 34 } } });
		expect(state!.combat.life).toEqual({ current: 27, max: 34 });
	});

	it('verwirft NaN und Infinity, die typeof-Prüfungen allein passieren', () => {
		const state = migratePersisted({
			version: 2,
			attributes: { MU: NaN, KL: Infinity },
			combat: { attack: NaN, life: { current: Infinity, max: NaN } },
			talents: [{ id: '1', value: NaN }]
		});
		expect(state!.attributes.MU).toBe(8);
		expect(state!.attributes.KL).toBe(8);
		expect(state!.combat.attack).toBe(8);
		expect(state!.talents.talents.find(t => t.id === '1')!.value).toBe(0);
		expect(Number.isFinite(state!.combat.life.current)).toBe(true);
		expect(Number.isFinite(state!.combat.life.max)).toBe(true);
	});

	it('begrenzt Eigenschaften und Talentwerte auf gültige Bereiche', () => {
		const state = migratePersisted({
			version: 2,
			attributes: { MU: 999, KL: -5 },
			talents: [{ id: '1', value: 999 }, { id: '2', value: -4 }]
		});
		expect(state!.attributes.MU).toBe(20);
		expect(state!.attributes.KL).toBe(1);
		expect(state!.talents.talents.find(t => t.id === '1')!.value).toBe(25);
		expect(state!.talents.talents.find(t => t.id === '2')!.value).toBe(0);
	});
});

describe('sanitizeHistory', () => {
	it('deckelt die History bei HISTORY_LIMIT', () => {
		const entries = Array.from({ length: HISTORY_LIMIT + 50 }, (_, i) => historyEntry(String(i)));
		expect(sanitizeHistory(entries)).toHaveLength(HISTORY_LIMIT);
	});

	it('filtert Einträge mit falschem Shape heraus', () => {
		const entries = [historyEntry('ok'), { id: 1, type: 'Talent' }, { ...historyEntry('badtype'), type: 'Quatsch' }];
		const clean = sanitizeHistory(entries);
		expect(clean).toHaveLength(1);
		expect(clean[0].id).toBe('ok');
	});
});

describe('toPersisted / Roundtrip', () => {
	it('schreibt die aktuelle Version und liest sie identisch zurück', () => {
		const slices = migratePersisted({ version: 2, attributes: { MU: 14 }, talents: [{ id: '5', value: 6 }] })!;
		slices.profile.name = 'Thorwal Grimm';

		const blob = toPersisted(slices);
		expect(blob.version).toBe(PERSISTED_VERSION);
		expect(blob.characters).toHaveLength(1);
		expect(blob.activeCharacterId).toBe(blob.characters[0].id);
		expect(blob.characters[0].talents).toContainEqual({ id: '5', value: 6 });

		const reloaded = migratePersisted(JSON.parse(JSON.stringify(blob)))!;
		expect(reloaded).toEqual(slices);
	});

	it('hebt einen v2-Blob in einen benannten Charakter-Eintrag', () => {
		const slices = migratePersisted({
			version: 2,
			attributes: { MU: 14 },
			combat: { life: { current: 20, max: 30 } }
		})!;
		expect(slices.profile.name).toBe('');
		expect(slices.attributes.MU).toBe(14);
		expect(slices.combat.life).toEqual({ current: 20, max: 30 });
	});

	it('wählt bei mehreren Charakteren den aktiven aus', () => {
		const state = migratePersisted({
			version: 3,
			activeCharacterId: 'b',
			characters: [
				{ id: 'a', name: 'Alrik', attributes: { MU: 9 }, talents: [], combat: {} },
				{ id: 'b', name: 'Boron', attributes: { MU: 17 }, talents: [], combat: {} }
			]
		})!;
		expect(state.profile).toEqual({ id: 'b', name: 'Boron' });
		expect(state.attributes.MU).toBe(17);
	});

	it('fällt auf den ersten Charakter zurück, wenn die aktive id unbekannt ist', () => {
		const state = migratePersisted({
			version: 3,
			activeCharacterId: 'weg',
			characters: [{ id: 'a', name: 'Alrik', attributes: { MU: 9 }, talents: [], combat: {} }]
		})!;
		expect(state.profile.name).toBe('Alrik');
	});
});
