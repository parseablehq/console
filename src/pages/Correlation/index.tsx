import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { Stack, Box, Group, Button, Collapse } from '@mantine/core';
import LogsView from '../Stream/Views/Explore/LogsView';
import Querier from '../Stream/components/Querier';
import SecondaryToolbar from '../Stream/components/SecondaryToolbar';
import {
	PRIMARY_HEADER_HEIGHT,
	SECONDARY_SIDEBAR_WIDTH,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_HEIGHT,
} from '@/constants/theme';
import { MaximizeButton } from '../Stream/components/PrimaryToolbar';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';
import SideBar from '@/components/SideBar/Sidebar';

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');
	const [opened, { toggle }] = useDisclosure(false);
	const sideBarWidth = SECONDARY_SIDEBAR_WIDTH;
	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
			}}>
			<Stack style={{ width: sideBarWidth }}>
				<SideBar />
			</Stack>
			<Stack
				gap={0}
				style={{
					maxHeight: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px )`,
					overflowY: 'scroll',
					flex: 1,
				}}>
				<Group justify="center" mb={5}>
					<Button onClick={toggle}>Config</Button>
				</Group>
				<Collapse in={opened}>
					<h1>PKB</h1>
				</Collapse>
				<Stack
					style={{
						height: STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0 1.25rem',
					}}>
					<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
						<Querier />
						<TimeRange />
						<RefreshInterval />
						<RefreshNow />
						<ShareButton />
						<MaximizeButton />
					</Stack>
				</Stack>
				<SecondaryToolbar />
				<LogsView schemaLoading={false} infoLoading={false} />
			</Stack>
		</Box>
	);
};

export default Correlation;
