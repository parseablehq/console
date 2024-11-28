import { useCallback } from 'react';
import { useLogStream } from '@/hooks/useLogStream';
import { useLogsStore, logsStoreReducers } from '../providers/LogsProvider';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useNavigate } from 'react-router-dom';
import DeleteOrResetModal from '@/components/Misc/DeleteOrResetModal';

const { toggleDeleteModal } = logsStoreReducers;

const DeleteStreamModal = () => {
	const [deleteModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.deleteModalOpen);

	const onCloseModal = useCallback(() => {
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
		<DeleteOrResetModal
			isModalOpen={deleteModalOpen}
			onClose={onCloseModal}
			modalHeader="Delete Stream"
			modalContent="Are you sure you want to delete this stream?"
			confirmationText={`${currentStream}`}
			type="delete"
			placeholder="Type the name of the stream"
			onConfirm={handleDeleteStream}
		/>
	);
};

export default DeleteStreamModal;
