import { store } from '@/store';
import { setAttribute, type AttributeKey } from '@/store/attributesSlice';
import { addRoll, clearHistory } from '@/store/rollSlice';
import { updateTalent } from '@/store/talentsSlice';
import type { Talent } from '@/store/talentsSlice';
import type { RollHistoryEntry } from '@/store/rollSlice';
import { toast } from 'sonner';
import { updateCombatStat, updateLifeStat, type CombatState } from '@/store/combatSlice';

export const importCharacter = async (file: File) => {
	try {
		const encodedText = await file.text();
		const json = decodeURIComponent(atob(encodedText));
		const data: {
			attributes: Record<AttributeKey, number>;
			talents: Pick<Talent, 'id' | 'value'>[];
			history: RollHistoryEntry[],
			combat: CombatState
		} = JSON.parse(json);

		const { attributes, talents, history, combat } = data;
		const dispatch = store.dispatch;

		//atrributes
		if (attributes !== undefined) {
			Object.entries(attributes).forEach(([key, value]) => {
				dispatch(setAttribute({ key: key as AttributeKey, value }));
			});
		}

		//talents
		if (talents !== undefined) {
			talents.forEach(({ id, value }) => dispatch(updateTalent({ id, value })));

		}
		//history
		if (history !== undefined) {
			dispatch(clearHistory());
			history.forEach((entry: RollHistoryEntry) => dispatch(addRoll(entry)));
		}
		//combat
		if (combat !== undefined) {
			if (combat.life) {
				const { current, max } = combat.life;
				if (typeof current === 'number') dispatch(updateLifeStat({ current }));
				if (typeof current === 'number') dispatch(updateLifeStat({ max }));

			}

			const combatKeys: (keyof CombatState)[] = ['attack', 'save', 'dodge', 'initiative', 'ranged'];
			combatKeys.forEach(combatKey => {
				const currentValue = combat[combatKey];
				if (typeof currentValue === 'number') {
					dispatch(updateCombatStat({ key: combatKey, value: currentValue }));
				}
			});
		}

		toast('Import erfolgreich ✅');
	} catch (e) {
		toast(`❌ Fehler beim Import (keine gültige JSON)', ${e}`);
	}
};