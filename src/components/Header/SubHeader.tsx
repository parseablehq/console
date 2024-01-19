import { Box, Header as MantineHeader } from '@mantine/core';
import type { FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshInterval from './RefreshInterval';
import RefreshNow from './RefreshNow';
import Search from './Search';
import TimeRange from './TimeRange';
import { useLogQueryStyles } from './styles';
import ReloadUser from './ReloadUser';
import DocsUser from './UserDocs';
import StreamingButton from './StreamingButton';
import LiveTailFilter from './LiveTailFilter';
import Dropdown from './Dropdown';
import { useHeaderStyles } from './styles';
import { HEADER_HEIGHT } from '@/constants/theme';
import { useExportData } from '@/hooks/useExportData';

type HeaderLayoutProps = {
	children: React.ReactNode;
};

const HeaderLayout: FC<HeaderLayoutProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, navContainer } = classes;

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} p={0} withBorder zIndex={100}>
			<Box className={navContainer}>{props.children}</Box>
		</MantineHeader>
	);
};

export const StatsHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<HeaderLayout>
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
		</HeaderLayout>
	);
};

export const QueryHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<HeaderLayout>
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
		</HeaderLayout>
	);
};

export const LiveTailHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<HeaderLayout>
			<Box className={container}>
				<Box>
					<Box className={innerContainer}>
						<HeaderBreadcrumbs crumbs={['Streams', 'streamName', 'Live tail']} />
					</Box>
				</Box>

				<Box>
					<Box className={innerContainer}>
						<LiveTailFilter />
						<StreamingButton />
						{/* <TimeRange /> */}
						{/* <RefreshInterval /> */}
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
	);
};

export const LogsHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;
	const { exportLogsHandler } = useExportData();

	return (
		<HeaderLayout>
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
						{/* <LimitLog /> */}

						<TimeRange />
						<RefreshInterval />
						<Dropdown data={['JSON', 'CSV']} onChange={exportLogsHandler} />
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
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
		<HeaderLayout>
			<Box className={container}>
				<Box>
					<Box className={innerContainer}>
						<HeaderBreadcrumbs crumbs={['User Management']} />
					</Box>
				</Box>
				<Box>
					<Box className={innerContainer}>
						<ReloadUser />
						<DocsUser />
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
	);
};

export const AllRouteHeader: FC = () => {
	const { classes } = useLogQueryStyles();
	const { container, innerContainer } = classes;

	return (
		<HeaderLayout>
			<Box className={container}>
				<Box>
					<Box className={innerContainer}>
						<HeaderBreadcrumbs crumbs={[]} />
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
	);
};
