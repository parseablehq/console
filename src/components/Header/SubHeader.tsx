import { Box, Stack, px } from '@mantine/core';
import { type FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshInterval from './RefreshInterval';
import RefreshNow from './RefreshNow';
import Search from './Search';
import TimeRange from './TimeRange';
import ReloadUser from './ReloadUser';
import DocsUser from './UserDocs';
import StreamingButton from './StreamingButton';
import LiveTailFilter from './LiveTailFilter';
import Dropdown from './Dropdown';
import { HEADER_HEIGHT } from '@/constants/theme';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import { useLogsPageContext } from '@/pages/Logs/Context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ToggleButton } from '../Button/ToggleButton';
import { IconCodeCircle } from '@tabler/icons-react';
import styles from './styles/LogQuery.module.css';
import headerStyles from './styles/Header.module.css';
import Querier from './Querier';

type HeaderLayoutProps = {
	children: React.ReactNode;
	rows?: 1;
};

const HeaderLayout: FC<HeaderLayoutProps> = (props) => {
	const classes = headerStyles;
	const { container, navContainer } = classes;

	return (
		<Box className={container} style={{ height: HEADER_HEIGHT * (props.rows || 1), zIndex: 100 }} p={0}>
			<Box className={navContainer}>{props.children}</Box>
		</Box>
	);
};

export const StatsHeader: FC = () => {
	const classes = styles;
	const { container, innerContainer } = classes;
	const {
		methods: { resetTimeInterval },
	} = useHeaderContext();
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
						<RefreshNow onRefresh={resetTimeInterval} />
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
	);
};

export const LiveTailHeader: FC = () => {
	const classes = styles;
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
	const classes = styles;
	const { container, innerContainer } = classes;
	const {
		methods: { makeExportData, toggleShowQueryEditor },
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
		},
	} = useLogsPageContext();
	const {
		state: { subLogQuery },
		methods: { resetTimeInterval },
	} = useHeaderContext();
	const exportHandler = (fileType: string | null) => {
		const query = subLogQuery.get();
		const filename = `${query.streamName}-logs`;
		if (fileType === 'CSV') {
			downloadDataAsCSV(makeExportData('CSV'), filename);
		} else if (fileType === 'JSON') {
			downloadDataAsJson(makeExportData('JSON'), filename);
		}
	};
	return (
		<>
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
							<ToggleButton
								onClick={toggleShowQueryEditor}
								toggled={isQuerySearchActive && mode === 'sql'}
								renderIcon={() => <IconCodeCircle size={px('1.2rem')} stroke={1.5} />}
								label="SQL"
							/>
							<TimeRange />
							<RefreshInterval />
							<Dropdown data={['JSON', 'CSV']} onChange={exportHandler} />
							<RefreshNow onRefresh={resetTimeInterval} />
						</Box>
					</Box>
				</Box>
			</HeaderLayout>
			<HeaderLayout>
				<Box className={container}>
					<Box className={innerContainer}>
						<Stack style={{width: "100%", flexDirection: 'row'}}>
							<Querier/>
						</Stack>
					</Box>
				</Box>
			</HeaderLayout>
		</>
	);
};

export const HomeHeader: FC = () => {
	const classes = styles;
	const { container, innerContainer } = classes;
	return (
		<Box className={container}>
			<Box>
				<Box className={innerContainer}>
					<HeaderBreadcrumbs crumbs={['My Streams']} />
				</Box>
			</Box>
		</Box>
	);
};

export const ConfigHeader: FC = () => {
	const classes = styles;
	const { container, innerContainer } = classes;

	return (
		<HeaderLayout>
			<Box className={container}>
				<Box>
					<Box className={innerContainer}>
						<HeaderBreadcrumbs crumbs={['Streams', 'streamName', 'Config']} />
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
	);
};

export const UsersManagementHeader: FC = () => {
	const classes = styles;
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
	const classes = styles;
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
