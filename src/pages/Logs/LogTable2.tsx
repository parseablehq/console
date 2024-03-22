import { useStreamSchema } from '@/hooks/useStreamSchema';
import { useAppStore } from '@/layouts/MainLayout/AppProvider';
import { Box, Center, Loader, Stack, Table } from '@mantine/core';
import { useLogsStore } from './providers/LogsProvider';
import tableStyles from './styles/Logs.module.css';
import { LOGS_PRIMARY_TOOLBAR_HEIGHT, LOGS_SECONDARY_TOOLBAR_HEIGHT, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Text } from '@mantine/core';
import { RetryBtn } from '@/components/Button/Retry';

const TableContainer = (props) => {
	const [maximized] = useAppStore((store) => store.maximized);
	const primaryHeaderHeight = !maximized
		? PRIMARY_HEADER_HEIGHT + LOGS_PRIMARY_TOOLBAR_HEIGHT + LOGS_SECONDARY_TOOLBAR_HEIGHT
		: 0;
	return (
		<Box
			className={tableStyles.container}
			style={{
				maxHeight: `calc(100vh - ${primaryHeaderHeight}px )`,
			}}>
			{props.children}
		</Box>
	);
};

const ErrorView = (props: { error?: string; onRetry: () => void }) => {
	return (
		<Center className={tableStyles.errorContainer}>
			<Text c="red.8" style={{ fontWeight: 400 }}>
				{props.error || 'Error'}
			</Text>
			{<RetryBtn onClick={props.onRetry} mt="md" />}
		</Center>
	);
};

const LoadingView = () => {
	return (
		<Stack w="100%" align="center">
			<Loader variant="dots" />
		</Stack>
	);
};

const LogTable2 = () => {
	const [currentStream] = useAppStore((store) => store.currentStream);
	const { streamSchema, getStreamSchemaLoading, getStreamSchemaError, getStreamSchemaRefetch } =
		useStreamSchema(currentStream);
	const [quickFilters] = useLogsStore((store) => store.quickFilters);
	const [refreshInterval] = useLogsStore((store) => store.refreshInterval);
	console.log(streamSchema, getStreamSchemaLoading);

	// getStreamSchemaLoading, getStreamSchemaError

	const hasError = getStreamSchemaError;
	const errorMessage = getStreamSchemaError ? 'Error fetching schema' : '';
	const isLoading = getStreamSchemaLoading;
	const onRetry = getStreamSchemaRefetch;
	const showData = !hasError && !isLoading;

	return (
		<TableContainer>
			{hasError && !isLoading && <ErrorView onRetry={onRetry} error={errorMessage} />}
			{isLoading && <LoadingView />}
			{showData && <></>}
		</TableContainer>
	);
};

export default LogTable2;
