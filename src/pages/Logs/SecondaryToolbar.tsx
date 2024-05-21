import { Stack } from '@mantine/core';
import classes from './styles/Toolbar.module.css';
import { STREAM_SECONDARY_TOOLBAR_HRIGHT } from '@/constants/theme';
import EventTimeLineGraph from './EventTimeLineGraph';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const SecondaryToolbar = () => {
	const [maximized] = useAppStore((store) => store.maximized);

	return (
		<Stack className={classes.logsPrimaryToolbar} style={{ height: STREAM_SECONDARY_TOOLBAR_HRIGHT }}>
			<EventTimeLineGraph />
		</Stack>
	);
};

export default SecondaryToolbar;
