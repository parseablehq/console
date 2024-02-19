import type { Dispatch, FC, SetStateAction } from 'react';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

const Context = createContext({});

const { Provider } = Context;

interface StatsPageProvider {
	children: ReactNode;
} 

interface LogsPageContextValue {
	state: StatsPageContextState;
	methods: StatsPageContextMethods;
}

type StatsPageContextState = {
	fetchStartTime: Dayjs;
	statusFixedDurations: number;
}

type StatsPageContextMethods = {
	resetFetchStartTime: () => void;
	setStatusFixedDurations: Dispatch<SetStateAction<number>>;
}

const StatsPageProvider: FC<StatsPageProvider> = ({ children }) => {
	const [fetchStartTime, setFetchStartTime] = useState<Dayjs>(dayjs());
	const [statusFixedDurations, setStatusFixedDurations] = useState<number>(0);

	const resetFetchStartTime = useCallback(() => {
		setFetchStartTime(dayjs())
	}, [])

	const state: StatsPageContextState = {
		fetchStartTime,
		statusFixedDurations
	};

	const methods: StatsPageContextMethods = {
		resetFetchStartTime,
		setStatusFixedDurations
	}

	const value = useMemo(() => ({ state, methods }), [state, methods]);

	return <Provider value={value}>{children}</Provider>;
};

export const useStatsPageContext = () => useContext(Context) as LogsPageContextValue;

export default StatsPageProvider;
