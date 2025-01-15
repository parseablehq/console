import { configureStore } from '@reduxjs/toolkit';
import { alertsReducer, pushAlert } from './alertsSlice';

export const store = configureStore({
	reducer: {
		alerts: alertsReducer,
	},
});

export { pushAlert };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
