/**
 * Erzeugt die Katalogdateien unter src/data/spells aus der Zaubertabelle von
 * f-space.de. Aufruf: `node scripts/import-spells`.
 *
 * Die Quelle ist eine JS-Datei mit einer Objektliste. Sie wird geparst, nie
 * ausgeführt – ein Skript aus fremder Hand darf beim Bauen keinen Code beisteuern.
 * Übernommen werden ausschließlich Werteangaben; Wirkungstexte, Zaubererweiterungen
 * und Publikationsangaben des Regelwerks bleiben draußen.
 */
import { writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import JSON5 from 'json5';
import { KORREKTUREN } from './korrekturen.mjs';
import { KLASSEN, applyKorrektur, renderModule, toCatalogEntry } from './parse.mjs';

const QUELLE = 'https://www.f-space.de/dsa5/tools/spells/spells-data.js';
const ZIEL = 'src/data/spells';

/** Ein Export je Klasse – die Dateien bleiben so klein genug, um sie zu lesen. */
const DATEIEN = {
	zauber: { datei: 'zauber.ts', exportName: 'ZAUBER' },
	ritual: { datei: 'rituale.ts', exportName: 'RITUALE' },
	hexenfluch: { datei: 'hexenfluesche.ts', exportName: 'HEXENFLUESCHE' }
};

/** Schneidet die Objektliste aus der Zuweisung `var DATA_RAW = [...]`. */
const arrayLiteral = text => text.slice(text.indexOf('= [') + 2, text.lastIndexOf(']') + 1);

const ladeQuelle = async () => {
	const antwort = await fetch(QUELLE);
	if (!antwort.ok) throw new Error(`${QUELLE} antwortet mit ${antwort.status}`);
	return antwort.text();
};

const eintraege = new Map();
const abgelehnt = [];

const roh = JSON5.parse(arrayLiteral(await ladeQuelle()));
for (const datensatz of roh) {
	const klasse = Object.hasOwn(datensatz, 'Klasse') ? datensatz.Klasse : undefined;
	if (!KLASSEN.includes(klasse)) continue;

	try {
		const eintrag = applyKorrektur(toCatalogEntry(datensatz), KORREKTUREN);
		const bekannt = eintraege.get(eintrag.id);
		if (bekannt !== undefined) throw new Error(`id ${eintrag.id} doppelt (${bekannt.name})`);
		eintraege.set(eintrag.id, eintrag);
	} catch (ursache) {
		abgelehnt.push(`${datensatz.Name ?? '?'}: ${ursache.message}`);
	}
}

for (const zeile of abgelehnt) console.error(`abgelehnt – ${zeile}`);

const unbenutzt = Object.keys(KORREKTUREN).filter(id => !eintraege.has(id));
if (unbenutzt.length > 0) {
	throw new Error(`Korrekturen ohne Eintrag: ${unbenutzt.join(', ')}`);
}

if (argv.includes('--dry-run')) {
	console.log(`${eintraege.size} Einträge gelesen, ${abgelehnt.length} abgelehnt (dry run)`);
} else {
	for (const [klasse, { datei, exportName }] of Object.entries(DATEIEN)) {
		const gruppe = [...eintraege.values()]
			.filter(eintrag => eintrag.klasse === klasse)
			.sort((a, b) => a.id.localeCompare(b.id, 'de'));
		writeFileSync(`${ZIEL}/${datei}`, renderModule(exportName, gruppe), 'utf8');
		console.log(`${datei}: ${gruppe.length} Einträge`);
	}
}

if (abgelehnt.length > 0) {
	throw new Error(`${abgelehnt.length} Einträge abgelehnt – siehe Meldungen oben`);
}
