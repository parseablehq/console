import type { Log } from '@/@types/parseable/api/query';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import type { FC } from 'react';
import { ReactNode, createContext, useContext } from 'react';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { sanitizeCSVData } from '@/utils/exportHelpers';

const Context = createContext({});

const { Provider } = Context;

export const LOG_QUERY_LIMITS = [30, 50, 100, 150, 200];

type GapTime = {
	startTime: Date;
	endTime: Date;
	id: number | null;
};

interface LogsPageContextState {
	subLogStreamError: SubData<string | null>;
	subViewLog: SubData<Log | null>;
	subGapTime: SubData<GapTime | null>;
	subLogQueryData: SubData<LogQueryData>;
	subLogStreamSchema: SubData<LogStreamSchemaData | null>;
}

type LogQueryData = {
	rawData: Log[] | [],
	filteredData: Log[] | []
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LogsPageContextMethods {
	makeExportData: (type: string) => Log[];
}

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
	const subLogQueryData = useSubscribeState<LogQueryData>({
		rawData: [],
		filteredData: [],
	});
	const subLogStreamSchema = useSubscribeState<LogStreamSchemaData | null>(null);

	const state: LogsPageContextState = {
		subLogStreamError,
		subViewLog,
		subGapTime,
		subLogQueryData,
		subLogStreamSchema
	};

	const makeExportData = (type: string): Log[] => {
		const { rawData, filteredData: _filteredData } = subLogQueryData.get(); // filteredData - records filtered with in-page search
		if (type === 'JSON') {
			return rawData
		} else if (type === 'CSV') {
			const fields = subLogStreamSchema.get()?.fields
			const headers = Array.isArray(fields) ? fields.map(field => field.name) : []
			const sanitizedCSVData = sanitizeCSVData(rawData, headers)
			return [headers, ...sanitizedCSVData]
		} else {
			return []
		}
	}

	const methods: LogsPageContextMethods = { makeExportData };
	
	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useLogsPageContext = () => useContext(Context) as LogsPageContextValue;

export default LogsPageProvider;
