import { store } from '@/store';
import { setAttribute, ATTRIBUTE_KEYS } from '@/store/attributesSlice';
import { addRoll, clearHistory } from '@/store/rollSlice';
import { updateTalent } from '@/store/talentsSlice';
import { toast } from 'sonner';
import { updateCombatStat, type CombatStatKey, updateLifeStat } from '@/store/combatSlice';
import { sanitizeHistory } from '@/store/persistence';

const COMBAT_STAT_KEYS: CombatStatKey[] = ['attack', 'save', 'dodge', 'initiative', 'ranged'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

export const importCharacter = async (file: File) => {
	const dispatch = store.dispatch;
	try {
		const encodedText = await file.text();
		const json = decodeURIComponent(atob(encodedText));
		const data: unknown = JSON.parse(json);

		if (!isRecord(data)) throw new Error('Unerwartetes Dateiformat');

		if (typeof data.version === 'number' && data.version > 1) {
			toast.error(`Datei-Version ${data.version} wird von dieser App-Version nicht unterstützt`);
			return;
		}

		const { attributes, talents, history, combat } = data;

		if (isRecord(attributes)) {
			for (const key of ATTRIBUTE_KEYS) {
				const value = attributes[key];
				if (typeof value === 'number') dispatch(setAttribute({ key, value }));
			}
		}

		if (Array.isArray(talents)) {
			for (const entry of talents) {
				if (isRecord(entry) && typeof entry.id === 'string' && typeof entry.value === 'number') {
					dispatch(updateTalent({ id: entry.id, value: entry.value }));
				}
			}
		}

		if (history !== undefined) {
			dispatch(clearHistory());
			sanitizeHistory(history).forEach(entry => dispatch(addRoll(entry)));
		}

		if (isRecord(combat)) {
			if (isRecord(combat.life)) {
				const { current, max } = combat.life;
				if (typeof current === 'number') dispatch(updateLifeStat({ current }));
				if (typeof max === 'number') dispatch(updateLifeStat({ max }));
			}

			for (const key of COMBAT_STAT_KEYS) {
				const value = combat[key];
				if (typeof value === 'number') dispatch(updateCombatStat({ key, value }));
			}
		}

		toast.success('Import erfolgreich');
	} catch (e) {
		toast.error(`Fehler beim Import (keine gültige Charakterdatei): ${e}`);
	}
};
