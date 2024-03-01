import { Box, Button, Modal, Stack, Switch } from '@mantine/core';
import { useLogsPageContext } from './logsContextProvider';
import { Text } from '@mantine/core';
import classes from './styles/Logs.module.css';
import { Editor } from '@monaco-editor/react';
import { useCallback } from 'react';

const ModalTitle = () => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>Settings</Text>;
};

type RetentionModalProps = {
	data: any;
	handleChange: (value: string | undefined) => void;
	handleSubmit: () => void;
	handleCacheToggle: () => void;
	isCacheEnabled: boolean;
};

const RententionModal = (props: RetentionModalProps) => {
	const {
		state: { retentionModalOpen },
		methods: { closeRetentionModal },
	} = useLogsPageContext();
	const { isCacheEnabled, handleCacheToggle } = props;
	const switchStyles = {
		track: isCacheEnabled ? classes.trackStyle : {},
	};

	const onSubmit = useCallback(() => {
		props.handleSubmit();
		closeRetentionModal();
	}, []);

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
						onChange={props.handleChange}
						value={JSON.stringify(props.data, null, 2)}
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
