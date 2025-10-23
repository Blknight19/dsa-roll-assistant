import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AttributeKey } from './attributesSlice';

type Talent = {
	id: string;
	name: string;
	attribute1: AttributeKey;
	attribute2: AttributeKey;
	attribute3: AttributeKey;
	value: number;
}

type TalentState = {
	talents: Talent[]
}


const initialState: TalentState = {
	talents: [
		{ id: '1', name: 'Klettern', attribute1: 'GE', attribute2: 'FF', attribute3: 'KO', value: 0 },
		{ id: '2', name: 'Sinnesschärfe', attribute1: 'MU', attribute2: 'KL', attribute3: 'IN', value: 0 }
	]
};

const talentSlice = createSlice({
	name: 'talents',
	initialState,
	reducers: {
		// Falls "Hinzufügen" und "Entfernen" relevant werden
		// addTalent: {
		// 	reducer: (state, action: PayloadAction<Talent>) => {
		// 		state.talents.push(action.payload);
		// 	},
		// 	prepare: (name: string, attribute1: AttributeKey, attribute2: AttributeKey, attribute3: AttributeKey, value: number) => ({
		// 		payload: { id: nanoid(), name, attribute1, attribute2, attribute3, value }
		// 	})
		// },
		// removeTalent: (state, action: PayloadAction<string>) => {
		// 	state.talents = state.talents.filter(talent => talent.id !== action.payload);
		// },
		updateTalent: (state, action: PayloadAction<{ id: string, value: number }>) => {
			const index = state.talents.findIndex(talent => talent.id === action.payload.id);
			if (index !== -1) {
				state.talents[index].value = action.payload.value;
			}
		}
	}
});

// export const { addTalent, removeTalent, updateTalent } = talentSlice.actions;
export const { updateTalent } = talentSlice.actions;
export const talentReducer = talentSlice.reducer; 