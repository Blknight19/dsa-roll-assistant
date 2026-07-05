import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SettingsState = {
	/** Krit/Patzer im Kampf per Bestätigungswurf prüfen (DSA-5-Grundregel). */
	confirmCriticals: boolean;
};

export const initialSettingsState: SettingsState = {
	confirmCriticals: true
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState: initialSettingsState,
	reducers: {
		setConfirmCriticals: (state, action: PayloadAction<boolean>) => {
			state.confirmCriticals = action.payload;
		}
	}
});

export const { setConfirmCriticals } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
