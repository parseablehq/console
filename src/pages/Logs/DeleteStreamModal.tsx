import { Button, Group, Modal, TextInput } from '@mantine/core';
import styles from './styles/Logs.module.css';
import { useCallback, useState } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useNavigate } from 'react-router-dom';

const { toggleDeleteModal } = logsStoreReducers;

const DeleteStreamModal = () => {
	const [deleteModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.deleteModalOpen);
	const [confirmInputValue, setConfirmInputValue] = useState<string>('');
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setConfirmInputValue(e.target.value);
	}, []);
	const onToggleModal = useCallback(() => {
		setLogsStore((store) => toggleDeleteModal(store));
	}, []);
	const { deleteLogStreamMutation } = useLogStream();
	const navigate = useNavigate();

	const onDeleteSuccess = useCallback(() => {
		onToggleModal();
		navigate('/');
	}, [])
	const [currentStream] = useAppStore((store) => store.currentStream);

	const handleDeleteStream = useCallback(() => {
		if (!currentStream) return;
		deleteLogStreamMutation({ deleteStream: currentStream , onSuccess: onDeleteSuccess});
	}, [currentStream]);

	return (
		<Modal
			withinPortal
			size="md"
			opened={deleteModalOpen}
			onClose={onToggleModal}
			title={'Delete Stream'}
			centered
			className={styles.modalStyle}
			styles={{ title: { fontWeight: 700 } }}>
			<TextInput
				type="text"
				label="Are you sure you want to delete this stream?"
				onChange={handleInputChange}
				placeholder={`Type the name of the stream to confirm. i.e. ${currentStream}`}
				required
				value={confirmInputValue}
			/>
			<Group mt={10} justify="right">
				<Button onClick={onToggleModal} className={styles.modalCancelBtn}>
					Cancel
				</Button>
				<Button
					className={styles.modalActionBtn}
					disabled={confirmInputValue === currentStream ? false : true}
					onClick={handleDeleteStream}>
					Delete
				</Button>
			</Group>
		</Modal>
	);
};

export default DeleteStreamModal;
