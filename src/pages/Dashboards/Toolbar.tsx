import TimeRange from '@/components/Header/TimeRange';
import { Box, Button, Stack, Text } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import classes from './styles/toolbar.module.css';
import { useDashboardsStore } from './providers/DashboardsProvider';

const EditLayoutButton = () => {
	return (
		<Box>
			<Button className={classes.editLayoutBtn} variant="outline" leftSection={<IconPencil stroke={1.4} size="1rem" />}>
				Edit Layout
			</Button>
		</Box>
	);
};

const Toolbar = () => {
	const [dashboardName] = useDashboardsStore((store) => store.activeDashboard?.name);
	return (
		<Stack
			className={classes.toolbarContainer}
			style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
			w="100%">
			<Text className={classes.dashboardTitle}>{dashboardName}</Text>
			<Stack style={{ flexDirection: 'row' }}>
				<TimeRange />
				<EditLayoutButton />
			</Stack>
		</Stack>
	);
};

export default Toolbar;
