import { Box } from '@mantine/core';
import { type FC } from 'react';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import RefreshNow from './RefreshNow';
import ReloadUser from './ReloadUser';
import DocsUser from './UserDocs';
import StreamingButton from './StreamingButton';
import LiveTailFilter from './LiveTailFilter';
import { HEADER_HEIGHT } from '@/constants/theme';
import styles from './styles/LogQuery.module.css';
import headerStyles from './styles/Header.module.css';
import { useStatsPageContext } from '@/pages/Stats/Context';

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
					</Box>
				</Box>
			</Box>
		</HeaderLayout>
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
