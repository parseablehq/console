import { IngestorQueryRecord } from '@/@types/parseable/api/clusterInfo';
import initContext from '@/utils/initContext';
import _ from 'lodash';

type ReducerOutput = Partial<ClusterStore>;

type SystemType = 'querier' | 'ingestor'

type currentMachineData = IngestorQueryRecord[];

type currentMachineRecentRecord = IngestorQueryRecord | null;

type ClusterStore = {
	currentMachine: string | null;
	currentMachineType: SystemType | null;
	currentMachineData: currentMachineData | null;
	currentMachineRecentRecord: currentMachineRecentRecord;
	querierMachine: MachineType;
	ingestorMachines: MachineType[];
};

export type MachineType = {
	domain_name: string;
	reachable: boolean;
	type?: SystemType;
}

type ClusterStoreReducers = {
	setIngestorMachines: (store: ClusterStore, ingestors: MachineType[]) => ReducerOutput;
	setCurrentMachine: (store: ClusterStore, domain_name: string, type: SystemType | undefined) => ReducerOutput;
	setCurrentMachineData: (store: ClusterStore, data: currentMachineData) => ReducerOutput;
	getCleanStoreForRefetch: (store: ClusterStore) => ReducerOutput;
}

const initialState: ClusterStore = {
	// for any changes - modify setCurrentMachine
	currentMachine: `${window.location.protocol}//${window.location.host}`,
	currentMachineType: 'querier',
	currentMachineData: [],
	currentMachineRecentRecord: null,
	querierMachine: {domain_name: `${window.location.protocol}//${window.location.host}`, reachable: true},
	ingestorMachines: []
}

const setIngestorMachines = (store: ClusterStore, ingestors: MachineType[]) => {
	return {
		currentMachine: store.querierMachine.domain_name,
		ingestorMachines: ingestors,
	}
}

const setCurrentMachine = (store: ClusterStore, domain_name: string, type: SystemType | undefined) => {
	if (!type) return store;

	const querierInfo = {
		currentMachine: store.querierMachine.domain_name,
		currentMachineType: 'querier' as SystemType,
		currentMachineData: [],
		currentMachineRecentRecord: null,
	};
	if (type === 'querier') {
		return querierInfo;
	} else {
		const ingestor = _.find(store.ingestorMachines, (ingestor) => ingestor.domain_name === domain_name);

		return {
			currentMachine: ingestor?.domain_name,
			currentMachineType: 'ingestor' as SystemType,
			currentMachineData: ingestor ? null : [],
			currentMachineRecentRecord: null,
		};
	}
}

const setCurrentMachineData = (_store: ClusterStore, data: currentMachineData) => {
	return {
		currentMachineData: data,
		currentMachineRecentRecord: _.last(data)
	}
}

const getCleanStoreForRefetch = (_store: ClusterStore) => {
	return initialState;
};

const clusterStoreReducers: ClusterStoreReducers = {
	setIngestorMachines,
	setCurrentMachine,
	setCurrentMachineData,
	getCleanStoreForRefetch
}

const { Provider: ClusterProvider, useStore: useClusterStore } = initContext(initialState);



export { ClusterProvider, useClusterStore, clusterStoreReducers };
