import { Stack } from '@mantine/core';
import { FC } from 'react';
import { useAbout } from '@/hooks/useGetAbout';
import Cluster from './Cluster';

const Systems: FC = () => {
	const { getAboutIsLoading, getAboutIsError } = useAbout();
	if (getAboutIsLoading || getAboutIsError) return null;

	return (
		<Stack
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				flexDirection: 'column',
			}}>
			<Cluster />
		</Stack>
	);
};

export default Systems;
