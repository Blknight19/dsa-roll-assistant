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
		id: 'adlerschwinge',
		name: 'Adlerschwinge',
		attributes: ['MU', 'IN', 'GE'],
		cost: null,
		costText: '8 AsP (Aktivierung des Zaubers) + 4 AsP pro Stunde',
		castTime: '8 Aktionen',
		range: 'selbst',
		duration: 'aufrechterhaltend',
		target: 'Kulturschaffende',
		merkmal: 'Verwandlung'
	},
	{
		id: 'analys-arkanstruktur',
		name: 'Analys Arkanstruktur',
		attributes: ['KL', 'KL', 'IN'],
		cost: 16,
		costText: '16 AsP',
		castTime: '32 Aktionen',
		range: 'Berührung',
		duration: 'sofort',
		target: 'Objekte, Wesen',
		merkmal: 'Hellsicht'
	},
	{
		id: 'armatrutz',
		name: 'Armatrutz',
		attributes: ['KL', 'IN', 'FF'],
		cost: null,
		costText: '4 AsP für RS 1, 8 AsP für RS 2, 16 AsP für RS 3 (nicht modifizierbar)',
		castTime: '1 Aktion',
		range: 'selbst',
		duration: 'QS x 3 Minuten',
		target: 'Wesen',
		merkmal: 'Heilung'
	},
	{
		id: 'axxeleratus',
		name: 'Axxeleratus',
		attributes: ['KL', 'IN', 'FF'],
		cost: 8,
		costText: '8 AsP',
		castTime: '1 Aktion',
		range: 'Berührung',
		duration: 'QS x 5 Kampfrunden',
		target: 'Lebewesen',
		merkmal: 'Heilung'
	},
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
		id: 'bannbaladin',
		name: 'Bannbaladin',
		attributes: ['MU', 'IN', 'CH'],
		probeNote: 'modifiziert durch SK',
		cost: 8,
		costText: '8 AsP',
		castTime: '4 Aktionen',
		range: '4 Schritt',
		duration: 'QS x 3 Minuten',
		target: 'Kulturschaffende, übernatürliche Wesen',
		merkmal: 'Einfluss'
	},
	{
		id: 'blitz-dich-find',
		name: 'Blitz dich find',
		attributes: ['MU', 'IN', 'CH'],
		probeNote: 'modifiziert durch SK',
		cost: 4,
		costText: '4 AsP',
		castTime: '1 Aktion',
		range: '8 Schritt',
		duration: 'QS KR',
		target: 'Lebewesen',
		merkmal: 'Einfluss'
	},
	{
		id: 'corpofesso',
		name: 'Corpofesso',
		attributes: ['KL', 'IN', 'KO'],
		probeNote: 'modifiziert durch ZK',
		cost: 8,
		costText: '8 AsP',
		castTime: '2 Aktionen',
		range: '8 Schritt',
		duration: 'QS x 3 in KR',
		target: 'Lebewesen',
		merkmal: 'Verwandlung'
	},
	{
		id: 'duplicatus',
		name: 'Duplicatus',
		attributes: ['KL', 'IN', 'CH'],
		cost: null,
		costText: '4 AsP pro Doppelgänger (bei Misslingen entsprechend 2 AsP)',
		castTime: '2 Aktionen',
		range: 'Berührung',
		duration: 'QS x 3 Kampfrunden',
		target: 'Lebewesen',
		merkmal: 'Illusion'
	},
	{
		id: 'falkenauge',
		name: 'Falkenauge',
		attributes: ['MU', 'KL', 'IN'],
		cost: 4,
		costText: '4 AsP',
		castTime: '2 Aktionen',
		range: 'Berührung',
		duration: 'Bis zum nächsten Schuss, maximal QS x 2 Kampfrunden',
		target: 'Lebewesen',
		merkmal: 'Hellsicht'
	},
	{
		id: 'flim-flam',
		name: 'Flim Flam',
		attributes: ['MU', 'KL', 'CH'],
		cost: null,
		costText: '2 AsP (Aktivierung des Zaubers) + 1 AsP pro Stunde',
		castTime: '1 Aktion',
		range: '8 Schritt',
		duration: 'aufrechterhaltend',
		target: 'Zone',
		merkmal: 'Elementar'
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
		id: 'gardianum',
		name: 'Gardianum',
		attributes: ['MU', 'KL', 'CH'],
		cost: null,
		costText: 'mindestens 4 AsP (nicht modifizierbar)',
		castTime: '1 Aktion',
		range: 'selbst',
		duration: '5 Minuten',
		target: 'Zone',
		merkmal: 'Antimagie'
	},
	{
		id: 'grosse-gier',
		name: 'Große Gier',
		attributes: ['MU', 'IN', 'CH'],
		probeNote: 'modifiziert durch SK',
		cost: 8,
		costText: '8 AsP',
		castTime: '2 Aktionen',
		range: 'Berührung (Reichweite nicht modifizierbar)',
		duration: 'QS x 15 Minuten',
		target: 'Lebewesen',
		merkmal: 'Einfluss'
	},
	{
		id: 'harmlose-gestalt',
		name: 'Harmlose Gestalt',
		attributes: ['KL', 'IN', 'CH'],
		cost: null,
		costText: '8 AsP (Aktivierung) + 4 AsP pro 5 Minuten',
		castTime: '4 Aktionen',
		range: 'selbst',
		duration: 'aufrechterhaltend',
		target: 'Wesen',
		merkmal: 'Illusion'
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
