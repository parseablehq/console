import { useDeleteLogStream } from '@/hooks/useDeleteLogStream';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Button, Group, TextInput } from '@mantine/core';


import { useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

type DeleteStreamProps = {
	closeDelete: () => void;
};

const DeleteStream: FC<DeleteStreamProps> = ({ closeDelete }) => {
	const {
		state: { subAppContext },
	} = useHeaderContext();

	const navigate = useNavigate();

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
		</>
	);
};

export default DeleteStream;
