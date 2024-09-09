import { Box, Stack, rem } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useCallback, useEffect } from 'react';
import LiveLogTable from './Views/LiveTail/LiveLogTable';
import ViewLog from './components/ViewLog';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import SideBar from './components/Sidebar';
import Management from './Views/Manage/Management';
import { useStreamStore, streamStoreReducers } from './providers/StreamProvider';
import _ from 'lodash';
import SecondaryToolbar from './components/SecondaryToolbar';
import { PRIMARY_HEADER_HEIGHT, SECONDARY_SIDEBAR_WIDTH } from '@/constants/theme';
import PrimaryToolbar from './components/PrimaryToolbar';
import { useParams } from 'react-router-dom';
import { STREAM_VIEWS } from '@/constants/routes';
import { Text } from '@mantine/core';
import { RetryBtn } from '@/components/Button/Retry';
import LogsView from './Views/Explore/LogsView';
import { useGetStreamSchema } from '@/hooks/useGetLogStreamSchema';

import { useGetStreamInfo } from '@/hooks/useGetStreamInfo';

const { streamChangeCleanup } = streamStoreReducers;

const ErrorView = (props: { error: string | null; onRetry: () => void }) => {
	return (
		<Stack style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
			<Stack gap={0} style={{ justifyContent: 'center', alignItems: 'center' }}>
				<Text c="red.8" style={{ fontWeight: 400, textAlign: 'center' }}>
					{props.error || 'Error'}
				</Text>
				<Box>
					<RetryBtn onClick={props.onRetry} mt="md" />
				</Box>
			</Stack>
		</Stack>
	);
};

const Stream: FC = () => {
	useDocumentTitle('Parseable | Stream');
	const { view } = useParams();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [maximized] = useAppStore((store) => store.maximized);
	const [sideBarOpen, setStreamStore] = useStreamStore((store) => store.sideBarOpen);
	const {getStreamInfoRefetch, getStreamInfoLoading} = useGetStreamInfo(currentStream || '');

	const {
		refetch: refetchSchema,
		isLoading: isSchemaLoading,
		errorMessage: schemaFetchErrorMessage,
		isError: isSchemaError,
		isRefetching: isSchemaRefetching
	} = useGetStreamSchema({ streamName: currentStream || '' });

	const fetchSchema = useCallback(() => {
		setStreamStore(streamChangeCleanup);
		refetchSchema();
	}, [currentStream]);

	useEffect(() => {
		if (!_.isEmpty(currentStream)) {
			if (view === 'explore') {
				getStreamInfoRefetch();
			} else {
				fetchSchema();
			}
		}
	}, [currentStream]);

	const sideBarWidth = sideBarOpen ? rem(180) : SECONDARY_SIDEBAR_WIDTH;

	if (!currentStream) return null;
	if (!_.includes(STREAM_VIEWS, view)) return null;

	const isSchemaFetching = isSchemaRefetching || isSchemaLoading;
	const isInfoLoading = getStreamInfoLoading && view === 'explore'

	return (
		<Box
			style={{
				flex: 1,
				display: 'flex',
				position: 'relative',
				flexDirection: 'row',
				width: '100%',
			}}>
			<ViewLog />
			<Stack style={{ width: sideBarWidth }}>
				<SideBar />
			</Stack>
			<Stack
				gap={0}
				style={{
					maxHeight: `calc(100vh - ${maximized ? 0 : PRIMARY_HEADER_HEIGHT}px )`,
					overflowY: 'scroll',
					flex: 1,
				}}>
				<PrimaryToolbar />
				{view === 'explore' && <SecondaryToolbar />}
				{view === 'explore' ? (
					isSchemaError ? (
						<ErrorView error={schemaFetchErrorMessage} onRetry={fetchSchema} />
					) : (
						<LogsView schemaLoading={isSchemaFetching} infoLoading={isInfoLoading} />
					)
				) : view === 'live-tail' ? (
					<LiveLogTable />
				) : (
					<Management schemaLoading={isSchemaFetching} />
				)}
			</Stack>
		</Box>
	);
};

export default Stream;
