import { describe, expect, it } from 'vitest';
import { ATTRIBUTE_KEYS } from '@/store/attributesSlice';
import { canSustain } from '@/utils/rules';
import { SPELL_CATALOG } from './index';

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

	it('umfasst den vollständigen Bestand aus Zaubern, Ritualen und Hexenflüchen', () => {
		expect(SPELL_CATALOG).toHaveLength(348);
	});

	it('führt jeden Eintrag unter einer der drei würfelbaren Klassen', () => {
		for (const entry of SPELL_CATALOG) {
			expect(['zauber', 'ritual', 'hexenfluch'], entry.name).toContain(entry.klasse);
		}
	});

	it('nennt für jeden Zauber und jedes Ritual eine Verbreitung', () => {
		// Hexenflüche führen keine: sie stehen ausschließlich Hexen offen.
		for (const entry of SPELL_CATALOG) {
			if (entry.klasse === 'hexenfluch') continue;
			expect(entry.verbreitung, entry.name).not.toHaveLength(0);
		}
	});

	it('lässt genau die „aufrechterhaltend"-Zauber aufrechterhalten', () => {
		// Gegen die echten Daten geprüft, nicht nach Augenmaß: die Vorgängerfassung
		// schloss nur „sofort" aus und erlaubte damit auch jeden Zauber mit fester
		// Wirkungsdauer („QS x 3 Minuten", …) – der hätte fälschlich −1 gekostet.
		const sustainable = SPELL_CATALOG.filter(entry => canSustain(entry.duration));
		const declared = SPELL_CATALOG.filter(entry => entry.duration === 'aufrechterhaltend');

		expect(sustainable.map(entry => entry.id)).toEqual(declared.map(entry => entry.id));
		expect(sustainable).toHaveLength(45);
	});

	it('trägt probeNote nur als bekannten Hinweis', () => {
		const bekannt = [
			'modifiziert durch SK',
			'modifiziert durch ZK',
			'modifiziert durch SK oder ZK, je nachdem, welcher Wert höher ist',
			'modifiziert durch SK modifiziert die Probe nur bei einem unfreiwilligen Ziel'
		];
		const notes = SPELL_CATALOG.map(entry => entry.probeNote).filter(Boolean);
		expect(notes.length).toBeGreaterThan(0);
		for (const note of notes) {
			expect(bekannt).toContain(note);
		}
	});
});
