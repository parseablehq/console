import { LogStreamData } from '@/@types/parseable/api/stream';
import { getStreamsSepcificAccess } from '@/components/Navbar/rolesHandler';
import initContext from '@/utils/initContext';
import { AboutData } from '@/@types/parseable/api/about';

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
	currentStream: null | string;
	userRoles: UserRoles | null;
	userSpecificStreams: null | LogStreamData;
	userAccessMap: { [key: string]: boolean };
	streamSpecificUserAccess: string[] | null;
	instanceConfig: AboutData | null;
};

type AppStoreReducers = {
	toggleMaximize: (store: AppStore) => ReducerOutput;
	toggleHelpModal: (store: AppStore) => ReducerOutput;
	changeStream: (store: AppStore, stream: string) => ReducerOutput;
	setUserRoles: (store: AppStore, roles: UserRoles | null) => ReducerOutput;
	setUserSpecificStreams: (store: AppStore, userSpecficStreams: LogStreamData | null) => ReducerOutput;
	setUserAccessMap: (store: AppStore, accessRoles: string[] | null) => ReducerOutput;
	setStreamSpecificUserAccess: (store: AppStore) => ReducerOutput;
	setInstanceConfig: (store: AppStore, instanceConfig: AboutData) => ReducerOutput;
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
};

const { Provider: AppProvider, useStore: useAppStore } = initContext(initialState);

// helpers
const accessKeyMap: { [key: string]: string } = {
	hasUserAccess: 'ListUser',
	hasDeleteAccess: 'DeleteStream',
	hasUpdateAlertAccess: 'PutAlert',
	hasGetAlertAccess: 'GetAlert',
	hasCreateStreamAccess: 'CreateStream',
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

const toggleHelpModal = (store: AppStore) => {
	return { helpModalOpen: !store.helpModalOpen };
};

const changeStream = (_store: AppStore, stream: string) => {
	return { currentStream: stream };
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

const setStreamSpecificUserAccess = (store: AppStore) => {
	if (store.userRoles && store.currentStream) {
		return { streamSpecificUserAccess: getStreamsSepcificAccess(store.userRoles, store.currentStream) };
	} else {
		return store;
	}
};

const setInstanceConfig = (_store: AppStore, instanceConfig: AboutData | null) => {
	return { instanceConfig };
};

const appStoreReducers: AppStoreReducers = {
	toggleMaximize,
	toggleHelpModal,
	changeStream,
	setUserRoles,
	setUserSpecificStreams,
	setUserAccessMap,
	setStreamSpecificUserAccess,
	setInstanceConfig
};

export { AppProvider, useAppStore, appStoreReducers };
