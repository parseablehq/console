import { Stack, Text, Group, Button, Modal } from '@mantine/core';
import { useDeleteIngestor } from '@/hooks/useClusterInfo';
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

const ModalTitle = () => {
	return <Text style={{ fontWeight: 600, marginLeft: '0.5rem' }}>Confirm Delete</Text>;
};

export default function DeleteIngestorModal(props: {
	ingestorAddress: string;
	modalOpened: boolean;
	closeModal: () => void;
}) {
	const { deleteIngestorMutation, deleteIngestorIsLoading } = useDeleteIngestor();

	const deleteFn = useCallback(() => {
		deleteIngestorMutation({
			ingestorUrl: sanitizeIngestorUrl(props.ingestorAddress),
			onSuccess: props.closeModal,
		});
	}, []);

	return (
		<Modal size="lg" opened={props.modalOpened} onClose={props.closeModal} title={<ModalTitle />} centered>
			<Stack style={{ padding: '1rem 1rem 1rem 0.5rem' }}>
				<Text fw={500}> Do you want to delete {props.ingestorAddress} ? </Text>
				<Group justify="flex-end" pt="1rem">
					<Button onClick={props.closeModal} variant="filled">
						Cancel
					</Button>
					{!deleteIngestorIsLoading ? (
						<Button className={classes.deleteBtn} onClick={deleteFn} variant="default">
							Delete
						</Button>
					) : (
						<Button loading loaderProps={{ type: 'dots' }} />
					)}
				</Group>
			</Stack>
		</Modal>
	);
}
