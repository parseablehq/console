import { Box, Button, Modal, Stack, Switch } from '@mantine/core';
import { useLogsPageContext } from './logsContextProvider';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { Editor } from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';
import { useCacheToggle } from '@/hooks/useCacheToggle';
import { useGetRetention, useRetentionEditor } from '@/hooks/useRetentionEditor';
import { notifyError } from '@/utils/notification';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>Settings</Text>;
};

const RententionModal = () => {
	const [retentionConfig, setRetentionConfig] = useState<string | undefined>('');
	const {
		state: { retentionModalOpen, currentStream },
		methods: { closeRetentionModal },
	} = useLogsPageContext();
	const { handleCacheToggle, isCacheEnabled } = useCacheToggle(currentStream);

	const { getLogRetentionData } = useGetRetention(currentStream);
	const {updateLogStreamRetention} = useRetentionEditor(currentStream);

	const switchStyles = {
		track: isCacheEnabled ? classes.trackStyle : {},
	};

	const onSubmit = useCallback(() => {
		if (retentionConfig) {
			let parsedConfig;
			try {
				parsedConfig = JSON.parse(retentionConfig);
			} catch (e) {
				return notifyError({ message: 'Unable to parse config' });
			}
			updateLogStreamRetention(parsedConfig);
		} else {
			return notifyError({ message: 'Unable to parse config' });
		}
	}, [retentionConfig]);

	useEffect(() => {
		if (getLogRetentionData?.data) {
			setRetentionConfig(JSON.stringify(getLogRetentionData?.data, null, 2));
		}
	}, [getLogRetentionData?.data]);

	return (
		<Modal
			opened={retentionModalOpen}
			onClose={closeRetentionModal}
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle />}>
			<Stack style={{ padding: '1rem 1rem' }}>
				<Stack style={{ width: '100%' }}>
					<Text style={{ fontSize: '1rem', fontWeight: 600 }}>Allow Cache</Text>
					<Switch
						checked={isCacheEnabled}
						labelPosition="left"
						onChange={handleCacheToggle}
						label={isCacheEnabled ? 'Enabled' : 'Disabled'}
						styles={switchStyles}
					/>
				</Stack>
				<Text style={{ fontSize: '1rem', fontWeight: 600 }}>Retention</Text>
				<Box style={{ height: '400px', margin: '0rem 0rem 1rem -1.2rem' }}>
					<Editor
						onChange={setRetentionConfig}
						value={retentionConfig}
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

export default RententionModal;
