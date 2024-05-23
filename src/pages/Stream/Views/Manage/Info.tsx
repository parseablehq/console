import { Loader, Stack, Text } from '@mantine/core';
import classes from '../../styles/Management.module.css';
import { useStreamStore } from '../../providers/StreamProvider';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import dayjs from 'dayjs';

const Header = () => {
	return (
		<Stack className={classes.headerContainer}>
			<Text className={classes.title}>Info</Text>
		</Stack>
	);
};

const InfoItem = (props: { title: string; value: string }) => {
	return (
		<Stack w="33%" gap={0}>
			<Text className={classes.fieldDescription}>{props.title}</Text>
			<Text className={classes.fieldTitle}>{props.value}</Text>
		</Stack>
	);
};

const InfoData = (props: {isLoading: boolean}) => {
	const [info] = useStreamStore((store) => store.info);
	const [currentStream] = useAppStore((store) => store.currentStream);
	return (
		<Stack style={{ flex: 1, padding: '1.5rem' }} gap={20}>
			{props.isLoading ? (
				<Stack style={{ flex: 1, width: '100%', alignItems: 'centrer', justifyContent: 'center' }}>
					<Stack style={{ alignItems: 'center' }}>
						<Loader />
					</Stack>
				</Stack>
			) : (
				<>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Name" value={currentStream || ''} />
						<InfoItem title="Created At" value={dayjs(info['created-at']).format('HH:mm A DD MMM YYYY')} />
						<InfoItem title="First Event At" value={dayjs(info['first-event-at']).format('HH:mm A DD MMM YYYY')} />
					</Stack>
					<Stack gap={0} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<InfoItem title="Time Partition" value={info['time_partition'] || '-'} />
						<InfoItem
							title="Schema Type"
							value={
								info['static_schema_flag'] === true ? 'Static' : info['static_schema_flag'] === false ? 'Dynamic' : '-'
							}
						/>
						<Stack w="33%" />
					</Stack>
				</>
			)}
		</Stack>
	);
};

const Info = (props: {isLoading: boolean}) => {
	return (
		<Stack className={classes.sectionContainer} gap={0}>
			<Header />
			<InfoData isLoading={props.isLoading}/>
		</Stack>
	);
};

export default Info;
