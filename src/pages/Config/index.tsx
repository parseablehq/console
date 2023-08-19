import { Accordion, Box, Button } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import Editor from '@monaco-editor/react';
import { FC, useEffect } from 'react';
import { useConfigStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';
import { usePutLogStreamAlerts } from '@/hooks/usePutLogStreamAlerts';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { usePutLogStreamRetention } from '@/hooks/usePutLogStreamRetention';

const Config: FC = () => {
	useDocumentTitle('Parseable | Config');
	const [alertQuery, setAlertQuery] = useMountedState<string>('');
	const [retentionQuery, setRetentionQuery] = useMountedState<string>('');
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const {
		data: resultAlertsData,
		error: alertError,
		loading: alertLoading,
		putAlertsData,
		resetData: resetAlertData,
	} = usePutLogStreamAlerts();
	const {
		data: resultRetentionData,
		error: retentionError,
		loading: retentionLoading,
		putRetentionData,
		resetData: resetRetentionData,
	} = usePutLogStreamRetention();
	const handleAlertQueryEditorChange = (code: any) => {
		setAlertQuery(code);
	};
	const handleRetentionQueryEditorChange = (code: any) => {
		setRetentionQuery(code);
	};

	const onSubmitAlertQuery = () => {
		let alertQueryObj = {};
		try {
			alertQueryObj = JSON.parse(alertQuery);
		} catch (e) {
			notifications.show({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${e}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
			return;
		}
		putAlertsData(subLogQuery.get().streamName, alertQueryObj);
	};
	const onSubmitRetentionQuery = () => {
		let retentionQueryObj = {};
		try {
			retentionQueryObj = JSON.parse(retentionQuery);
		} catch (e) {
			notifications.show({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${e}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
			return;
		}
		putRetentionData(subLogQuery.get().streamName, retentionQueryObj);
	};

	useEffect(() => {
		if (alertLoading) {
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Running Query',
				message: 'Alert will be Added.',
				autoClose: false,
				withCloseButton: false,
			});
		}
		if (resultAlertsData) {
			notifications.update({
				id: 'load-data',
				loading: false,
				color: 'green',
				title: 'Success',
				message: 'Alert Added.',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
			resetAlertData();
		}
		if (alertError) {
			notifications.update({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${alertError}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
			resetAlertData();
		}
	}, [resultAlertsData, alertError, alertLoading]);

	useEffect(() => {
		if (retentionLoading) {
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Running Query',
				message: 'Retention will be Added.',
				autoClose: false,
				withCloseButton: false,
			});
		}
		if (resultRetentionData) {
			notifications.update({
				id: 'load-data',
				loading: false,
				color: 'green',
				title: 'Success',
				message: 'Retention Added.',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
			resetRetentionData();
		}
		if (retentionError) {
			notifications.update({
				id: 'load-data',
				loading: false,
				color: 'red',
				title: 'Error occurred',
				message: `Error occurred, please check your query and try again ${retentionError}`,
				icon: <IconFileAlert size="1rem" />,
				autoClose: 3000,
			});
			resetRetentionData();
		}
	}, [resultRetentionData, retentionError, retentionLoading]);

	const { classes } = useConfigStyles();
	const { container, submitBtn, accordionSt, innerContainer } = classes;
	return (
		<Box className={container}>
			<Box className={innerContainer}>
				<Accordion defaultValue="" variant="contained" radius="md" w={'90%'} className={accordionSt}>
					<Accordion.Item value="Alert">
						<Accordion.Control>Alert</Accordion.Control>
						<Accordion.Panel>
							<Box>
								<Box sx={{ height: '500px' }}>
									<Editor
										onChange={handleAlertQueryEditorChange}
										value={alertQuery}
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
								<Button className={submitBtn} onClick={onSubmitAlertQuery}>
									Submit
								</Button>
							</Box>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Box>
			{!subLogQuery.get().access?.some((access: string) => ['PutRetention'].includes(access)) ? null : (
				<Box className={innerContainer}>
					<Accordion defaultValue="" variant="contained" radius="md" w={'90%'} className={accordionSt}>
						<Accordion.Item value="Retention">
							<Accordion.Control>Retention</Accordion.Control>
							<Accordion.Panel>
								<Box>
									<Box sx={{ height: '500px' }}>
										<Editor
											onChange={handleRetentionQueryEditorChange}
											value={retentionQuery}
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
									<Button className={submitBtn} onClick={onSubmitRetentionQuery}>
										Submit
									</Button>
								</Box>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</Box>
			)}
		</Box>
	);
};

export default Config;
