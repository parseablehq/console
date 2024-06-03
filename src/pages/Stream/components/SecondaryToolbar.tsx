import { Stack } from '@mantine/core';
import classes from '../styles/Toolbar.module.css';
import { STREAM_SECONDARY_TOOLBAR_HRIGHT } from '@/constants/theme';
import EventTimeLineGraph from './EventTimeLineGraph';

const SecondaryToolbar = () => {
	return (
		<Stack className={classes.logsSecondaryToolbar} style={{ height: STREAM_SECONDARY_TOOLBAR_HRIGHT }}>
			<EventTimeLineGraph />
		</Stack>
	);
};

export default SecondaryToolbar;
