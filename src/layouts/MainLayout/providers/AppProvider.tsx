import { LogStreamData } from '@/@types/parseable/api/stream';
import initContext from '@/utils/initContext';
import { AboutData } from '@/@types/parseable/api/about';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { SavedFilterType } from '@/@types/parseable/api/savedFilters';

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

type AppStore = {
	maximized: boolean;
	helpModalOpen: boolean;
	createStreamModalOpen: boolean;
	currentStream: null | string;
	userRoles: UserRoles | null;
	userSpecificStreams: null | LogStreamData;
	userAccessMap: { [key: string]: boolean };
	streamSpecificUserAccess: string[] | null;
	instanceConfig: AboutData | null;
	isStandAloneMode: boolean | null;
	savedFilters: SavedFilterType[] | null; // null to verify whether filters have been fetched or not
	activeSavedFilters: SavedFilterType[]; // stream specific
};

type AppStoreReducers = {
	toggleMaximize: (store: AppStore) => ReducerOutput;
	toggleHelpModal: (store: AppStore, val?: boolean) => ReducerOutput;
	changeStream: (store: AppStore, stream: string) => ReducerOutput;
	setUserRoles: (store: AppStore, roles: UserRoles | null) => ReducerOutput;
	setUserSpecificStreams: (store: AppStore, userSpecficStreams: LogStreamData | null) => ReducerOutput;
	setUserAccessMap: (store: AppStore, accessRoles: string[] | null) => ReducerOutput;
	setStreamSpecificUserAccess: (store: AppStore, streamSpecificUserAccess: string[]) => ReducerOutput;
	setInstanceConfig: (store: AppStore, instanceConfig: AboutData) => ReducerOutput;
	toggleCreateStreamModal: (store: AppStore, val?: boolean) => ReducerOutput;
	setSavedFilters: (store: AppStore, savedFilters: AxiosResponse<SavedFilterType[]>) => ReducerOutput;
};

const initialState: AppStore = {
	maximized: false,
	helpModalOpen: false,
	currentStream: null,
	userRoles: null,
	userSpecificStreams: null,
	userAccessMap: {},
	streamSpecificUserAccess: null,
	instanceConfig: null,
	createStreamModalOpen: false,
	isStandAloneMode: null,
	savedFilters: null,
	activeSavedFilters: [],
};

const { Provider: AppProvider, useStore: useAppStore } = initContext(initialState);

// helpers
const accessKeyMap: { [key: string]: string } = {
	hasUserAccess: 'ListUser',
	hasDeleteAccess: 'DeleteStream',
	hasUpdateAlertAccess: 'PutAlert',
	hasGetAlertAccess: 'GetAlert',
	hasCreateStreamAccess: 'CreateStream',
	hasDeleteStreamAccess: 'DeleteStream',
	hasClusterAccess: 'Cluster',
};

const generateUserAcccessMap = (accessRoles: string[] | null) => {
	return Object.keys(accessKeyMap).reduce((acc, accessKey: string) => {
		return {
			...acc,
			[accessKey]:
				accessRoles !== null && accessKeyMap.hasOwnProperty(accessKey) && accessRoles.includes(accessKeyMap[accessKey]),
		};
	}, {});
};

// reducers

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

const setUserRoles = (_store: AppStore, roles: UserRoles | null) => {
	return { userRoles: roles };
};

const setUserSpecificStreams = (_store: AppStore, userSpecificStreams: null | LogStreamData) => {
	return { userSpecificStreams };
};

const setUserAccessMap = (_store: AppStore, accessRoles: string[] | null) => {
	return { userAccessMap: generateUserAcccessMap(accessRoles) };
};

const setStreamSpecificUserAccess = (_store: AppStore, streamSpecificUserAccess: string[]) => {
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
	setUserRoles,
	setUserSpecificStreams,
	setUserAccessMap,
	setStreamSpecificUserAccess,
	setInstanceConfig,
	toggleCreateStreamModal,
	setSavedFilters,
};

export { AppProvider, useAppStore, appStoreReducers };
