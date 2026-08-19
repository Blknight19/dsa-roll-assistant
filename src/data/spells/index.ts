import { HEXENFLUESCHE } from './hexenfluesche';
import { RITUALE } from './rituale';
import type { SpellCatalogEntry } from './types';
import { ZAUBER } from './zauber';

export type { SpellCatalogEntry, SpellClass } from './types';

/**
 * Der vollständige Katalog, alphabetisch. Zauber, Rituale und Hexenflüche stehen
 * gemeinsam darin – die Klasse trennt sie nur für den Filter der Suche.
 */
export const SPELL_CATALOG: SpellCatalogEntry[] = [...ZAUBER, ...RITUALE, ...HEXENFLUESCHE].sort(
	(a, b) => a.name.localeCompare(b.name, 'de')
);

/** Traditionen, die im Katalog vorkommen – Grundlage des Verbreitungsfilters. */
export const VERBREITUNGEN = [
	...new Set(SPELL_CATALOG.flatMap(eintrag => eintrag.verbreitung ?? []))
].sort((a, b) => a.localeCompare(b, 'de'));

/** Merkmale, die im Katalog vorkommen. */
export const MERKMALE = [...new Set(SPELL_CATALOG.map(eintrag => eintrag.merkmal))].sort((a, b) =>
	a.localeCompare(b, 'de')
);
