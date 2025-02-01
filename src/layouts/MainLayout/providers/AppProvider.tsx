import { FIXED_DURATIONS, FixedDuration } from '@/constants/timeConstants';
import dayjs, { Dayjs } from 'dayjs';

import { AboutData } from '@/@types/parseable/api/about';
import { AxiosResponse } from 'axios';
import { LogStreamData } from '@/@types/parseable/api/stream';
import { SavedFilterType } from '@/@types/parseable/api/savedFilters';
import _ from 'lodash';
import initContext from '@/utils/initContext';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { makeTimeRangeLabel } = timeRangeUtils;

export const DEFAULT_FIXED_DURATIONS = FIXED_DURATIONS[0];

export type UserRoles = {
	[roleName: string]: {
		privilege: string;
		resource?: {
			stream: string;
			tag: string;
		};
	}[];
};

type ReducerOutput = Partial<AppStore>;

export type TimeRange = {
	startTime: Date;
	endTime: Date;
	type: 'fixed' | 'custom';
	label: string;
	interval: number;
	shiftInterval: number;
};

const getDefaultTimeRange = (duration: FixedDuration = DEFAULT_FIXED_DURATIONS) => {
	const now = dayjs().startOf('minute');
	const { milliseconds } = duration;

	const startTime = now.subtract(milliseconds, 'milliseconds');
	const endTime = now;
	const label = makeTimeRangeLabel(startTime.toDate(), endTime.toDate());

	return {
		startTime: startTime.toDate(),
		endTime: now.toDate(),
		type: 'fixed' as const,
		label,
		interval: milliseconds,
		shiftInterval: 1,
	};
};

type AppStore = {
	timeRange: TimeRange;
	maximized: boolean;
	helpModalOpen: boolean;
	createStreamModalOpen: boolean;
	currentStream: null | string;
	streamForCorrelation: null | string;
	userRoles: UserRoles | null;
	userSpecificStreams: null | LogStreamData;
	userAccessMap: { [key: string]: boolean };
	streamSpecificUserAccess: string[] | null;
	instanceConfig: AboutData | null;
	isStandAloneMode: boolean | null;
	savedFilters: SavedFilterType[] | null; // null to verify whether filters have been fetched or not
	activeSavedFilters: SavedFilterType[]; // stream specific
	isSecureHTTPContext: boolean;
};

type AppStoreReducers = {
	setTimeRange: (
		store: AppStore,
		payload: { startTime: dayjs.Dayjs; endTime: dayjs.Dayjs; type: 'fixed' | 'custom' },
	) => ReducerOutput;
	toggleMaximize: (store: AppStore) => ReducerOutput;
	toggleHelpModal: (store: AppStore, val?: boolean) => ReducerOutput;
	changeStream: (store: AppStore, stream: string) => ReducerOutput;
	setStreamForCorrelation: (store: AppStore, stream: string) => ReducerOutput;
	setUserRoles: (store: AppStore, roles: UserRoles | null) => ReducerOutput;
	setshiftInterval: (store: AppStore, interval: number) => ReducerOutput;
	syncTimeRange: (store: AppStore) => ReducerOutput;
	setUserSpecificStreams: (store: AppStore, userSpecficStreams: LogStreamData | null) => ReducerOutput;
	setUserAccessMap: (store: AppStore, accessRoles: string[] | null) => ReducerOutput;
	setStreamSpecificUserAccess: (store: AppStore, streamSpecificUserAccess: string[] | null) => ReducerOutput;
	setInstanceConfig: (store: AppStore, instanceConfig: AboutData) => ReducerOutput;
	toggleCreateStreamModal: (store: AppStore, val?: boolean) => ReducerOutput;
	setSavedFilters: (store: AppStore, savedFilters: AxiosResponse<SavedFilterType[]>) => ReducerOutput;
	applyQueryWithResetTime: (store: AppStore, timeRangePayload: { from: string; to: string } | null) => ReducerOutput;
};

const initialState: AppStore = {
	timeRange: getDefaultTimeRange(),
	maximized: false,
	helpModalOpen: false,
	currentStream: null,
	streamForCorrelation: null,
	userRoles: null,
	userSpecificStreams: null,
	userAccessMap: {},
	streamSpecificUserAccess: null,
	instanceConfig: null,
	createStreamModalOpen: false,
	isStandAloneMode: null,
	savedFilters: null,
	activeSavedFilters: [],
	isSecureHTTPContext: getHTTPContext(),
};

const { Provider: AppProvider, useStore: useAppStore } = initContext(initialState);

// helpers
const accessKeyMap: { [key: string]: string } = {
	hasUserAccess: 'Users',
	hasDeleteAccess: 'DeleteStream',
	hasCreateStreamAccess: 'CreateStream',
	hasDeleteStreamAccess: 'DeleteStream',
	hasClusterAccess: 'Cluster',
	hasAlertsAccess: 'Alerts',
	hasSettingsAccess: 'StreamSettings',
};

const generateUserAcccessMap = (accessRoles: string[] | null) => {
	return Object.keys(accessKeyMap).reduce((acc, accessKey: string) => {
		return {
			...acc,
			[accessKey]: accessRoles !== null && accessKey in accessKeyMap && accessRoles.includes(accessKeyMap[accessKey]),
		};
	}, {});
};

function getHTTPContext() {
	return window.isSecureContext;
}
// reducers
const syncTimeRange = (store: AppStore) => {
	const { timeRange } = store;
	const duration = _.find(FIXED_DURATIONS, (duration) => duration.milliseconds === timeRange.interval);
	const updatedTimeRange = { timeRange: getDefaultTimeRange(duration) };
	return {
		...updatedTimeRange,
	};
};

const setTimeRange = (
	store: AppStore,
	payload: { startTime: dayjs.Dayjs; endTime: Dayjs; type: 'fixed' | 'custom' },
) => {
	const { startTime, endTime, type } = payload;
	const label = makeTimeRangeLabel(startTime.toDate(), endTime.toDate());
	const interval = endTime.diff(startTime, 'milliseconds');
	return {
		timeRange: { ...store.timeRange, startTime: startTime.toDate(), endTime: endTime.toDate(), label, interval, type },
	};
};

const setshiftInterval = (store: AppStore, interval: number) => {
	const { timeRange } = store;
	return {
		timeRange: {
			...timeRange,
			shiftInterval: interval,
		},
	};
};

const applyQueryWithResetTime = (store: AppStore, timeRangePayload: { from: string; to: string } | null) => {
	const { timeRange } = store;

	const updatedTimeRange = (() => {
		if (!timeRangePayload) {
			return { timeRange };
		} else {
			const startTime = dayjs(timeRangePayload.from);
			const endTime = dayjs(timeRangePayload.to);
			const label = makeTimeRangeLabel(startTime.toDate(), endTime.toDate());
			const interval = endTime.diff(startTime, 'milliseconds');
			return {
				timeRange: {
					...store.timeRange,
					startTime: startTime.toDate(),
					endTime: endTime.toDate(),
					label,
					interval,
					type: 'custom' as const, // always
				},
			};
		}
	})();

	return {
		...updatedTimeRange,
	};
};

const toggleMaximize = (store: AppStore) => {
	return { maximized: !store.maximized };
};

const toggleHelpModal = (store: AppStore, val?: boolean) => {
	return { helpModalOpen: _.isBoolean(val) ? val : !store.helpModalOpen };
};

const toggleCreateStreamModal = (store: AppStore, val?: boolean) => {
	return { createStreamModalOpen: _.isBoolean(val) ? val : !store.createStreamModalOpen };
};

const changeStream = (store: AppStore, stream: string) => {
	const activeSavedFilters = _.filter(store.savedFilters, (filter) => filter.stream_name === stream);
	return { currentStream: stream, activeSavedFilters };
};

const setStreamForCorrelation = (_store: AppStore, stream: string) => {
	return { streamForCorrelation: stream };
};

const setUserRoles = (_store: AppStore, roles: UserRoles | null) => {
	return { userRoles: roles };
};

const setUserSpecificStreams = (_store: AppStore, userSpecificStreams: null | LogStreamData) => {
	return { userSpecificStreams };
};

const setUserAccessMap = (_store: AppStore, accessRoles: string[] | null) => {
	return { userAccessMap: generateUserAcccessMap(accessRoles) };
};

const setStreamSpecificUserAccess = (_store: AppStore, streamSpecificUserAccess: string[] | null) => {
	return { streamSpecificUserAccess };
};

const setInstanceConfig = (_store: AppStore, instanceConfig: AboutData | null) => {
	const { mode } = instanceConfig || {};
	return { instanceConfig, isStandAloneMode: mode === 'Standalone' };
};

const setSavedFilters = (store: AppStore, savedFiltersResponse: AxiosResponse<SavedFilterType[]>) => {
	const { currentStream } = store;
	const savedFilters = savedFiltersResponse.data;
	const activeSavedFilters = _.filter(savedFilters, (filter) => filter.stream_name === currentStream);
	return { savedFilters, activeSavedFilters };
};

const appStoreReducers: AppStoreReducers = {
	toggleMaximize,
	toggleHelpModal,
	changeStream,
	setStreamForCorrelation,
	setUserRoles,
	setUserSpecificStreams,
	setUserAccessMap,
	setStreamSpecificUserAccess,
	setInstanceConfig,
	toggleCreateStreamModal,
	setSavedFilters,
	setTimeRange,
	setshiftInterval,
	syncTimeRange,
	applyQueryWithResetTime,
};

export { AppProvider, useAppStore, appStoreReducers };
