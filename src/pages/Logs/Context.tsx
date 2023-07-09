import type { LogsQuery, LogsSearch, Log } from '@/@types/parseable/api/query';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { ReactNode, createContext, useContext } from 'react';

const Context = createContext({});

const { Provider } = Context;

const now = dayjs();

export const LOG_QUERY_LIMITS = [30, 50, 100, 150, 200];
export const REFRESH_INTERVALS = [1000, 2000, 5000, 10000, 20000, 60000];
export const FIXED_DURATIONS = [
	{
		name: 'Past 10 Minutes',
		milliseconds: dayjs.duration({ minutes: 10 }).asMilliseconds(),
	},
	{
		name: 'Past 1 Hour',
		milliseconds: dayjs.duration({ hours: 1 }).asMilliseconds(),
	},
	{
		name: 'Past 5 Hours',
		milliseconds: dayjs.duration({ hours: 5 }).asMilliseconds(),
	},
	{
		name: 'Past 24 Hours',
		milliseconds: dayjs.duration({ days: 1 }).asMilliseconds(),
	},
	{
		name: 'Past 3 Days',
		milliseconds: dayjs.duration({ days: 3 }).asMilliseconds(),
	},
	{
		name: 'Past 7 Days',
		milliseconds: dayjs.duration({ days: 7 }).asMilliseconds(),
	},
	{
		name: 'Past 2 Months',
		milliseconds: dayjs.duration({ months: 2 }).asMilliseconds(),
	},
] as const;

export const DEFAULT_FIXED_DURATIONS = FIXED_DURATIONS[0];

export const SEARCH_TYPES = ['TEXT', 'SQL'] as const;

export type SearchTypes = (typeof SEARCH_TYPES)[number];

interface LogsPageContextState {
	subLogStreamError: SubData<string | null>;
	subViewLog: SubData<Log | null>;
	subLogQuery: SubData<LogsQuery>;
	subLogSearch: SubData<LogsSearch>;
	subRefreshInterval: SubData<number | null>;
	subLogSelectedTimeRange: SubData<string>;
	subLogSearchType: SubData<SearchTypes>;
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
	const subLogQuery = useSubscribeState<LogsQuery>({
		startTime: now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate(),
		endTime: now.toDate(),
		streamName: '',
	});
	const subLogSearch = useSubscribeState<LogsSearch>({
		search: '',
		filters: {},
	});
	const subLogSelectedTimeRange = useSubscribeState<string>(DEFAULT_FIXED_DURATIONS.name);
	const subLogSearchType = useSubscribeState<SearchTypes>(SEARCH_TYPES[0]);
	const subLogStreamError = useSubscribeState<string | null>(null);
	const subRefreshInterval = useSubscribeState<number | null>(null);
	const subViewLog = useSubscribeState<Log | null>(null);

	const state: LogsPageContextState = {
		subLogStreamError,
		subViewLog,
		subLogQuery,
		subLogSearch,
		subRefreshInterval,
		subLogSelectedTimeRange,
		subLogSearchType,
	};

	const methods: LogsPageContextMethods = {};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useLogsPageContext = () => useContext(Context) as LogsPageContextValue;

export default LogsPageProvider;
