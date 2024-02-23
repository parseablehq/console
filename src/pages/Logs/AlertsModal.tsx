import { Box, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useLogsPageContext } from './context';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { Editor } from '@monaco-editor/react';
import { useAlertsEditor } from '@/hooks/useAlertsEditor';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>Alerts</Text>;
};

const AlertsModal = () => {
	const {
		state: { alertsModalOpen, currentStream },
		methods: { closeAlertsModal },
	} = useLogsPageContext();
	const { handleAlertQueryChange, submitAlertQuery, getLogAlertData } = useAlertsEditor(currentStream);

	return (
		<Modal
			opened={alertsModalOpen}
			onClose={closeAlertsModal}
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle />}>
			<Stack style={{ padding: '1rem 0' }}>
				<Box style={{ height: '500px', padding: '1rem 1rem 1rem -2rem' }}>
					<Editor
						onChange={handleAlertQueryChange}
						value={JSON.stringify(getLogAlertData?.data, null, 2)}
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
				<Stack style={{alignItems: 'flex-end'}}>
					<Button className={classes.submitBtn} onClick={submitAlertQuery}>
						Submit
					</Button>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default AlertsModal;
