import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import type { LogsQuery } from '@/@types/parseable/api/query';
import type { FC } from 'react';
import { ReactNode, createContext, useContext } from 'react';
import dayjs from 'dayjs';

const Context = createContext({});

const { Provider } = Context;

const now = dayjs();

export const LOG_QUERY_LIMITS = [30, 50, 100, 150, 200];

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

export const defaultQueryResult = ``

export const defaultQueryEditor= `SELECT * FROM frontend LIMIT 10 OFFSET 0;`

interface QueryPageContextState {
    query: SubData<string>;
    result: SubData<string>;
    subLogQuery: SubData<LogsQuery>;
	
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface QueryPageContextMethods {}

interface QueryPageContextValue {
	state: QueryPageContextState;
	methods: QueryPageContextMethods;
}

interface QueryPageProviderProps {
	children: ReactNode;
}

const QueryPageProvider: FC<QueryPageProviderProps> = ({ children }) => {
    const query = useSubscribeState<string>(defaultQueryEditor);
    const result = useSubscribeState<string>(defaultQueryResult);
    const subLogQuery = useSubscribeState<LogsQuery>({
		searchText: '',
		startTime: now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate(),
		endTime: now.toDate(),
		streamName: '',
		limit: LOG_QUERY_LIMITS[0],
		page: 1,
	});

	const state: QueryPageContextState = {
		query,
		result,
        subLogQuery
	};

	const methods: QueryPageContextMethods = {};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useQueryPageContext = () => useContext(Context) as QueryPageContextValue;

export default QueryPageProvider;
