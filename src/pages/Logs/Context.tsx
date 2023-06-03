import { LogsData } from '@/@types/parseable/api/stream';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import { FC, ReactNode, createContext, useContext } from 'react';

const Context = createContext({});

const { Provider } = Context;

interface LogsPageContextState {
	subSelectedStream: SubData<string>;
	subLogStreamError: SubData<string | null>;
	subViewLog: SubData<LogsData[number] | null>;
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
	const subSelectedStream = useSubscribeState('');
	const subLogStreamError = useSubscribeState<string | null>(null);
	const subViewLog = useSubscribeState<LogsData[number] | null>(null);

	const state: LogsPageContextState = {
		subSelectedStream,
		subLogStreamError,
		subViewLog,
	};

	const methods: LogsPageContextMethods = {};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useLogsPageContext = () => useContext(Context) as LogsPageContextValue;

export default LogsPageProvider;
