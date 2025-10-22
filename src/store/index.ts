import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { attributeReducer } from './attributesSlice';
import { rollReducer } from './rollSlice';
import { talentReducer } from './talentsSlice';

const loadState = () => {
	try {
		const serializedState = localStorage.getItem('dsa-app-state');
		if (!serializedState) return undefined;
		return JSON.parse(serializedState);
	} catch (error) {
		console.warn('⚠️ Failed to load state from localStorage:', error);
		return undefined;
	}
};

const rootReducer = combineReducers({
	roll: rollReducer,
	talents: talentReducer,
	attributes: attributeReducer
});

export const store = configureStore({
	reducer: rootReducer,
	preloadedState: loadState()
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const saveState = (state: RootState) => {
	try {
		const serializedState = JSON.stringify({
			roll: state.roll,
			talents: state.talents,
			attributes: state.attributes
			// ➕ später z. B.:
			// talents: state.talents,
			// settings: state.settings,
		});
		localStorage.setItem('dsa-app-state', serializedState);
	} catch (error) {
		console.warn('⚠️ Failed to save state to localStorage:', error);
	}
};

store.subscribe(() => {
	saveState(store.getState());
});
