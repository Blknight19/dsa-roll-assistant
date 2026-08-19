/**
 * Stellen, an denen die Quelle von den zuvor von Hand gepflegten Werten abweicht.
 * Vorrang hat hier der gepflegte Wert, weil er aus dem Regelwerk stammt und die Quelle
 * eine Fan-Aufbereitung ohne Gewähr ist. Jede Zeile nennt die Seite zum Nachschlagen —
 * wer sie prüft, streicht den Eintrag oder dreht ihn um.
 */
export const KORREKTUREN = {
	corpofesso: {
		grund: 'Regelwerk S. 289: Quelle nennt 16 AsP und QS x 2, gepflegt waren 8 AsP und QS x 3',
		felder: { cost: 8, costText: '8 AsP', duration: 'QS x 3 in KR' }
	},
	invercano: {
		grund: 'Aventurische Magie S. 134: Quelle nennt 2 Aktionen und QS x 2, gepflegt war 1 Aktion und QS',
		felder: { castTime: '1 Aktion', duration: 'QS KR' }
	},
	paralysis: {
		grund: 'Regelwerk S. 296: Quelle nennt QS x 2 Minuten, gepflegt war QS x 3 in Minuten',
		felder: { duration: 'QS x 3 in Minuten' }
	},
	somnigravis: {
		grund: 'Regelwerk S. 298: Quelle nennt 8 Aktionen, gepflegt waren 2 Aktionen',
		felder: { castTime: '2 Aktionen' }
	}
};
