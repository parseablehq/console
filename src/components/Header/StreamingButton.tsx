import { Box, Button } from '@mantine/core';
import { type FC } from 'react';
import useMountedState from '@/hooks/useMountedState';
import classes from './styles/LogQuery.module.css';
import { logsStoreReducers, useLogsStore } from '@/pages/Stream/providers/LogsProvider';
import { STREAM_PRIMARY_TOOLBAR_HEIGHT } from '@/constants/theme';

const { setLiveTailStatus } = logsStoreReducers;

const StreamingButton: FC = () => {
	const [liveTailConfig, setLogsStore] = useLogsStore((store) => store.liveTailConfig);
	const [isClicked, setIsClicked] = useMountedState(false);

	const handleStreaming = () => {
		if (!isClicked) {
			setIsClicked(true);
			if (liveTailConfig.liveTailStatus === 'streaming') {
				setLogsStore((store) => setLiveTailStatus(store, 'abort'));
			} else {
				setLogsStore((store) => setLiveTailStatus(store, 'fetch'));
			}
			setTimeout(() => {
				setIsClicked(false);
			}, 500);
		}
	};

	const { streamButton } = classes;

	return (
		<Button className={streamButton} onClick={handleStreaming} style={{height: STREAM_PRIMARY_TOOLBAR_HEIGHT}}>
			<Box mr="10px">{liveTailConfig.liveTailStatus === 'streaming' ? '🔴' : '🟢'}</Box>
			{liveTailConfig.liveTailStatus === 'streaming' ? 'Stop' : 'Start'}
		</Button>
	);
};

export default StreamingButton;
