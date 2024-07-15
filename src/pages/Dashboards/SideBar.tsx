import { DASHBOARDS_SIDEBAR_WIDTH } from '@/constants/theme';
import { Button, Stack, Text } from '@mantine/core';
import classes from './styles/sidebar.module.css';
import { IconPlus } from '@tabler/icons-react';
import { Dashboard, useDashboardsStore } from './providers/DashboardsProvider';
import { useEffect, useState } from 'react';
import _ from 'lodash';

interface DashboardItemProps extends Dashboard {
	activeDashboardId: undefined | string;
}
const DashboardListItem = (props: DashboardItemProps) => {
	const { name, id, pinned, tiles, activeDashboardId } = props;
	const totalTiles = _.size(tiles);
	const isActive = id === activeDashboardId;
	return (
		<Stack gap={0} className={`${classes.dashboardItem} ${isActive ? classes.active : ''}`}>
			<Text className={classes.dashboardTitle} lineClamp={1}>{name}</Text>
			<Text className={classes.tilesCountText}>{`${totalTiles} Tile${totalTiles > 1 ? 's' : ''}`}</Text>
		</Stack>
	);
};

const DashboardList = () => {
	const [dashboards] = useDashboardsStore((store) => store.dashboards);
	const [activeDashboardId] = useDashboardsStore(store => store.activeDashboard?.id)
	// useEffect(() => {
	// 	const { pinned, unpinned } = _.reduce(
	// 		dashboards,
	// 		(acc: { pinned: Dashboard[]; unpinned: Dashboard[] }, dashboard: Dashboard) => {
	// 			const { pinned, unpinned } = acc;
	// 			if (dashboard.pinned) {
	// 				return { pinned: [...pinned, dashboard], unpinned };
	// 			} else {
	// 				return { pinned, unpinned: [...unpinned, dashboard] };
	// 			}
	// 		},
	// 		{ pinned: [], unpinned: [] },
	// 	);

	// }, [dashboards]);
	return (
		<Stack style={{}}>
			{_.map(dashboards, (dashboard) => {
				return <DashboardListItem {...dashboard} activeDashboardId={activeDashboardId}/>;
			})}
		</Stack>
	);
};

const SideBar = () => {
	return (
		<Stack style={{ width: DASHBOARDS_SIDEBAR_WIDTH }} className={classes.container}>
			<Button variant="light" leftSection={<IconPlus stroke={2} size="1rem" />} style={{margin: '1rem', marginBottom: 0}}>
				New Dashboard
			</Button>
			<DashboardList />
		</Stack>
	);
};

export default SideBar;
