import { store } from '@/store';

export const exportCharacter = () => {
	const state = store.getState();

	const exportObject = {
		version: 1,
		attributes: state.attributes,
		talents: state.talents.talents.map(({ id, value }) => ({ id, value })),
		history: state.roll.history
	};

	const jsonString = JSON.stringify(exportObject, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = 'charakter.json';
	link.click();

	URL.revokeObjectURL(url);
};