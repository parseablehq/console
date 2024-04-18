import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useLogsPageContext } from './logsContextProvider';
import styles from './styles/Logs.module.css';
import { useCallback, useState } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useNavigate } from 'react-router-dom';

const DeleteStreamModal = () => {
	const {
		state: { deleteModalOpen, currentStream },
		methods: { closeDeleteModal },
	} = useLogsPageContext();
	const [confirmInputValue, setConfirmInputValue] = useState<string>('');
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setConfirmInputValue(e.target.value);
	}, []);

	const { deleteLogStreamMutation } = useLogStream();
	const navigate = useNavigate();

	const onDeleteSuccess = useCallback(() => {
		closeDeleteModal();
		navigate('/');
	}, [])

	const handleDeleteStream = useCallback(() => {
		deleteLogStreamMutation({ deleteStream: currentStream, onSuccess: onDeleteSuccess });
	}, [currentStream]);

	return (
		<Modal
			withinPortal
			size="md"
			opened={deleteModalOpen}
			onClose={closeDeleteModal}
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
				<Button onClick={closeDeleteModal} className={styles.modalCancelBtn}>
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
