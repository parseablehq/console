import { Box, Button, Modal, Stack } from '@mantine/core';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { Editor } from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';
import { useAlertsEditor, useGetAlerts } from '@/hooks/useAlertsEditor';
import { notifyError } from '@/utils/notification';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore, logsStoreReducers } from './providers/LogsProvider';
import _ from 'lodash';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>Alerts</Text>;
};

const { toggleAlertsModal } = logsStoreReducers;

const AlertsModal = () => {
	const [alertConfig, setAlertConfig] = useState<string | undefined>('');
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [alertsModalOpen, setLogsStore] = useLogsStore((store) => store.modalOpts.alertsModalOpen);

	const onToggleModal = useCallback(() => {
		setLogsStore((store) => toggleAlertsModal(store));
	}, []);

	const onSubmit = useCallback(() => {
		if (alertConfig) {
			let parsedConfig;
			try {
				parsedConfig = JSON.parse(alertConfig);
			} catch (e) {
				return notifyError({ message: 'Unable to parse config' });
			}
			updateLogStreamAlerts({ config: parsedConfig, onSuccess: onToggleModal });
		} else {
			return notifyError({ message: 'Unable to parse config' });
		}
	}, [alertConfig]);

	const { getLogAlertData = null } = !currentStream ? {} : useGetAlerts(currentStream);
	const { updateLogStreamAlerts = _.noop } = !currentStream ? {} : useAlertsEditor(currentStream);

	useEffect(() => {
		if (getLogAlertData?.data) {
			setAlertConfig(JSON.stringify(getLogAlertData?.data, null, 2));
		}
	}, [getLogAlertData?.data]);

	return (
		<Modal
			opened={alertsModalOpen}
			onClose={onToggleModal}
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle />}>
			<Stack style={{ padding: '1rem 0' }}>
				<Box style={{ height: '500px', padding: '1rem 1rem 1rem -2rem' }}>
					<Editor
						onChange={setAlertConfig}
						value={alertConfig}
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
					<Button className={classes.submitBtn} onClick={onSubmit}>
						Submit
					</Button>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default AlertsModal;
