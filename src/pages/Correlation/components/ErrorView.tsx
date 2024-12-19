import { RetryBtn } from '@/components/Button/Retry';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { Center, Text } from '@mantine/core';
import tableStyles from '../styles/CorrelationLogs.module.css';
import { FC, useCallback } from 'react';

const { syncTimeRange } = appStoreReducers;

const ErrorIcon: FC<{
	height?: number | string;
	width?: number | string;
}> = ({ height, width }) => {
	return (
		<svg width={width} height={height} viewBox="0 0 143 95" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M94.709 18L59.0001 53.7089" stroke="#3A3A8C" stroke-width="11" stroke-linecap="round" />
			<path d="M81.0918 6L61.9999 25.0919" stroke="#00A896" stroke-width="11" stroke-linecap="round" />
			<path d="M50.2422 36L45.9995 40.2426" stroke="#3A3A8C" stroke-width="11" stroke-linecap="round" />
			<path
				d="M28.9041 60.1176L33.8217 41.765L38.998 22.4466C39.3243 21.2287 38.1013 20.6763 36.7126 21.3166C33.1449 22.9615 26.4918 30.4834 24.1624 39.1768C21.833 47.8703 23.9526 58.0583 26.101 60.9196C26.9981 62.1144 28.2942 62.3938 28.9041 60.1176Z"
				fill="#3A3A8C"
				stroke="#3A3A8C"
				stroke-linecap="round"
			/>
			<path
				d="M117.745 68.5311L99.392 73.4486L80.0736 78.625C78.8557 78.9514 78.9888 80.2867 80.2377 81.1693C83.4461 83.4365 93.2867 85.4373 101.98 83.1079C110.674 80.7785 118.437 73.8489 119.841 70.5577C120.427 69.1834 120.021 67.9212 117.745 68.5311Z"
				fill="#3A3A8C"
				stroke="#3A3A8C"
				stroke-linecap="round"
			/>
			<path d="M1 94H142" stroke="#3A3A8C" stroke-linecap="round" />
		</svg>
	);
};

export const ErrorView = () => {
	const [, setAppStore] = useAppStore((_store) => null);

	const onRetry = useCallback(() => {
		setAppStore((store) => syncTimeRange(store));
	}, []);
	return (
		<Center className={tableStyles.errorContainer}>
			<div className={tableStyles.errorContainerWrapper}>
				<ErrorIcon height={200} width={200} />
				<Text style={{ fontSize: '24px' }} c="#9F1239">
					Something broke!
				</Text>
				<Text style={{ fontSize: '16px', wordWrap: 'break-word', marginTop: '12px' }} c="#A0A0A0">
					This is what might have happened.Try doing this it fix it.
				</Text>
				<RetryBtn onClick={onRetry} style={{ marginTop: '48px' }} />
			</div>
		</Center>
	);
};
