import { store } from '@/store';
import { toPersisted } from '@/store/persistence';
import { initialSpellbookState } from '@/store/spellbookSlice';

/** Charaktername als Dateiname, auf Zeichen reduziert, die jedes Dateisystem verträgt. */
const fileNameFor = (name: string): string => {
	const slug = name.trim().toLowerCase()
		.replace(/[äöüß]/g, match => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[match] ?? match)
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${slug || 'charakter'}.dsa`;
};

export const exportCharacter = () => {
	const { profile, attributes, talents, combat, roll, settings } = store.getState();
	// Der Reducer für `spellbook` wird erst in Task 4 in den Store eingehängt —
	// bis dahin exportiert diese Funktion ein leeres Zauberbuch.
	const snapshot = toPersisted({ profile, attributes, talents, combat, spellbook: initialSpellbookState, roll, settings });

	// `toPersisted` trägt die Version schon — Datei und localStorage teilen ein Format.
	const payload = JSON.stringify(snapshot, null, 2);
	const blob = new Blob([btoa(encodeURIComponent(payload))], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = fileNameFor(profile.name);
	document.body.appendChild(link);
	link.click();
	link.remove();

	// Erst freigeben, wenn der Download angestoßen ist — sofortiges revoke bricht
	// den Download in manchen Browsern ab.
	setTimeout(() => URL.revokeObjectURL(url), 0);
};
