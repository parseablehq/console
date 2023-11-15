import { useDeleteLogStream } from '@/hooks/useDeleteLogStream';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ActionIcon, Button, Group, Modal, TextInput, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteStream: FC = () => {
	const {
		state: { subAppContext },
	} = useHeaderContext();

	const navigate = useNavigate();

	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure(false);
	const [deleteStream, setDeleteStream] = useMountedState('');
	const { data: deleteData, deleteLogStreamFun } = useDeleteLogStream();
	const [activeStream, setActiveStream] = useMountedState(subAppContext.get().selectedStream ?? '');

	useEffect(() => {
		const subAppContextListener = subAppContext.subscribe((value) => {
			if (value.selectedStream) {
				setActiveStream(value.selectedStream);
			}
		});
		return () => {
			subAppContextListener();
		};
	}, []);

	useEffect(() => {
		if (deleteData) {
			navigate(0);
		}
	}, [deleteData]);

	const handleCloseDelete = () => {
		closeDelete();
		setDeleteStream('');
	};
	const handleDelete = () => {
		deleteLogStreamFun(deleteStream);
		setDeleteStream('');
		closeDelete();
	};

	return (
		<>
			<Tooltip label="Refresh" withArrow onClick={openDelete} position="left">
				<ActionIcon variant="default" radius={'md'} size={'lg'}>
					<IconTrash stroke={1.5} />
				</ActionIcon>
			</Tooltip>
			<Modal withinPortal size="md" opened={openedDelete} onClose={handleCloseDelete} title={'Delete Stream'} centered>
				<TextInput
					type="text"
					label="Are you sure you want to delete this stream?"
					onChange={(e) => {
						setDeleteStream(e.target.value);
					}}
					placeholder={`Type the name of the stream to confirm. i.e. ${activeStream}`}
					required
				/>

				<Group mt={10} justify="right">
					<Button disabled={deleteStream === activeStream ? false : true} onClick={handleDelete} color="green.9">
						Delete
					</Button>
					<Button onClick={handleCloseDelete} variant="default">
						Cancel
					</Button>
				</Group>
			</Modal>
		</>
	);
};

export default DeleteStream;
