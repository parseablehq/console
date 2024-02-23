import { ActionIcon, Box, Button, Group, Menu, Modal, ScrollArea, Select, Stack, Text, ThemeIcon, px } from '@mantine/core';
import { type FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshInterval from './RefreshInterval';
import RefreshNow from './RefreshNow';
import TimeRange from './TimeRange';
import ReloadUser from './ReloadUser';
import DocsUser from './UserDocs';
import StreamingButton from './StreamingButton';
import LiveTailFilter from './LiveTailFilter';
import {
	HEADER_HEIGHT,
	LOGS_PRIMARY_TOOLBAR_HEIGHT,
	LOGS_SECONDARY_TOOLBAR_HEIGHT,
	PRIMARY_HEADER_HEIGHT,
} from '@/constants/theme';
import { downloadDataAsCSV, downloadDataAsJson } from '@/utils/exportHelpers';
import { useLogsPageContext } from '@/pages/Logs/context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ToggleButton } from '../Button/ToggleButton';
import {
	IconAlertCircle,
	IconArrowAutofitWidth,
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconBolt,
	IconChevronDown,
	IconCircleDot,
	IconCodeCircle,
	IconDownload,
	IconExclamationCircle,
	IconFileSpreadsheet,
	IconFilter,
	IconMaximize,
	IconSettings,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import styles from './styles/LogQuery.module.css';
import headerStyles from './styles/Header.module.css';
import Querier from './Querier';
import { useStatsPageContext } from '@/pages/Stats/Context';
import IconButton from '../Button/IconButton';
import StreamDropdown from './StreamDropdown';

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
const renderAlertsIcon = () => <IconExclamationCircle size={px('1.4rem')} stroke={1.5} />;
const renderSettingsIcon = () => <IconSettings size={px('1.4rem')} stroke={1.5} />;
const renderLiveTailIcon = () => <IconBolt size={px('1.4rem')} stroke={1.5} />;
const renderDeleteIcon = () => <IconTrash size={px('1.4rem')} stroke={1.5} />;

type IconButtonProps = {
	onClick: () => void;
};

const AlertsIcon = (props: IconButtonProps) => {
	const classes = styles;
	return (
		<Stack className={classes.iconBtn} gap={0} onClick={props.onClick}>
			<IconExclamationCircle stroke={1.4} className={classes.iconBtnIcon} style={{ height: '32px', width: '32px' }} />
			{/* <Text className={classes.iconBtnLabel}>Alerts</Text> */}
		</Stack>
	);
};

const RetentionIcon = (props: IconButtonProps) => {
	const classes = styles;
	return (
		<Stack className={classes.iconBtn} gap={0} onClick={props.onClick}>
			<IconSettings stroke={1.4} className={classes.iconBtnIcon} style={{ height: '32px', width: '32px' }} />
			{/* <Text className={classes.iconBtnLabel}>Retention</Text> */}
		</Stack>
	);
};

const DeleteIcon = (props: IconButtonProps) => {
	const classes = styles;
	return (
		<Stack className={classes.iconBtn} gap={0} onClick={props.onClick}>
			<IconTrash stroke={1.4} className={classes.iconBtnIcon} style={{ height: '32px', width: '32px' }} />
			{/* <Text className={classes.iconBtnLabel}>Delete</Text> */}
		</Stack>
	);
};

const LiveModeIcon = (props: IconButtonProps) => {
	const classes = styles;
	return (
		<Stack className={classes.iconBtn} gap={0} onClick={props.onClick}>
			{/* <ThemeIcon variant="filled" style={{border: 'none'}}> */}
			<IconBolt stroke={1.4} className={classes.iconBtnIcon} style={{ height: '32px', width: '32px' }} />
			{/* </ThemeIcon> */}
			{/* <Text className={classes.iconBtnLabel}>Live Tail</Text> */}
		</Stack>
	);
};

const FilterPlaceholder = () => {
	const classes = styles;
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconFilter size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to add filter
		</Group>
	)
}

const SQLEditorPlaceholder = () => {
	const classes = styles;
	return (
		<Group className={classes.placeholderText} gap={0}>
			<IconCodeCircle size={'1.2rem'} stroke={1.8} style={{ marginRight: 6 }} />
			Click to write query
		</Group>
	)
}

const ModalTitle = ({title}: {title: string}) => {
	return <Text style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: '0.5rem' }}>{title}</Text>;
};

const QuerierModal = () => {
	const classes = styles;

	const {
		methods: {
			makeExportData,
			toggleShowQueryEditor,
			openDeleteModal,
			openAlertsModal,
			openRetentionModal,
			toggleLiveTail,
			toggleCustQuerySearchMode,
			toggleBuilderModal
		},
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
			liveTailToggled,
			builderModalOpen
		},
	} = useLogsPageContext();
	return (
		<Modal
				opened={builderModalOpen}
				onClose={toggleBuilderModal}
				size="auto"
				centered
				styles={{ body: { padding: '0 0.5rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
				title={<ModalTitle title={getLabel(mode)}/>}>
				{/* <Stack style={{ width: '820px', padding: '1rem' }} gap={0}>
					<ScrollArea h={'420px'} className={classes.queryBuilderContainer} style={{ width: '100%' }}>
						<Stack gap={0}>
							{query.rules.map((ruleSet) => {
								return <RuleSet ruleSet={ruleSet} key={ruleSet.id} />;
							})}
							<AddRuleGroupBtn createRuleGroup={createRuleGroup} />
						</Stack>
					</ScrollArea>
				</Stack>
				<Stack className={classes.footer}>
					<Button onClick={clearFilters}>Clear</Button>
					<Button onClick={applyQuery} disabled={isSumbitDisabled}>
						Apply
					</Button>
				</Stack> */}
			</Modal>
	)
}

const getLabel = (mode: string | null) => {
	return mode === 'filters' ? 'Filters' : mode === 'sql' ? 'SQL' : '';
}

const Chooser = () => {
	const classes = styles;
	const {
		methods: {
			makeExportData,
			toggleShowQueryEditor,
			openDeleteModal,
			openAlertsModal,
			openRetentionModal,
			toggleLiveTail,
			toggleCustQuerySearchMode,
			toggleBuilderModal
		},
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
			liveTailToggled,
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
			<Stack style={{  justifyContent: 'center', width: '100%' }} onClick={toggleBuilderModal}>
				{mode === 'filters' ? <FilterPlaceholder /> : mode === 'sql' ? <SQLEditorPlaceholder /> : <></>}
			</Stack>
		</Stack>
	);
}

export const LogsHeader: FC = () => {
	const classes = styles;
	const { container, innerContainer } = classes;
	const {
		methods: {
			makeExportData,
			toggleShowQueryEditor,
			openDeleteModal,
			openAlertsModal,
			openRetentionModal,
			toggleLiveTail,
		},
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
			liveTailToggled,
		},
	} = useLogsPageContext();
	const {
		state: { subLogQuery, maximized, userSpecificAccessMap },
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
			<QuerierModal/>
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

			{/* <HeaderLayout>
				<Box className={container}>
					<Box className={innerContainer} style={{ border: '1px solid transparent' }}>
						<Stack style={{ width: '100%', flexDirection: 'row' }} gap={0}>
							<Querier />
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
							<RefreshNow onRefresh={resetTimeInterval} />
						</Stack>
					</Box>
				</Box>
			</HeaderLayout> */}
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
