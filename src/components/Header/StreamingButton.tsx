import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button } from '@mantine/core';

import { useEffect, type FC } from 'react';
import useMountedState from '@/hooks/useMountedState';
import classes from './styles/LogQuery.module.css';

const StreamingButton: FC = () => {
	const {
		state: { subLiveTailsData },
	} = useHeaderContext();

	const [liveTailStatus, setLiveTailStatus] = useMountedState<string | undefined>(subLiveTailsData.get().liveTailStatus);
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

	const { streamButton } = classes;

	return (
		<Button className={streamButton} onClick={handleStreaming}>
			<Box mr="10px">{liveTailStatus === 'streaming' ? '🔴' : '🟢'}</Box>
			{liveTailStatus === 'streaming' ? 'Stop' : 'Start'}
		</Button>
	);
};

export default StreamingButton;
