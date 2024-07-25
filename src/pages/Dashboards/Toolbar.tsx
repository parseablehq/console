import TimeRange from '@/components/Header/TimeRange';
import { Box, Button, Stack, Text } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import classes from './styles/toolbar.module.css';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback } from 'react';

const {toggleEditDashboardModal} = dashboardsStoreReducers;

const EditLayoutButton = () => {
	const [createTileFormOpen] = useDashboardsStore(store => store.createTileFormOpen)
	return (
		<Box>
			<Button
				disabled={createTileFormOpen}
				className={classes.editLayoutBtn}
				variant="outline"
				leftSection={<IconPencil stroke={1.4} size="1rem" />}>
				Edit Layout
			</Button>
		</Box>
	);
};

const Toolbar = () => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const openEditDashboardModal = useCallback(() => {
		setDashbaordsStore((store) => toggleEditDashboardModal(store, true))
	}, [])

	if (!activeDashboard) return null;

	const {name, description} = activeDashboard;
	return (
		<Stack
			className={classes.toolbarContainer}
			style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
			w="100%">
			<Stack gap={0}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={0}>
					<Text className={classes.dashboardTitle} lineClamp={1}>{name}</Text>
					<Stack className={classes.editIcon} onClick={openEditDashboardModal}>
						<IconPencil stroke={1.2} size="1rem" />
					</Stack>
				</Stack>
				<Text className={classes.dashboardDescription} lineClamp={1}>{description}</Text>
			</Stack>
			<Stack style={{ flexDirection: 'row' }}>
				<TimeRange />
				<EditLayoutButton />
			</Stack>
		</Stack>
	);
};

export default Toolbar;
