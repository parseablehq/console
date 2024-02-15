import type { Log } from '@/@types/parseable/api/query';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import type { Dispatch, FC, SetStateAction } from 'react';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { sanitizeCSVData } from '@/utils/exportHelpers';

const Context = createContext({});

const { Provider } = Context;

export const LOG_QUERY_LIMITS = [30, 50, 100, 150, 200];
export const LOAD_LIMIT = 9000;

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
	subSchemaToggle: SubData<boolean>;
	pageOffset: number;
	custQuerySearchState: CustQuerySearchState;
}

type LogQueryData = {
	rawData: Log[];
	filteredData: Log[];
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LogsPageContextMethods {
	makeExportData: (type: string) => Log[];
	toggleShowQueryEditor: () => void;
	resetQuerySearch: () => void;
	setPageOffset: Dispatch<SetStateAction<number>>;
	setCustSearchQuery: (query: string, mode: custQuerySearchMode) => void;
}

interface LogsPageContextValue {
	state: LogsPageContextState;
	methods: LogsPageContextMethods;
}

interface LogsPageProviderProps {
	children: ReactNode;
}

type custQuerySearchMode = null | 'sql' | 'filters' 

type CustQuerySearchState = {
	showQueryEditor: boolean;
	isQuerySearchActive: boolean;
	custSearchQuery: string;
	mode: custQuerySearchMode;
};

export const defaultQueryResult = '';

const defaultCustQuerySearchState = { showQueryEditor: false, isQuerySearchActive: false, custSearchQuery: '', mode: null };

const LogsPageProvider: FC<LogsPageProviderProps> = ({ children }) => {
	const subLogStreamError = useSubscribeState<string | null>(null);
	const subViewLog = useSubscribeState<Log | null>(null);
	const subGapTime = useSubscribeState<GapTime | null>(null);
	const subLogQueryData = useSubscribeState<LogQueryData>({
		rawData: [],
		filteredData: [],
	});
	const subLogStreamSchema = useSubscribeState<LogStreamSchemaData | null>(null);
	const subSchemaToggle = useSubscribeState<boolean>(false);
	const [pageOffset, setPageOffset] = useState<number>(0);
	const [custQuerySearchState, setCustQuerySearchState] = useState<CustQuerySearchState>(defaultCustQuerySearchState);
	
	// state
	const state: LogsPageContextState = {
		subLogStreamError,
		subViewLog,
		subGapTime,
		subLogQueryData,
		subLogStreamSchema,
		subSchemaToggle,
		custQuerySearchState,
		pageOffset,
	};

	// getters & setters
	const toggleShowQueryEditor = useCallback(() => {
		setCustQuerySearchState((prev) => ({ ...prev, showQueryEditor: !prev.showQueryEditor }));
	}, []);

	const resetQuerySearch = useCallback(() => {
		setCustQuerySearchState(defaultCustQuerySearchState);
		// setPageOffset(0); wont the LogTable handle this ?
	}, []);

	const setCustSearchQuery = useCallback((query: string, mode: custQuerySearchMode) => {
		setCustQuerySearchState((prev) => ({ ...prev, mode, custSearchQuery: query, isQuerySearchActive: true, showQueryEditor: false}));
	}, [])

	// handlers
	const makeExportData = useCallback((type: string): Log[] => {
		const { rawData, filteredData: _filteredData } = subLogQueryData.get(); // filteredData - records filtered with in-page search
		if (type === 'JSON') {
			return rawData;
		} else if (type === 'CSV') {
			const fields = subLogStreamSchema.get()?.fields;
			const headers = !custQuerySearchState.isQuerySearchActive
				? Array.isArray(fields)
					? fields.map((field) => field.name)
					: []
				: typeof rawData[0] === 'object'
				? Object.keys(rawData[0])
				: [];

			const sanitizedCSVData = sanitizeCSVData(rawData, headers);
			return [headers, ...sanitizedCSVData];
		} else {
			return [];
		}
	}, [custQuerySearchState.isQuerySearchActive]);

	const methods = {
		makeExportData,
		toggleShowQueryEditor,
		resetQuerySearch,
		setPageOffset,
		setCustSearchQuery,
	};

	const value = useMemo(() => ({ state, methods }), [state, methods]);

	return <Provider value={value}>{children}</Provider>;
};

export const useLogsPageContext = () => useContext(Context) as LogsPageContextValue;

export default LogsPageProvider;
