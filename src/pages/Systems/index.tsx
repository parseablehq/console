import { Stack } from '@mantine/core';
import { FC } from 'react';
import { useAbout } from '@/hooks/useGetAbout';
import Cluster from './Cluster';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useDocumentTitle } from '@mantine/hooks';

const Systems: FC = () => {
	useDocumentTitle('Parseable | Cluster');
	const { getAboutIsLoading, getAboutIsError } = useAbout();
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	if (getAboutIsLoading || getAboutIsError || isStandAloneMode !== false) return null;

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
