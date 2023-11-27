import { AboutData } from '@/@types/parseable/api/about';
import {
	SortOrder,
	type LogsQuery,
	type LogsSearch,
	type LogSelectedTimeRange,
	type AppContext,
	type TimeRange,
} from '@/@types/parseable/api/query';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { ReactNode, createContext, useContext } from 'react';

const Context = createContext({});

const { Provider } = Context;

const now = dayjs().set('seconds', 0).set('millisecond', 0);;
export const REFRESH_INTERVALS = [10000, 30000, 60000, 300000, 600000, 1200000];
export const FIXED_DURATIONS = [
	{
		name: 'last 10 minutes',
		value:'10m',
		milliseconds: dayjs.duration({ minutes: 10 }).asMilliseconds(),
	},
	{
		name: 'last 1 hour',
		value:'1h',
		milliseconds: dayjs.duration({ hours: 1 }).asMilliseconds(),
	},
	{
		name: 'last 5 hours',
		value:'5h',
		milliseconds: dayjs.duration({ hours: 5 }).asMilliseconds(),
	},
	{
		name: 'last 24 hours',
		value:'24h',
		milliseconds: dayjs.duration({ days: 1 }).asMilliseconds(),
	},
	{
		name: 'last 3 days',
		value:'3d',
		milliseconds: dayjs.duration({ days: 3 }).asMilliseconds(),
	},
	{
		name: 'last 7 days',
		value:'7d',
		milliseconds: dayjs.duration({ days: 7 }).asMilliseconds(),
	},
] as const;

export const DEFAULT_FIXED_DURATIONS = FIXED_DURATIONS[5];

interface HeaderContextState {
	subInstanceConfig: SubData<AboutData | null>;
	subAppContext: SubData<AppContext>;
	subTimeRange: SubData<TimeRange>;
	subLogQuery: SubData<LogsQuery>;
	subLogSearch: SubData<LogsSearch>;
	subRefreshInterval: SubData<number | null>;
	subLogSelectedTimeRange: SubData<LogSelectedTimeRange>;
	subCreateUserModalTogle: SubData<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HeaderContextMethods {}

interface HeaderContextValue {
	state: HeaderContextState;
	methods: HeaderContextMethods;
}

interface HeaderProviderProps {
	children: ReactNode;
}

const MainLayoutPageProvider: FC<HeaderProviderProps> = ({ children }) => {
	const subAppContext = useSubscribeState<AppContext>({
		selectedStream: null,
		activePage: null,
		action: null,
		userSpecificStreams: null,
		userRoles: null,
	});
	const subInstanceConfig = useSubscribeState<AboutData | null>(null);

	const subTimeRange = useSubscribeState<TimeRange>({
		startTime:DEFAULT_FIXED_DURATIONS.value,
		endTime: "now",
		state:"relative",
		name:DEFAULT_FIXED_DURATIONS.name
	});
	
	const subLogQuery = useSubscribeState<LogsQuery>({
		startTime: now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate(),
		endTime: now.toDate(),
		streamName: '',
		access: null,
	});
	const subLogSearch = useSubscribeState<LogsSearch>({
		search: '',
		filters: {},
		sort: {
			field: 'p_timestamp',
			order: SortOrder.DESCENDING,
		},
	});
	const subLogSelectedTimeRange = useSubscribeState<LogSelectedTimeRange>({
		state: 'fixed',
		value: DEFAULT_FIXED_DURATIONS.name,
	});
	const subRefreshInterval = useSubscribeState<number | null>(null);
	const subCreateUserModalTogle = useSubscribeState<boolean>(false);

	const state: HeaderContextState = {
		subAppContext,
		subLogQuery,
		subLogSearch,
		subRefreshInterval,
		subLogSelectedTimeRange,
		subCreateUserModalTogle,
		subInstanceConfig,
		subTimeRange,
	};

	const methods: HeaderContextMethods = {};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useHeaderContext = () => useContext(Context) as HeaderContextValue;

export default MainLayoutPageProvider;
