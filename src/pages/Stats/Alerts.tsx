import { useGetLogStreamAlert } from '@/hooks/useGetLogStreamAlert';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Modal, ScrollArea, Text, px } from '@mantine/core';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import { useAlertsStyles } from './styles';
import { IconArrowsMaximize } from '@tabler/icons-react';
import { Prism } from '@mantine/prism';
import useMountedState from '@/hooks/useMountedState';

const Alerts: FC = () => {
	useDocumentTitle('Parseable | Login');
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const { data, error, loading, getLogAlert, resetData } = useGetLogStreamAlert();
	const [opened, { open, close }] = useDisclosure(false);
	const [Alert, setAlert] = useMountedState({name: "Loading...."});

	useEffect(() => {
		getLogAlert(subLogQuery.get().streamName);
		return () => {
			resetData();
		};
	}, [subLogQuery]);
	

	const { classes } = useAlertsStyles();
	const { container, headContainer, alertsText, alertsContainer, alertContainer, expandButton } = classes;
	
	return (
		<Box className={container}>
			<Box className={headContainer}>
				<Text className={alertsText}>Alerts</Text>
			</Box>
			<Box className={alertsContainer}>
				{!loading
					? error
						? 'ERROR'
						: data
						? data.alerts.map((item: any,index:number) => {
								return (
									<Box className={alertContainer} key={item.name + index}>
										<Text>Name: {item.name}</Text>
										<Button className={expandButton} onClick={()=>
										{
											setAlert(item);
											open();
										}}>
											<IconArrowsMaximize size={px('1.2rem')} stroke={1.5} />
										</Button>
									</Box>
								);
						  })
						: 'Not found'
					: 'Loading'}
			</Box>
			<Modal size="auto" opened={opened} onClose={close} title={Alert.name} scrollAreaComponent={ScrollArea.Autosize}>
				<Prism  language="json">{JSON.stringify(Alert,null,2)}</Prism>
			</Modal>
		</Box>
	);
};


export default Alerts;
