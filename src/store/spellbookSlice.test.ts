import { describe, expect, it } from 'vitest';
import {
	addSpell,
	addUpkeep,
	changeAsp,
	clampAsp,
	initialSpellbookState,
	removeSpell,
	removeUpkeep,
	setAsp,
	setSpellcaster,
	spellbookReducer,
	updateSpell,
	type Spell
} from './spellbookSlice';

const zauber = (overrides: Partial<Spell> = {}): Spell => ({
	id: 'z1',
	name: 'Odem Arcanum',
	attributes: ['KL', 'IN', 'IN'],
	cost: 4,
	value: 10,
	...overrides
});

describe('clampAsp', () => {
	it('lässt ein Maximum von 0 zu — anders als LeP', () => {
		expect(clampAsp({ current: 0, max: 0 })).toEqual({ current: 0, max: 0 });
	});

	it('kappt current am Maximum', () => {
		expect(clampAsp({ current: 50, max: 30 })).toEqual({ current: 30, max: 30 });
	});

	it('verhindert negative Werte', () => {
		expect(clampAsp({ current: -5, max: -3 })).toEqual({ current: 0, max: 0 });
	});
});

describe('spellbookReducer', () => {
	it('schaltet zauberkundig um, ohne Daten zu löschen', () => {
		let state = spellbookReducer(initialSpellbookState, addSpell(zauber()));
		state = spellbookReducer(state, setSpellcaster(true));
		state = spellbookReducer(state, setSpellcaster(false));
		expect(state.isSpellcaster).toBe(false);
		expect(state.spells).toHaveLength(1);
	});

	it('senkt AsP per changeAsp und nicht unter 0', () => {
		let state = spellbookReducer(initialSpellbookState, setAsp({ current: 10, max: 30 }));
		state = spellbookReducer(state, changeAsp(-4));
		expect(state.asp.current).toBe(6);
		state = spellbookReducer(state, changeAsp(-99));
		expect(state.asp.current).toBe(0);
	});

	it('erstattet AsP per changeAsp zurück, gedeckelt am Maximum', () => {
		let state = spellbookReducer(initialSpellbookState, setAsp({ current: 28, max: 30 }));
		state = spellbookReducer(state, changeAsp(8));
		expect(state.asp.current).toBe(30);
	});

	it('kappt Zaubernamen und Fertigkeitswerte', () => {
		const state = spellbookReducer(
			initialSpellbookState,
			addSpell(zauber({ name: 'x'.repeat(200), value: 99 }))
		);
		expect(state.spells[0].name).toHaveLength(60);
		expect(state.spells[0].value).toBe(25);
	});

	it('nimmt nicht mehr als SPELL_LIMIT Zauber auf', () => {
		let state = initialSpellbookState;
		for (let i = 0; i < 105; i++) {
			state = spellbookReducer(state, addSpell(zauber({ id: `z${i}` })));
		}
		expect(state.spells).toHaveLength(100);
	});

	it('ändert und entfernt einzelne Zauber', () => {
		let state = spellbookReducer(initialSpellbookState, addSpell(zauber()));
		state = spellbookReducer(state, updateSpell({ id: 'z1', changes: { value: 14 } }));
		expect(state.spells[0].value).toBe(14);
		state = spellbookReducer(state, removeSpell('z1'));
		expect(state.spells).toHaveLength(0);
	});

	it('führt laufende Zauber als Liste', () => {
		let state = spellbookReducer(
			initialSpellbookState,
			addUpkeep({ id: 'u1', spellName: 'Odem Arcanum', qs: 3 })
		);
		state = spellbookReducer(state, addUpkeep({ id: 'u2', spellName: 'Armatrutz', qs: 2 }));
		expect(state.upkeep).toHaveLength(2);
		state = spellbookReducer(state, removeUpkeep('u1'));
		expect(state.upkeep.map(e => e.id)).toEqual(['u2']);
	});
});
