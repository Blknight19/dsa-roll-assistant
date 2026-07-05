import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { attributeReducer } from './attributesSlice';
import { rollReducer } from './rollSlice';
import { talentReducer } from './talentsSlice';
import { combatReducer } from './combatSlice';
import { settingsReducer } from './settingsSlice';
import { probeReducer } from './probeSlice';
import { loadState, saveState } from './persistence';

const rootReducer = combineReducers({
	roll: rollReducer,
	talents: talentReducer,
	attributes: attributeReducer,
	combat: combatReducer,
	settings: settingsReducer,
	probe: probeReducer
});

export const store = configureStore({
	reducer: rootReducer,
	preloadedState: loadState()
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const SAVE_DEBOUNCE_MS = 500;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

store.subscribe(() => {
	clearTimeout(saveTimer);
	saveTimer = setTimeout(() => saveState(store.getState()), SAVE_DEBOUNCE_MS);
});
