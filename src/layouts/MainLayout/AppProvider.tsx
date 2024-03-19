import createFastContext from '@/utils/createFastContext';

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
};

type AppStoreReducers = {
	toggleMaximize: (store: AppStore) => ReducerOutput;
	toggleHelpModal: (store: AppStore) => ReducerOutput;
	changeStream: (store: AppStore, stream: string) => ReducerOutput;
	setUserRoles: (store: AppStore, roles: UserRoles | null) => ReducerOutput;
};

const initialState: AppStore = {
	maximized: false,
	helpModalOpen: false,
	currentStream: null,
	userRoles: null
};

const { Provider: AppProvider, useStore: useAppStore } = createFastContext(initialState);

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
	return {userRoles: roles}
}

const appStoreReducers: AppStoreReducers = {
	toggleMaximize,
	toggleHelpModal,
	changeStream,
	setUserRoles
};

export { AppProvider, useAppStore, appStoreReducers };
