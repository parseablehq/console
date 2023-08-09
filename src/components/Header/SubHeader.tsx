import { Box } from '@mantine/core';
import type { FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshInterval from './RefreshInterval';
import RefreshNow from './RefreshNow';
import Search from './Search';
import TimeRange from './TimeRange';
import { useLogQueryStyles } from './styles';
import ReloadUser from './ReloadUser';

export const StatsHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['Streams', 'streamName', 'Stats']} />
				</Box>
			</Box>

			<Box>
				<Box className={innerContainer}>
					<RefreshNow />
				</Box>
			</Box>
		</Box>
	);
};

export const QueryHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['Streams', 'streamName', 'Query']} />
				</Box>
			</Box>

			<Box>
				<Box className={innerContainer}>
					<TimeRange />
					<RefreshInterval />
				</Box>
			</Box>
		</Box>
	);
};

export const LogsHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['Streams', 'streamName', 'Logs']} />
				</Box>
			</Box>

			<Box>
				<Box className={innerContainer}>
					<Search />
					<RefreshNow />
					<TimeRange />
					<RefreshInterval />
				</Box>
			</Box>
		</Box>
	);
};

export const ConfigHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['Streams', 'streamName', 'Config']} />
				</Box>
			</Box>
		</Box>
	);
};

export const UsersManagementHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['User Management']} />
				</Box>
			</Box>
			<Box>
				<Box className={innerContainer}>
					<ReloadUser />
				</Box>
			</Box>
		</Box>
	);
};
