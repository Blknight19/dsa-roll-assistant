import { describe, expect, it } from 'vitest';
import { ATTRIBUTE_KEYS } from '@/store/attributesSlice';
import { SPELL_CATALOG } from './spells';

describe('SPELL_CATALOG', () => {
	it('ist nicht leer', () => {
		expect(SPELL_CATALOG.length).toBeGreaterThan(0);
	});

	it('vergibt jede id nur einmal', () => {
		const ids = SPELL_CATALOG.map(entry => entry.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('nennt je Zauber genau drei gültige Eigenschaften', () => {
		for (const entry of SPELL_CATALOG) {
			expect(entry.attributes, entry.name).toHaveLength(3);
			for (const attribute of entry.attributes) {
				expect(ATTRIBUTE_KEYS, entry.name).toContain(attribute);
			}
		}
	});

	it('trägt entweder eine nicht-negative Zahl oder null als Kosten', () => {
		for (const entry of SPELL_CATALOG) {
			if (entry.cost !== null) expect(entry.cost, entry.name).toBeGreaterThanOrEqual(0);
		}
	});

	it('erklärt die Kosten immer im Wortlaut', () => {
		for (const entry of SPELL_CATALOG) {
			expect(entry.costText.trim(), entry.name).not.toBe('');
		}
	});

	it('gibt jedem Zauber eine Wirkungsdauer', () => {
		for (const entry of SPELL_CATALOG) {
			expect(entry.duration.trim(), entry.name).not.toBe('');
		}
	});

	it('umfasst mindestens 40 geprüfte Zauber', () => {
		expect(SPELL_CATALOG.length).toBeGreaterThanOrEqual(40);
	});
});
