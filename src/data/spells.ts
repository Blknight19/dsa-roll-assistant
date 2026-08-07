import type { AttributeKey } from '@/store/attributesSlice';

/**
 * Regelwissen, nicht Charakterdaten: unveränderlich, nicht persistiert, nicht
 * exportiert. Beim Übernehmen ins Zauberbuch wird ein Eintrag kopiert — der Spieler
 * darf danach alles überschreiben, und eine .dsa-Datei bleibt lesbar, auch wenn sich
 * dieser Katalog später ändert.
 */
export type SpellCatalogEntry = {
	id: string;
	name: string;
	attributes: [AttributeKey, AttributeKey, AttributeKey];
	/** Zusatz zur Probe, z. B. „modifiziert durch ZK". Reine Anzeige. */
	probeNote?: string;
	/** Kosten als Zahl — null, wenn das Regelwerk eine Formel angibt. */
	cost: number | null;
	/** Kostenangabe im Wortlaut. Bleibt im Zauberbuch als Erinnerung stehen. */
	costText: string;
	castTime: string;
	range: string;
	/** „sofort" schließt das Aufrechterhalten aus. */
	duration: string;
	target: string;
	merkmal: string;
};

export const SPELL_CATALOG: SpellCatalogEntry[] = [
	{
		id: 'balsam-salabunde',
		name: 'Balsam Salabunde',
		attributes: ['KL', 'IN', 'FF'],
		cost: null,
		costText: '1 AsP pro LeP, mindestens 4 AsP (nicht modifizierbar)',
		castTime: '16 Aktionen',
		range: 'Berührung',
		duration: 'sofort',
		target: 'Kulturschaffende',
		merkmal: 'Heilung'
	},
	{
		id: 'fulminictus',
		name: 'Fulminictus',
		attributes: ['KL', 'IN', 'KO'],
		probeNote: 'modifiziert durch ZK',
		cost: 8,
		costText: '8 AsP (nicht modifizierbar)',
		castTime: '1 Aktion',
		range: '8 Schritt',
		duration: 'sofort',
		target: 'Lebewesen',
		merkmal: 'Verwandlung'
	},
	{
		id: 'odem-arcanum',
		name: 'Odem Arcanum',
		attributes: ['KL', 'IN', 'IN'],
		cost: 4,
		costText: '4 AsP',
		castTime: '2 Aktionen',
		range: '8 Schritt',
		duration: '1 Minute',
		target: 'Objekte, Wesen',
		merkmal: 'Hellsicht'
	}
];
