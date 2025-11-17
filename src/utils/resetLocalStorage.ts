import { store } from '@/store';
import { setIsLoading } from '@/store/loadingSlice';

export const resetLocalStorage = () => {
	const dispatch = store.dispatch;
	dispatch(setIsLoading(true));

	setTimeout(() => {
		localStorage.removeItem('dsa-app-state');
		location.reload();
	}, 300);
};