import { store } from '@/store';
import { setAttribute, type AttributeKey } from '@/store/attributesSlice';
import { addRoll, clearHistory } from '@/store/rollSlice';
import { updateTalent } from '@/store/talentsSlice';
import type { Talent } from '@/store/talentsSlice';
import type { RollHistoryEntry } from '@/store/rollSlice';
import { toast } from 'sonner';

export const importCharacter = async (file: File) => {
	try {
		const json = await file.text();
		const data: {
			attributes: Record<AttributeKey, number>;
			talents: Pick<Talent, 'id' | 'value'>[];
			history: RollHistoryEntry[]
		} = JSON.parse(json);

		const dispatch = store.dispatch;

		//atrributes
		Object.entries(data.attributes).forEach(([key, value]) => {
			dispatch(setAttribute({ key: key as AttributeKey, value }));
		});
		//talents
		data.talents.forEach(({ id, value }) => dispatch(updateTalent({ id, value })));
		//history
		dispatch(clearHistory());
		data.history.forEach((entry: RollHistoryEntry) => dispatch(addRoll(entry)));
		toast('Import erfolgreich ✅');
	} catch (e) {
		toast(`❌ Fehler beim Import (keine gültige JSON)', ${e}`);
	}
};