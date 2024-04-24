import { Box, Button, Input, Modal, Stack, Text } from '@mantine/core';
import { FC, useCallback, useState } from 'react';
import styles from './styles/CreateStreamModal.module.css';
import { useLogStream } from '@/hooks/useLogStream';

type CreateStreamModalProps = {
	opened: boolean;
	close(): void;
};

const CreateStreamModal: FC<CreateStreamModalProps> = (props) => {
	const { opened, close } = props;
	const classes = styles;
	const [streamName, setStreamName] = useState<string>('');
	const { container, aboutTitle } = classes;

	const { createLogStreamMutation } = useLogStream();
	const { getLogStreamListRefetch } = useLogStream();

	const onSuccessCallback = useCallback(() => {
		close();
		setStreamName("");
		getLogStreamListRefetch();
	}, []);

	const onSubmit = useCallback(() => {
		createLogStreamMutation({ streamName, onSuccess: onSuccessCallback });
	}, [streamName]);

	return (
		<Modal opened={opened} onClose={close} withinPortal withCloseButton={false} size="md" centered padding={20}>
			<Stack className={container}>
				<Text className={aboutTitle}>Create Stream</Text>
				<Input value={streamName} onChange={(e) => setStreamName(e.target.value)} placeholder="Enter stream name" />
				<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
					<Box>
						<Button onClick={close} variant="outline">
							Cancel
						</Button>
					</Box>
					<Box>
						<Button disabled={streamName.length === 0} onClick={onSubmit}>
							Create
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default CreateStreamModal;
