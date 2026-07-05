import { clearPersistedState } from '@/store/persistence';

export const resetLocalStorage = () => {
	clearPersistedState();
	location.reload();
};
