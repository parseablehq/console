import { Box, Button, Stack } from '@mantine/core';
import { FC } from 'react';
import Ingestors from './Ingestors';
import Queriers from './Queriers';
import StandaloneServer from './StandaloneServer';
import { useAbout } from '@/hooks/useGetAbout';
import { IconBook2 } from '@tabler/icons-react';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import Redesign from './Redesign';

const navigateToDistributedDocs = () => {
	window.open('https://www.parseable.com/docs/installation-distributed', '_blank');
};

const Systems: FC = () => {
	const { getAboutIsLoading, getAboutIsError } = useAbout();
	const [isStandAloneMode] = useAppStore((store) => store.isStandAloneMode);
	if (getAboutIsLoading || getAboutIsError) return null;

	return (
		<Stack
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				flexDirection: 'column',
				padding: '3rem',
			}}>
			{isStandAloneMode ? (
				<Stack>
					<Box style={{ alignSelf: 'flex-end' }}>
						<Button
							onClick={navigateToDistributedDocs}
							leftSection={<IconBook2 stroke={1.5} />}
							c="gray.7"
							style={{ borderColor: 'gray' }}
							variant="outline">
							Distributed Systems
						</Button>
					</Box>
					<StandaloneServer />
				</Stack>
			) : (
				<Redesign/>
			// 	<>
			// 	<Queriers />
			// 	<Ingestors />
			// </>

			)}
		</Stack>
	);
};

export default Systems;
