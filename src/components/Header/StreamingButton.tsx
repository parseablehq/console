import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button } from '@mantine/core';

import { useEffect, type FC } from 'react';
import { useLogQueryStyles } from './styles';
import useMountedState from '@/hooks/useMountedState';

const StreamingButton: FC = () => {
	const {
		state: { subLiveTailsData },
	} = useHeaderContext();

	const [liveTailStatus, setLiveTailStatus] = useMountedState<string | undefined>('');
	const [isClicked, setIsClicked] = useMountedState(false);

	const handleStreaming = () => {
		if (!isClicked) {
			setIsClicked(true);
			if (liveTailStatus === 'streaming') {
				subLiveTailsData.set((state) => {
					state.liveTailStatus = 'abort';
				});
			} else {
				subLiveTailsData.set((state) => {
					state.liveTailStatus = 'fetch';
				});
			}
			setTimeout(() => {
				setIsClicked(false);
			}, 500);
		}
	};

	useEffect(() => {
		const liveTailStreaming = subLiveTailsData.subscribe((state) => {
			setLiveTailStatus(state?.liveTailStatus);
		});

		return () => {
			liveTailStreaming();
		};
	}, [subLiveTailsData]);

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
