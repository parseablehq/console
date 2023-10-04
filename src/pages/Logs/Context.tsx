import type { Log } from '@/@types/parseable/api/query';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import type { FC } from 'react';
import { ReactNode, createContext, useContext } from 'react';

const Context = createContext({});

const { Provider } = Context;

export const LOG_QUERY_LIMITS = [30, 50, 100, 150, 200];

type GapTime = {
	startTime: Date;
	endTime: Date;
	id: number;
};

interface LogsPageContextState {
	subLogStreamError: SubData<string | null>;
	subViewLog: SubData<Log | null>;
	subGapTime: SubData<GapTime | null>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LogsPageContextMethods {}

interface LogsPageContextValue {
	state: LogsPageContextState;
	methods: LogsPageContextMethods;
}

interface LogsPageProviderProps {
	children: ReactNode;
}

const LogsPageProvider: FC<LogsPageProviderProps> = ({ children }) => {
	const subLogStreamError = useSubscribeState<string | null>(null);
	const subViewLog = useSubscribeState<Log | null>(null);
	const subGapTime = useSubscribeState<GapTime | null>(null);

	const state: LogsPageContextState = {
		subLogStreamError,
		subViewLog,
		subGapTime,
	};

	const methods: LogsPageContextMethods = {};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useLogsPageContext = () => useContext(Context) as LogsPageContextValue;

export default LogsPageProvider;
