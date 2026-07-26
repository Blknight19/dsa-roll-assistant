import { cancelPendingSave } from '@/store';
import { clearPersistedState } from '@/store/persistence';

export const resetLocalStorage = () => {
	// Erst den ausstehenden Save verwerfen: sonst kann er zwischen Löschen und
	// Reload feuern und den gerade gelöschten Zustand zurückschreiben.
	cancelPendingSave();
	clearPersistedState();
	location.reload();
};
