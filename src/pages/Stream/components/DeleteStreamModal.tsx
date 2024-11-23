import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import styles from '../styles/Logs.module.css';
import { useCallback, useState } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useNavigate } from 'react-router-dom';

const { toggleDeleteModal } = logsStoreReducers;

const DeleteStreamModal = () => {
	const [deleteModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.deleteModalOpen);
	const [confirmInputValue, setConfirmInputValue] = useState<string>('');
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setConfirmInputValue(e.target.value);
	}, []);
	const onCloseModal = useCallback(() => {
		setConfirmInputValue('');
		setLogsStore((store) => toggleDeleteModal(store, false));
	}, []);
	const { deleteLogStreamMutation } = useLogStream();
	const navigate = useNavigate();

	const onDeleteSuccess = useCallback(() => {
		onCloseModal();
		navigate('/');
	}, []);
	const [currentStream] = useAppStore((store) => store.currentStream);

	const handleDeleteStream = useCallback(() => {
		if (!currentStream) return;

		deleteLogStreamMutation({ deleteStream: currentStream, onSuccess: onDeleteSuccess });
	}, [currentStream]);

	return (
		<Modal
			withinPortal
			size="md"
			opened={deleteModalOpen}
			onClose={onCloseModal}
			title={'Delete Stream'}
			centered
			className={styles.modalStyle}
			styles={{ title: { fontWeight: 700 } }}>
			<Stack>
				<Stack gap={8}>
					<Text className={styles.warningText}>Are you sure you want to delete this stream?</Text>
					<Text className={styles.confirmationText}>
						Please type <span className={styles.confirmationTextHighlight}>{`"${currentStream}"`}</span> to confirm.
					</Text>
					<TextInput
						type="text"
						onChange={handleInputChange}
						placeholder="Type the name of the stream"
						required
						value={confirmInputValue}
					/>
				</Stack>

				<Group justify="right">
					<Button onClick={onCloseModal} variant="outline" className={styles.modalCancelBtn}>
						Cancel
					</Button>
					<Button
						className={styles.modalActionBtn}
						disabled={confirmInputValue !== currentStream}
						onClick={handleDeleteStream}>
						Delete
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default DeleteStreamModal;
