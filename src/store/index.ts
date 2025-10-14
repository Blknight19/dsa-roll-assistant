import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { rollReducer } from './rollSlice';

const loadState = () => {
	try {
		const serilizedState = localStorage.getItem('dsa-app-state');
		if (!serilizedState) return undefined;
		return JSON.parse(serilizedState);
	} catch (error) {
		console.warn('⚠️ Failed to load state from localStorage:', error);
		return undefined;
	}
};

const rootReducer = combineReducers({
	roll: rollReducer
});

export const store = configureStore({
	reducer: rootReducer,
	preloadedState: loadState()
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const saveState = (state: RootState) => {
	try {
		const serilizedState = JSON.stringify({
			roll: state.roll
			// ➕ später z. B.:
			// talents: state.talents,
			// settings: state.settings,
		});
		localStorage.setItem('dsa-app-state', serilizedState);
	} catch (error) {
		console.warn('⚠️ Failed to save state to localStorage:', error);
	}
};

store.subscribe(() => {
	saveState(store.getState());
});
