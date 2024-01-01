import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button } from '@mantine/core';

import { useEffect, type FC } from 'react';
import { useLogQueryStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';

const StreamingButton: FC = () => {
	const {
		state: { subLiveTailsStatus },
	} = useHeaderContext();

	const [liveTailStatus, setLiveTailStatus] = useMountedState<string>('');

	const handleStreaming = () => {
		if (liveTailStatus === 'streaming') {
			subLiveTailsStatus.set('abort');
		} else {
			subLiveTailsStatus.set('fetch');
		}
	};

	useEffect(() => {
		const liveTailStreaming = subLiveTailsStatus.subscribe((state) => {
			setLiveTailStatus(state);
		});

		return () => {
			liveTailStreaming();
		};
	}, [subLiveTailsStatus]);

	const { classes } = useLogQueryStyles();
	const { refreshNowBtn } = classes;

	return (
		<>
			<Button className={refreshNowBtn} onClick={handleStreaming}>
				<Box mr="10px">{liveTailStatus === 'streaming' ? '🔴' : '🟢'}</Box>
				{liveTailStatus === 'streaming' ? 'Stop' : 'Start'}
			</Button>
		</>
	);
};

export default StreamingButton;
