import type { Log } from '@/@types/parseable/api/query';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';
import type { Dispatch, FC, SetStateAction } from 'react';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { sanitizeCSVData } from '@/utils/exportHelpers';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useDisclosure } from '@mantine/hooks';

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
	deleteModalOpen: boolean;
	currentStream: string;
	alertsModalOpen: boolean;
	retentionModalOpen: boolean;
	maximized: boolean;
	liveTailToggled: boolean;
	builderModalOpen: boolean;
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
	closeRetentionModal: () => void;
	openDeleteModal: () => void;
	openAlertsModal: () => void;
	openRetentionModal: () => void;
	toggleLiveTail: () => void;
	closeAlertsModal: () => void;
}

interface LogsPageContextValue {
	state: LogsPageContextState;
	methods: LogsPageContextMethods;
}

interface LogsPageProviderProps {
	children: ReactNode;
}

type custQuerySearchMode = 'sql' | 'filters';

type CustQuerySearchState = {
	showQueryEditor: boolean;
	isQuerySearchActive: boolean;
	custSearchQuery: string;
	mode: string;
	viewMode: string;
};

export const defaultQueryResult = '';

const defaultCustQuerySearchState = {
	showQueryEditor: false,
	isQuerySearchActive: false,
	custSearchQuery: '',
	mode: 'filters',
	viewMode: 'filters',
};

const LogsPageProvider: FC<LogsPageProviderProps> = ({ children }) => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();
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
	const [currentStream, setCurrentStream] = useState<string>(subLogQuery.get().streamName);
	const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [alertsModalOpen, setAlertsModalOpen] = useState<boolean>(false);
	const [retentionModalOpen, setRetentionModalOpen] = useState<boolean>(false);

	const [maximized, { toggle: toggleMaximize }] = useDisclosure(false);
	const [liveTailToggled, { toggle: toggleLiveTail }] = useDisclosure(false);
	const [builderModalOpen, { toggle: toggleBuilderModal, close: closeBuilderModal }] = useDisclosure(false);

	// TODO: rm this after context refactor
	useEffect(() => {
		const streamlistener = subLogQuery.subscribe((state) => {
			if (state.streamName) {
				setCurrentStream(state.streamName);
			}
		});

		return () => {
			streamlistener();
		};
	}, [subLogQuery]);

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
		deleteModalOpen,
		currentStream,
		alertsModalOpen,
		retentionModalOpen,
		maximized,
		liveTailToggled,
		builderModalOpen,
	};

	// getters & setters
	const toggleShowQueryEditor = useCallback(() => {
		setCustQuerySearchState((prev) => ({ ...prev, showQueryEditor: !prev.showQueryEditor }));
	}, []);

	const resetQuerySearch = useCallback(() => {
		closeBuilderModal();
		setCustQuerySearchState((prev) => ({ ...defaultCustQuerySearchState, viewMode: prev.viewMode }));
		// setPageOffset(0); wont the LogTable handle this ?
	}, []);

	const setCustSearchQuery = useCallback((query: string, mode: custQuerySearchMode) => {
		setCustQuerySearchState((prev) => ({
			...prev,
			mode,
			custSearchQuery: query,
			isQuerySearchActive: true,
			showQueryEditor: false,
		}));
	}, []);

	const toggleCustQuerySearchMode = useCallback((viewMode: custQuerySearchMode) => {
		setCustQuerySearchState((prev) => ({ ...prev, viewMode }));
	}, []);

	const closeDeleteModal = useCallback(() => {
		return setDeleteModalOpen(false);
	}, []);

	const openDeleteModal = useCallback(() => {
		return setDeleteModalOpen(true);
	}, []);

	const closeAlertsModal = useCallback(() => {
		return setAlertsModalOpen(false);
	}, []);

	const openAlertsModal = useCallback(() => {
		return setAlertsModalOpen(true);
	}, []);

	const closeRetentionModal = useCallback(() => {
		return setRetentionModalOpen(false);
	}, []);

	const openRetentionModal = useCallback(() => {
		return setRetentionModalOpen(true);
	}, []);

	// handlers
	const makeExportData = useCallback(
		(type: string): Log[] => {
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
		},
		[custQuerySearchState.isQuerySearchActive],
	);

	const methods = {
		makeExportData,
		toggleShowQueryEditor,
		resetQuerySearch,
		setPageOffset,
		setCustSearchQuery,
		closeDeleteModal,
		openDeleteModal,
		openAlertsModal,
		closeAlertsModal,
		openRetentionModal,
		closeRetentionModal,
		toggleMaximize,
		toggleLiveTail,
		toggleCustQuerySearchMode,
		toggleBuilderModal,
		closeBuilderModal,
	};

	const value = useMemo(() => ({ state, methods }), [state, methods]);

	return <Provider value={value}>{children}</Provider>;
};

export const useLogsPageContext = () => useContext(Context) as LogsPageContextValue;

export default LogsPageProvider;
