import { Stack, Text, Group, Button, Modal } from '@mantine/core';
import { useClusterInfo, useDeleteIngestor } from '@/hooks/useClusterInfo';
import { useClusterStore, clusterStoreReducers } from './providers/ClusterProvider';
import classes from './styles/Systems.module.css';
import { useCallback } from 'react';

function sanitizeIngestorUrl(url: string) {
	if (url.startsWith('http://')) {
		url = url.slice(7);
	} else if (url.startsWith('https://')) {
		url = url.slice(8);
	}

	if (url.endsWith('/')) {
		url = url.slice(0, -1);
	}

	return url;
}

const { setCurrentMachine } = clusterStoreReducers;

const ModalTitle = () => {
	return <Text style={{ fontWeight: 600 }}>Confirm Delete</Text>;
};

export default function DeleteIngestorModal(props: { modalOpened: boolean; closeModal: () => void }) {
	const { deleteIngestorMutation, deleteIngestorIsLoading } = useDeleteIngestor();
	const { getClusterInfoRefetch } = useClusterInfo();
	const [currentMachineAddress, setClusterStore] = useClusterStore((store) => store.currentMachine);
	const [currentMachineType] = useClusterStore((store) => store.currentMachineType);

	const onDeleteIngestorSuccess = useCallback(() => {
		getClusterInfoRefetch();
		setClusterStore((store) => setCurrentMachine(store, store.querierMachine.domain_name, 'querier'));
		props.closeModal();
	}, []);

	const deleteIngestor = useCallback(() => {
		if (!currentMachineAddress || currentMachineType !== 'ingestor') return;

		deleteIngestorMutation({
			ingestorUrl: sanitizeIngestorUrl(currentMachineAddress),
			onSuccess: onDeleteIngestorSuccess,
		});
	}, [currentMachineAddress, currentMachineType]);

	return (
		<Modal
			styles={{ header: { paddingBottom: '0rem' } }}
			opened={props.modalOpened}
			onClose={props.closeModal}
			title={<ModalTitle />}
			centered
			size="36rem">
			{currentMachineAddress ? (
				<Stack style={{ paddingBottom: '0rem' }} gap={24}>
					<Stack gap={0}>
						<Text style={{ fontSize: '0.8rem' }}>Do you want to delete {currentMachineAddress} ? </Text>
					</Stack>
					<Group justify="flex-end">
						<Button
							className={classes.deleteBtn}
							loading={deleteIngestorIsLoading}
							onClick={deleteIngestor}
							variant="filled">
							Delete
						</Button>
						<Button onClick={props.closeModal} variant="default">
							Cancel
						</Button>
					</Group>
				</Stack>
			) : (
				<Text fw={500}>Cannot Load Ingestor Address</Text>
			)}
		</Modal>
	);
}
