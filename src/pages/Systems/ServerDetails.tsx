import { Loader, Stack } from '@mantine/core';
import classes from './styles/Systems.module.css';
import _ from 'lodash';
import EventsCountSection from './EventCountSection';
import StorageSection from './StorageSection';
import MachineInfo from './MachineInfo';
import { useGetIngestorInfo } from '@/hooks/useClusterInfo';
import { useClusterStore } from './providers/ClusterProvider';
import { useEffect, useRef } from 'react';

const LoadingState = () => {
	return (
		<Stack flex={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
			<Loader />
		</Stack>
	);
};

const MachineDetails = () => {
	const [currentMachineType] = useClusterStore((store) => store.currentMachineType);
	const isQuerier = currentMachineType === 'querier';
	return (
		<>
			<MachineInfo isQuerier={isQuerier} />
			{!isQuerier && (
				<>
					<EventsCountSection />
					<StorageSection />
				</>
			)}
		</>
	);
};

const ServerDetail = () => {
	const { getIngestorInfoLoading, getIngestorInfoRefetch } = useGetIngestorInfo();
	const [clusterStore] = useClusterStore((store) => store);
	const { currentMachineData } = clusterStore;
	const showLoadingState = getIngestorInfoLoading
		? getIngestorInfoLoading && currentMachineData === null
		: currentMachineData === null;

	const timerRef = useRef<NodeJS.Timer | null>(null);

	useEffect(() => {
		const timerInterval = timerRef.current;
		const clearIntervalInstance = () => {
			if (timerInterval !== null) {
				try {
					clearInterval(timerInterval);
					timerRef.current = null;
				} catch (e) {
					console.log(e);
				}
			}
		};
		clearIntervalInstance();

		if (clusterStore.currentMachineType === 'ingestor' && clusterStore.currentMachine !== null) {
			const intervalId = setInterval(() => {
				getIngestorInfoRefetch();
			}, 60 * 1000);
			timerRef.current = intervalId;
		}

		return () => (timerRef.current ? clearInterval(timerRef.current) : _.noop());
	}, [clusterStore.currentMachine]);

	return (
		<Stack className={classes.sectionContainerr} style={{ padding: '1.4rem' }}>
			{showLoadingState ? <LoadingState /> : <MachineDetails />}
		</Stack>
	);
};

export default ServerDetail;
