import { useGetLogStreamAlert } from '@/hooks/useGetLogStreamAlert';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Modal, ScrollArea, Text, px } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import { useAlertsStyles } from './styles';
import { IconArrowsMaximize } from '@tabler/icons-react';
import { Prism } from '@mantine/prism';
import useMountedState from '@/hooks/useMountedState';

const Alerts: FC = () => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const { data, error, loading, getLogAlert, resetData } = useGetLogStreamAlert();
	const [opened, { open, close }] = useDisclosure(false);
	const [Alert, setAlert] = useMountedState({ name: 'Loading....' });

	useEffect(() => {
		const subQueryListener = subLogQuery.subscribe((state) => {
			if (state.streamName) {
				if (data) {
					resetData();
				}
				getLogAlert(state.streamName);
			}
		});
		return () => {
			subQueryListener();
		};
	}, [data]);

	useEffect(() => {
		if (subLogQuery.get().streamName) {
			getLogAlert(subLogQuery.get().streamName);
		}
		return () => {
			resetData();
		};
	}, []);

	const { classes } = useAlertsStyles();
	const { container, headContainer, alertsText, alertsContainer, alertContainer, expandButton } = classes;

	return (
		<ScrollArea className={container}>
			<Box className={headContainer}>
				<Text className={alertsText}>Alerts</Text>
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
