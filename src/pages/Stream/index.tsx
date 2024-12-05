import { Box, Stack } from '@mantine/core';
import { useDocumentTitle, useHotkeys } from '@mantine/hooks';
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
import useParamsController from './hooks/useParamsController';

const { streamChangeCleanup, toggleSideBar } = streamStoreReducers;

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
	const { isStoreSynced } = useParamsController();
	const [maximized] = useAppStore((store) => store.maximized);
	const [instanceConfig] = useAppStore((store) => store.instanceConfig);
	const queryEngine = instanceConfig?.queryEngine;
	const [, setStreamStore] = useStreamStore((store) => store.sideBarOpen);
	const { getStreamInfoRefetch, getStreamInfoLoading, getStreamInfoRefetching } = useGetStreamInfo(
		currentStream || '',
		currentStream !== null,
	);

	useHotkeys([['mod+/', () => setStreamStore((store) => toggleSideBar(store))]]);

	const {
		refetch: refetchSchema,
		isLoading: isSchemaLoading,
		errorMessage: schemaFetchErrorMessage,
		isError: isSchemaError,
		isRefetching: isSchemaRefetching,
	} = useGetStreamSchema({ streamName: currentStream || '' });

	const fetchSchema = useCallback(() => {
		setStreamStore(streamChangeCleanup);
		getStreamInfoRefetch();
		refetchSchema();
	}, [currentStream]);

	useEffect(() => {
		if (isStoreSynced) {
			if (!_.isEmpty(currentStream)) {
				if (view === 'explore' && queryEngine && queryEngine !== 'Parseable') {
					setStreamStore(streamChangeCleanup);
					getStreamInfoRefetch();
				} else {
					fetchSchema();
				}
			}
		}
	}, [isStoreSynced, currentStream]);

	const sideBarWidth = SECONDARY_SIDEBAR_WIDTH;

	if (!currentStream) return null;
	if (!_.includes(STREAM_VIEWS, view)) return null;

	const isSchemaFetching = isSchemaRefetching || isSchemaLoading;
	const isInfoLoading =
		(!isStoreSynced || getStreamInfoLoading || getStreamInfoRefetching || instanceConfig === null) &&
		view === 'explore';
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
