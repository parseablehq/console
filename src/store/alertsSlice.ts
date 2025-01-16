import { createSlice } from '@reduxjs/toolkit';

const alertsSlice = createSlice({
	name: 'alerts',
	initialState: {
		alertsList: [{}],
	},
	reducers: {
		pushAlert(state, action) {
			state.alertsList.push(action.payload);
		},
	},
});

export const { pushAlert } = alertsSlice.actions;
export const alertsReducer = alertsSlice.reducer;
