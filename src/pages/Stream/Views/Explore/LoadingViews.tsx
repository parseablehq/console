import { useCallback } from 'react';
import { useLogsStore, logsStoreReducers } from '../../providers/LogsProvider';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { RetryBtn } from '@/components/Button/Retry';
import classes from '../../styles/Logs.module.css';

const { getCleanStoreForRefetch } = logsStoreReducers;

export const ErrorView = (props: { message: string }) => {
	const [, setLogsStore] = useLogsStore((_store) => null);
	const { message } = props;
	const onRetry = useCallback(() => {
		setLogsStore((store) => getCleanStoreForRefetch(store));
	}, []);
	return (
		<Center className={classes.errorContainer}>
			<Text c="red.8" style={{ fontWeight: 400 }}>
				{message || 'Error'}
			</Text>
			<RetryBtn onClick={onRetry} mt="md" />
		</Center>
	);
};

export const LoadingView = () => {
	return (
		<Stack
			w="100%"
			align="center"
			h="100%"
			style={{
				alignItems: 'center',
				justifyContent: 'center',
			}}>
			<Loader type="parseable" />
		</Stack>
	);
};
