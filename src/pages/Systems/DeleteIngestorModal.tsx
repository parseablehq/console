import { Stack, Text, Group, Button, Modal } from '@mantine/core';
import { useDeleteIngestor } from '@/hooks/useClusterInfo';
import classes from './styles/Systems.module.css';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
	return (
		<Text style={{ fontWeight: 600, marginLeft: '0.5rem' }}>
			Confirm Delete
		</Text>
		);
};

export default function DeleteIngestorModal(props: {
	ingestorAddress: string | null;
	modalOpened: boolean;
	closeModal: () => void;
}) {
	const navigate = useNavigate();
	const { deleteIngestorMutation, deleteIngestorIsLoading } = useDeleteIngestor();

	const deleteIngestor = useCallback(() => {
		if (!props.ingestorAddress) return;
		deleteIngestorMutation({
			ingestorUrl: sanitizeIngestorUrl(props.ingestorAddress),
			onSuccess: () => navigate(0),
		});
	}, []);
	return (
		<Modal size="lg" opened={props.modalOpened} onClose={props.closeModal} title={<ModalTitle />} centered>
			{props.ingestorAddress ? (
				<Stack style={{ padding: '1rem 1rem 1rem 0.5rem' }}>
					<Text fw={500}> Do you want to delete {props.ingestorAddress} ? </Text>
					<Group justify="flex-end" pt="1rem">
						<Button onClick={props.closeModal} variant="filled">
							Cancel
						</Button>
						{!deleteIngestorIsLoading ? (
							props.ingestorAddress ? (
								<Button className={classes.deleteBtn} onClick={deleteIngestor} variant="default">
									Delete
								</Button>
							) : null
						) : (
							<Button loading loaderProps={{ type: 'dots' }} />
						)}
					</Group>
				</Stack>
			) : (
				<Text fw={500}>Cannot Load Ingestor Address</Text>
			)}
		</Modal>
	);
}
