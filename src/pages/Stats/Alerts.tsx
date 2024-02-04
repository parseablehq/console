import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Modal, ScrollArea, Text, px } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect, useRef } from 'react';
import { IconArrowsMaximize } from '@tabler/icons-react';
import { Prism } from '@mantine/prism';
import useMountedState from '@/hooks/useMountedState';
import { heights } from '@/components/Mantine/sizing';
import { useAlertsEditor } from '@/hooks/useAlertsEditor';
import { useParams } from 'react-router-dom';
import alertStyles from './styles/Alerts.module.css'

const Alerts: FC = () => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const { streamName } = useParams();

	const { getLogAlertData, getLogAlertIsError, getLogAlertIsLoading } = useAlertsEditor(streamName || '');

	const [opened, { open, close }] = useDisclosure(false);
	const [Alert, setAlert] = useMountedState({ name: 'Loading....' });
	const AlertsWrapper = useRef<HTMLDivElement>(null);
	const [editorHeight, setEditorHeight] = useMountedState(0);

	useEffect(() => {
		setEditorHeight(AlertsWrapper.current?.offsetTop ? AlertsWrapper.current?.offsetTop + 15 : 0);
	}, [heights.full, AlertsWrapper]);

	const classes = alertStyles;
	const { container, headContainer, alertsText, alertsContainer, alertContainer, expandButton } = classes;

	return (
		<ScrollArea
			className={container}
			ref={AlertsWrapper}
			sx={{ height: `calc(${heights.full} - ${editorHeight}px) ` }}
			type="auto">
			<Box className={headContainer}>
				<Text className={alertsText}>Alerts</Text>
			</Box>
			<Box className={alertsContainer}>
				{!getLogAlertIsLoading ? (
					getLogAlertIsError ? (
						'ERROR'
					) : getLogAlertData?.data && getLogAlertData?.data.alerts.length > 0 ? (
						getLogAlertData?.data.alerts.map((item: any, index: number) => {
							return (
								<Box className={alertContainer} key={item.name + index}>
									<Text>Name: {item.name}</Text>
									<Button
										className={expandButton}
										onClick={() => {
											setAlert(item);
											open();
										}}>
										<IconArrowsMaximize size={px('1.2rem')} stroke={1.5} />
									</Button>
								</Box>
							);
						})
					) : (
						<Text m={'lg'}>No Alert set for {subLogQuery.get().streamName}</Text>
					)
				) : (
					'Loading'
				)}
			</Box>
			<Modal size="auto" opened={opened} onClose={close} title={Alert.name} scrollAreaComponent={ScrollArea.Autosize}>
				<Prism language="json">{JSON.stringify(Alert, null, 2)}</Prism>
			</Modal>
		</ScrollArea>
	);
};

export default Alerts;
