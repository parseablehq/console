import { Box } from '@mantine/core';
import type { FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshInterval from './RefreshInterval';
import Search from './Search';
import TimeRange from './TimeRange';
import classes from './LogQuery.module.css';
import DocsUser from './UserDocs';
import Reload from './Reload';

export const StatsHeader: FC = () => {
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['Management', 'streamName']} />
				</Box>
			</Box>

			<Box>
				<Box className={innerContainer}>
					<Reload />
				</Box>
			</Box>
		</Box>
	);
};

export const QueryHeader: FC = () => {
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['SQL', 'streamName']} />
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
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['Logs', 'streamName']} />
				</Box>
			</Box>

			<Box>
				<Box className={innerContainer}>
					<Search />
					{/* <Reload /> */}
					{/* <LimitLog /> */}

					<TimeRange />
					<RefreshInterval />
				</Box>
			</Box>
		</Box>
	);
};

export const ConfigHeader: FC = () => {
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['streamName', 'Config']} />
				</Box>
			</Box>
		</Box>
	);
};

export const AllRouteHeader: FC = () => {
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={[]} />
				</Box>
			</Box>
			<Box className={innerContainer}>
				<Reload />
			</Box>
		</Box>
	);
};

// completed

export const UsersManagementHeader: FC = () => {
	const { container, innerContainer } = classes;

	return (
		<Box className={container}>
			<Box className={innerContainer}>
				<HeaderBreadcrumbs crumbs={['Team']} />
			</Box>

			<Box className={innerContainer}>
				<Reload />
				<DocsUser />
			</Box>
		</Box>
	);
};
