import { AboutData } from '@/@types/parseable/api/about';
import { SortOrder, type LogsQuery, type LogsSearch, type LogSelectedTimeRange } from '@/@types/parseable/api/query';
import { LogStreamData } from '@/@types/parseable/api/stream';
import { FIXED_DURATIONS } from '@/constants/timeConstants';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { ReactNode, createContext, useCallback, useContext } from 'react';

const Context = createContext({});

const { Provider } = Context;

const now = dayjs();

export const DEFAULT_FIXED_DURATIONS = FIXED_DURATIONS[0];

type LiveTailData = {
	liveTailStatus: 'streaming' | 'stopped' | 'abort' | 'fetch' | '';
	liveTailSchemaData: LogStreamData;
	liveTailSearchValue: string;
	liveTailSearchField: string;
};

interface HeaderContextState {
	subLogQuery: SubData<LogsQuery>;
	subLogSearch: SubData<LogsSearch>;
	subLiveTailsData: SubData<LiveTailData>;
	subRefreshInterval: SubData<number | null>;
	subLogSelectedTimeRange: SubData<LogSelectedTimeRange>;
	subNavbarTogle: SubData<boolean>;
	subCreateUserModalTogle: SubData<boolean>;
	subInstanceConfig: SubData<AboutData | null>;
	subAppContext: SubData<AppContext>;
}

export type UserRoles = {
	roleName: {
		privilege: string;
		resource?: {
			stream: string;
			tag: string;
		};
	}[];
};

export type PageOption = '/' | '/explore' | '/sql' | '/management' | '/team';

export type AppContext = {
	selectedStream: string | null;
	activePage: PageOption | null;
	action: string[] | null;
	userSpecificStreams: string[] | null;
	userRoles: UserRoles | null;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface HeaderContextMethods {
	resetTimeInterval: () => void;
}

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
			key: 'p_timestamp',
			order: SortOrder.DESCENDING,
		},
	});
	const subLiveTailsData = useSubscribeState<LiveTailData>({
		liveTailStatus: '',
		liveTailSchemaData: [],
		liveTailSearchValue: '',
		liveTailSearchField: '',
	});
	const subLogSelectedTimeRange = useSubscribeState<LogSelectedTimeRange>({
		state: 'fixed',
		value: DEFAULT_FIXED_DURATIONS.name,
	});
	const subRefreshInterval = useSubscribeState<number | null>(null);
	const subNavbarTogle = useSubscribeState<boolean>(false);
	const subCreateUserModalTogle = useSubscribeState<boolean>(false);
	const subInstanceConfig = useSubscribeState<AboutData | null>(null);

	const state: HeaderContextState = {
		subLogQuery,
		subLogSearch,
		subRefreshInterval,
		subLogSelectedTimeRange,
		subNavbarTogle,
		subCreateUserModalTogle,
		subInstanceConfig,
		subAppContext,
		subLiveTailsData,
	};

	const resetTimeInterval = useCallback(() => {
		if (subLogSelectedTimeRange.get().state==='fixed') {
			const now = dayjs();
			const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
			subLogQuery.set((state) => {
				state.startTime = now.subtract(timeDiff).toDate();
				state.endTime = now.toDate();
			});
		}
	}, []);
	const methods: HeaderContextMethods = {resetTimeInterval};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useHeaderContext = () => useContext(Context) as HeaderContextValue;

export default MainLayoutPageProvider;
