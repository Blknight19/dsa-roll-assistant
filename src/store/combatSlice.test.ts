import { describe, expect, it } from 'vitest';
import {
	COMBAT_STAT_MAX,
	LIFE_MAX,
	LIFE_MIN_FILL_PERCENT,
	clampCombatStat,
	clampLife,
	lifeFillPercent,
	combatReducer,
	initialCombatState,
	updateCombatStat,
	updateLifeStat
} from './combatSlice';

describe('clampLife', () => {
	it('erzwingt ein Maximum von mindestens 1 — sonst teilt der Lebensbalken durch null', () => {
		expect(clampLife({ current: 0, max: 0 })).toEqual({ current: 0, max: 1 });
		expect(clampLife({ current: 5, max: -12 })).toEqual({ current: 1, max: 1 });
	});

	it('hält den aktuellen Wert zwischen 0 und dem Maximum', () => {
		expect(clampLife({ current: 99, max: 32 })).toEqual({ current: 32, max: 32 });
		expect(clampLife({ current: -7, max: 32 })).toEqual({ current: 0, max: 32 });
	});

	it('lässt LeP deutlich über 20 zu (KO×2 + Rassenbonus)', () => {
		expect(clampLife({ current: 32, max: 38 })).toEqual({ current: 32, max: 38 });
	});

	it('deckelt bei LIFE_MAX und rundet auf ganze Punkte', () => {
		expect(clampLife({ current: 5000, max: 5000 })).toEqual({ current: LIFE_MAX, max: LIFE_MAX });
		expect(clampLife({ current: 12.7, max: 30.2 })).toEqual({ current: 13, max: 30 });
	});
});

describe('lifeFillPercent', () => {
	it('zeigt bei 0 LeP gar keine Füllung', () => {
		expect(lifeFillPercent({ current: 0, max: 40 })).toBe(0);
	});

	it('zeigt bei 1 LeP einen sichtbaren Streifen statt fast nichts', () => {
		// 1/40 wären 2,5 % — auf einem Handy-Balken unsichtbar und von 0 nicht zu unterscheiden.
		expect(lifeFillPercent({ current: 1, max: 40 })).toBe(LIFE_MIN_FILL_PERCENT);
	});

	it('rechnet oberhalb des Mindest-Streifens exakt', () => {
		expect(lifeFillPercent({ current: 20, max: 40 })).toBe(50);
		expect(lifeFillPercent({ current: 40, max: 40 })).toBe(100);
	});

	it('läuft nicht über 100 Prozent', () => {
		expect(lifeFillPercent({ current: 99, max: 40 })).toBe(100);
	});

	it('bleibt bei einem Maximum von 0 endlich', () => {
		expect(lifeFillPercent({ current: 5, max: 0 })).toBe(0);
	});
});

describe('clampCombatStat', () => {
	it('begrenzt auf 0..COMBAT_STAT_MAX', () => {
		expect(clampCombatStat(-3)).toBe(0);
		expect(clampCombatStat(1000)).toBe(COMBAT_STAT_MAX);
		expect(clampCombatStat(14)).toBe(14);
	});
});

describe('combatReducer', () => {
	it('zieht den aktuellen Wert nach, wenn das Maximum darunter sinkt', () => {
		const full = combatReducer(initialCombatState, updateLifeStat({ current: 30, max: 32 }));
		expect(full.life).toEqual({ current: 30, max: 32 });

		const lowered = combatReducer(full, updateLifeStat({ max: 12 }));
		expect(lowered.life).toEqual({ current: 12, max: 12 });
	});

	it('lässt Heilung nicht über das Maximum steigen', () => {
		const hurt = combatReducer(initialCombatState, updateLifeStat({ current: 8, max: 10 }));
		const healed = combatReducer(hurt, updateLifeStat({ current: hurt.life.current + 5 }));
		expect(healed.life.current).toBe(10);
	});

	it('lässt Schaden nicht unter 0 fallen', () => {
		const dying = combatReducer(initialCombatState, updateLifeStat({ current: 2, max: 20 }));
		const dead = combatReducer(dying, updateLifeStat({ current: dying.life.current - 5 }));
		expect(dead.life.current).toBe(0);
	});

	it('klemmt Kampfwerte beim Setzen', () => {
		const state = combatReducer(initialCombatState, updateCombatStat({ key: 'attack', value: 999 }));
		expect(state.attack).toBe(COMBAT_STAT_MAX);
	});
});
