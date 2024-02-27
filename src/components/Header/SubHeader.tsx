import { Box, Group, Menu, Modal, Stack, Text, px } from '@mantine/core';
import { type FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshInterval from './RefreshInterval';
import RefreshNow from './RefreshNow';
import TimeRange from './TimeRange';
import ReloadUser from './ReloadUser';
import DocsUser from './UserDocs';
import StreamingButton from './StreamingButton';
import LiveTailFilter from './LiveTailFilter';
import { HEADER_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT } from '@/constants/theme';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import { useLogsPageContext } from '@/pages/Logs/context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ToggleButton } from '../Button/ToggleButton';
import { IconChevronDown, IconCodeCircle, IconDownload, IconFilter, IconMaximize } from '@tabler/icons-react';
import styles from './styles/LogQuery.module.css';
import headerStyles from './styles/Header.module.css';
import { useStatsPageContext } from '@/pages/Stats/Context';
import IconButton from '../Button/IconButton';

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
		methods: { resetFetchStartTime },
	} = useStatsPageContext();
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
						<RefreshNow onRefresh={resetFetchStartTime} />
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

const renderExportIcon = () => <IconDownload size={px('1.4rem')} stroke={1.5} />;
const renderMaximizeIcon = () => <IconMaximize size={px('1.4rem')} stroke={1.5} />;

const FilterPlaceholder = () => {
	const classes = styles;
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to add filter
		</Group>
	);
};

const SQLEditorPlaceholder = () => {
	const classes = styles;
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconCodeCircle size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to write query
		</Group>
	);
};

const ModalTitle = ({ title }: { title: string }) => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>{title}</Text>;
};

const QuerierModal = () => {
	const {
		methods: { toggleBuilderModal },
		state: {
			custQuerySearchState: { mode },
			builderModalOpen,
		},
	} = useLogsPageContext();
	return (
		<Modal
			opened={builderModalOpen}
			onClose={toggleBuilderModal}
			size="auto"
			centered
			styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			title={<ModalTitle title={getLabel(mode)} />}></Modal>
	);
};

const getLabel = (mode: string | null) => {
	return mode === 'filters' ? 'Filters' : mode === 'sql' ? 'SQL' : '';
};

const Chooser = () => {
	const classes = styles;
	const {
		methods: { toggleCustQuerySearchMode, toggleBuilderModal },
		state: {
			custQuerySearchState: { mode },
		},
	} = useLogsPageContext();
	return (
		<Stack className={classes.filterContainer} gap={0}>
			<Menu position="bottom">
				<Menu.Target>
					<div style={{ width: 'fit-content' }}>
						<ToggleButton
							onClick={() => {}}
							toggled={false}
							renderIcon={() => <IconChevronDown size={px('1.2rem')} stroke={1.5} />}
							label={getLabel(mode)}
							iconPosition="right"
							customClassName={classes.modeButton}
						/>
					</div>
				</Menu.Target>
				<Menu.Dropdown style={{}}>
					<Menu.Item
						onClick={() => toggleCustQuerySearchMode('filters')}
						style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
						Filters
					</Menu.Item>
					<Menu.Item
						onClick={() => toggleCustQuerySearchMode('sql')}
						style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
						SQL
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<Stack style={{ justifyContent: 'center', width: '100%' }} onClick={toggleBuilderModal}>
				{mode === 'filters' ? <FilterPlaceholder /> : mode === 'sql' ? <SQLEditorPlaceholder /> : <></>}
			</Stack>
		</Stack>
	);
};

export const LogsHeader: FC = () => {
	const classes = styles;
	const {
		methods: { makeExportData, toggleShowQueryEditor },
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
			liveTailToggled,
		},
	} = useLogsPageContext();
	const {
		state: { subLogQuery, maximized },
		methods: { resetTimeInterval, toggleMaximize },
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

	if (maximized) return null;

	return (
		<Stack gap={0} style={{ width: '100%' }}>
			<QuerierModal />
			<Stack className={classes.logsSecondaryToolbar} gap={0} style={{ height: LOGS_SECONDARY_TOOLBAR_HEIGHT }}>
				{!liveTailToggled && (
					<Stack gap={0} style={{ flexDirection: 'row', width: '100%' }}>
						<Chooser />
						<ToggleButton
							onClick={toggleShowQueryEditor}
							toggled={isQuerySearchActive && mode === 'sql'}
							renderIcon={() => <IconCodeCircle size={px('1.2rem')} stroke={1.5} />}
							label="SQL"
						/>
						<TimeRange />
						<RefreshInterval />
						<Menu position="bottom">
							<Menu.Target>
								<div>
									<IconButton renderIcon={renderExportIcon} />
								</div>
							</Menu.Target>
							<Menu.Dropdown style={{}}>
								<Menu.Item onClick={() => exportHandler('CSV')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
									CSV
								</Menu.Item>
								<Menu.Item onClick={() => exportHandler('JSON')} style={{ padding: '0.5rem 2.25rem 0.5rem 0.75rem' }}>
									JSON
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
						<IconButton renderIcon={renderMaximizeIcon} onClick={toggleMaximize} />
						<RefreshNow onRefresh={resetTimeInterval} />
					</Stack>
				)}
				{liveTailToggled && (
					<Stack gap={0} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
						<StreamingButton />
						<IconButton renderIcon={renderMaximizeIcon} onClick={toggleMaximize} />
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export const HomeHeader: FC = () => {
	const classes = styles;
	const { container, innerContainer } = classes;
	return (
		<HeaderLayout>
			<Box className={container}>
				<Box>
					<Box className={innerContainer}>
						<HeaderBreadcrumbs crumbs={['My Streams']} />
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
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
