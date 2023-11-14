import { useGetLogStreamAlert } from '@/hooks/useGetLogStreamAlert';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ActionIcon, Box, Button, Group, Modal, ScrollArea, Text, px } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import classes from './Alerts.module.css';
import { IconArrowsMaximize, IconCheck, IconEdit, IconFileAlert } from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';
import useMountedState from '@/hooks/useMountedState';
import Editor from '@monaco-editor/react';
import { notifications } from '@mantine/notifications';
import { usePutLogStreamAlerts } from '@/hooks/usePutLogStreamAlerts';

const Alerts: FC = () => {
	const {
		state: { subAppContext },
	} = useHeaderContext();
	const { data, error, loading, getLogAlert, resetData } = useGetLogStreamAlert();
	const [alertQuery, setAlertQuery] = useMountedState<string>('');
	const [opened, { open, close }] = useDisclosure(false);
	const [Alert, setAlert] = useMountedState({ name: 'Loading....' });
	const [openedAlert, { open: openAlert, close: closeAlert }] = useDisclosure(false);
	const {
		data: resultAlertsData,
		error: alertError,
		loading: alertLoading,
		putAlertsData,
		resetData: resetAlertData,
	} = usePutLogStreamAlerts();

	useEffect(() => {
		const subQueryListener = subAppContext.subscribe((state) => {
			if (state.selectedStream) {
				if (data) {
					resetData();
				}
				getLogAlert(state.selectedStream);
			}
		});
		return () => {
			subQueryListener();
		};
	}, []);

	useEffect(() => {
		if (data) {
			setAlertQuery(JSON.stringify(data, null, 2));
		}
	}, [data]);

	useEffect(() => {
		if (subAppContext.get().selectedStream) {
			getLogAlert(subAppContext.get().selectedStream ?? '');
		}
		return () => {
			resetData();
		};
	}, []);

	const handleAlertQueryEditorChange = (code: any) => {
		setAlertQuery(code);
	};

	const onCloseAlert = () => {
		setAlertQuery(JSON.stringify(data, null, 2));
		closeAlert();
	}

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
		putAlertsData(subAppContext.get().selectedStream ?? '', alertQueryObj);
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
			getLogAlert(subAppContext.get().selectedStream ?? '');
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

	const { container, headContainer, alertsText, alertsContainer, alertContainer } = classes;

	return (
		<ScrollArea className={container}>
			<Box className={headContainer}>
				<Text className={alertsText}>Alerts</Text>
				<ActionIcon variant="outline" color="brandSecondary" onClick={openAlert}>
					<IconEdit size={px('1.2rem')} stroke={1.5} />
				</ActionIcon>
			</Box>
			<Box className={alertsContainer}>
				{!loading ? (
					error ? (
						'ERROR'
					) : data && data.alerts.length > 0 ? (
						data.alerts.map((item: any, index: number) => {
							return (
								<Box className={alertContainer} key={item.name + index}>
									<Text>Name: {item.name}</Text>
									<ActionIcon
										variant="outline"
										color="gray.6"
										onClick={() => {
											setAlert(item);
											open();
										}}>
										<IconArrowsMaximize size={px('1.2rem')} stroke={1.5} />
									</ActionIcon>
								</Box>
							);
						})
					) : (
						<Text m={'lg'}>No Alert set for {subAppContext.get().selectedStream}</Text>
					)
				) : (
					'Loading'
				)}
			</Box>
			<Modal size="auto" opened={opened} onClose={close} title={Alert.name} scrollAreaComponent={ScrollArea.Autosize}>
				<CodeHighlight code={JSON.stringify(Alert, null, 2)} language="json" />
			</Modal>
			<Modal
				opened={openedAlert}
				onClose={onCloseAlert}
				title={'Edited Alerts'}
				fullScreen
				scrollAreaComponent={ScrollArea.Autosize}>
				<Box>
					<Box >
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
					<Group justify="right" mt={10}>
						<Button color="green" onClick={onSubmitAlertQuery}>
							Submit
						</Button>
						<Button color="red" onClick={onCloseAlert}>
							Cancel
						</Button>
					</Group>
				</Box>
			</Modal>
		</ScrollArea>
	);
};

export default Alerts;
