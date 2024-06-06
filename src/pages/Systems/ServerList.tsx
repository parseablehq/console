import { Pill, Stack, Text, ThemeIcon, Skeleton } from '@mantine/core';
import classes from './styles/Systems.module.css';
import { IconActivity } from '@tabler/icons-react';
import _ from 'lodash';
import { useClusterInfo } from '@/hooks/useClusterInfo';
import { useClusterStore, clusterStoreReducers, MachineType } from './providers/ClusterProvider';
import { useCallback } from 'react';

const { setCurrentMachine } = clusterStoreReducers;

const ServerItem = (props: { machine: MachineType }) => {
	const [selectedMachine, setClusterStore] = useClusterStore((store) => store.currentMachine);
	const itemClassName =
		selectedMachine === props.machine.domain_name
			? `${classes.serverItem} ${classes.serverItemActive}`
			: classes.serverItem;
	const onClick = useCallback(() => {
		if (selectedMachine === props.machine.domain_name) return;

		if (!props.machine.type) return;

		setClusterStore((store) => setCurrentMachine(store, props.machine.domain_name, props.machine.type));
	}, [selectedMachine]);

	return (
		<Stack className={itemClassName} gap={8} onClick={onClick}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Pill className={classes.serverTypePill}>{_.capitalize(props.machine.type)}</Pill>
				<ThemeIcon
					className={props.machine.reachable ? classes.liveIcon : classes.serverDownIcon}
					variant="filled"
					size={24}>
					<IconActivity />
				</ThemeIcon>
			</Stack>
			<Stack>
				<Text className={classes.serverDomain}>{props.machine.domain_name}</Text>
			</Stack>
		</Stack>
	);
};

const LoadingState = () => {
	const Item = <Skeleton height={60} />;
	return (
		<Stack flex={1} style={{ padding: '0 1rem' }}>
			{Item}
			{Item}
			{Item}
			{Item}
		</Stack>
	);
};

const List = () => {
	const { getClusterInfoSuccess } = useClusterInfo();
	const [clusterStore] = useClusterStore((store) => store);
	const { ingestorMachines: ingestorsInStore, querierMachine } = clusterStore;
	const querier = { ...querierMachine, type: 'querier' as 'querier' };
	const ingestors = _.map(ingestorsInStore, (ingestors) => ({ ...ingestors, type: 'ingestor' as 'ingestor' }));

	return (
		<Stack gap={0} flex={1}>
			{getClusterInfoSuccess ? (
				_.map([querier, ...ingestors], (machine) => {
					return <ServerItem machine={machine} key={machine.domain_name} />;
				})
			) : (
				<LoadingState />
			)}
		</Stack>
	);
};

const ServerList = () => {
	return (
		<Stack className={classes.sectionContainerr}>
			<Stack style={{ padding: '1rem 1rem 0.5rem 1.5rem', flexDirection: 'row', alignItems: 'center' }} gap={8}>
				<Text className={classes.leftSectionTitle}>Cluster Machines</Text>
			</Stack>
			<List />
		</Stack>
	);
};

export default ServerList;
