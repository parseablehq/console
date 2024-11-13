import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Stack } from '@mantine/core';
import LogsView from '../Stream/Views/Explore/LogsView';
import Querier from '../Stream/components/Querier';
import SecondaryToolbar from '../Stream/components/SecondaryToolbar';
import {
	PRIMARY_HEADER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
	STREAM_PRIMARY_TOOLBAR_HEIGHT,
} from '@/constants/theme';
import { MaximizeButton, SavedFiltersButton } from '../Stream/components/PrimaryToolbar';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import RefreshNow from '@/components/Header/RefreshNow';
import ShareButton from '@/components/Header/ShareButton';

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');

	return (
		<Stack
			gap={0}
			style={{
				maxHeight: `calc(100vh - ${PRIMARY_HEADER_HEIGHT}px )`,
				overflowY: 'scroll',
				flex: 1,
			}}>
			<h1>PKB</h1>
			<Stack
				style={{
					height: STREAM_PRIMARY_TOOLBAR_CONTAINER_HEIGHT,
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 1.25rem',
				}}>
				<Stack style={{ flexDirection: 'row', height: STREAM_PRIMARY_TOOLBAR_HEIGHT }} w="100%">
					<Querier />
					<SavedFiltersButton />
					<TimeRange />
					<RefreshInterval />
					<RefreshNow />
					{/* <ViewToggle /> */}
					<ShareButton />
					<MaximizeButton />
				</Stack>
			</Stack>
			<SecondaryToolbar />
			<LogsView schemaLoading={false} infoLoading={false} />
		</Stack>
	);
};

export default Correlation;
