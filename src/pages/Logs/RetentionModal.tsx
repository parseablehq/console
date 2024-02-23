import { Box, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useLogsPageContext } from './context';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { Editor } from '@monaco-editor/react';
import { useAlertsEditor } from '@/hooks/useAlertsEditor';
import { useRetentionEditor } from '@/hooks/useRetentionEditor';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>Retention</Text>;
};

const RententionModal = () => {
	const {
		state: { retentionModalOpen, currentStream },
		methods: { closeRetentionModal },
	} = useLogsPageContext();
	const { handleRetentionQueryChange, submitRetentionQuery, getLogRetentionData } = useRetentionEditor(currentStream);
	return (
		<Modal
			opened={retentionModalOpen}
			onClose={closeRetentionModal}
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle />}>
			<Stack style={{ padding: '1rem 0' }}>
				<Box style={{ height: '500px', padding: '1rem 1rem 1rem -2rem' }}>
					<Editor
						onChange={handleRetentionQueryChange}
						value={JSON.stringify(getLogRetentionData?.data, null, 2)}
						defaultLanguage="json"
						options={{
							scrollBeyondLastLine: false,
							readOnly: false,
							fontSize: 12,
							wordWrap: 'on',
							minimap: { enabled: false },
							automaticLayout: true,
							mouseWheelZoom: true,
							glyphMargin: true,
						}}
					/>
				</Box>
				<Stack style={{ alignItems: 'flex-end' }}>
					<Button className={classes.submitBtn} onClick={submitRetentionQuery}>
						Submit
					</Button>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default RententionModal;
