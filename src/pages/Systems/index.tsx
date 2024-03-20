import { Box, Button, Stack } from '@mantine/core';
import { FC } from 'react';
import Ingestors from './Ingestors';
import Queriers from './Queriers';
import StandaloneServer from './StandaloneServer';
import { useAbout } from '@/hooks/useGetAbout';
import { IconBook2 } from '@tabler/icons-react';

const Systems: FC = () => {
	const { getAboutData, getAboutIsLoading, getAboutIsError } = useAbout();
	if (getAboutIsLoading || getAboutIsError) return null;

	return (
		<Stack
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				flexDirection: 'column',
				padding: '1.25rem',
			}}>
			{getAboutData?.data.mode === 'All' ? (
				<Stack>
					{/* <Text
						ta="end"
						c="brandPrimary"
						style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem' }}>
						Know more about implementing distributed systems for enhanced efficiency
					</Text> */}
					<Box style={{ alignSelf: 'flex-end' }}>
						<Button leftSection={<IconBook2 stroke={1.5} />} c='gray.7' style={{borderColor: 'gray'}} variant="outline">Distributed Systems</Button>
					</Box>
					<StandaloneServer />
				</Stack>
			) : (
				<>
					<Queriers />
					<Ingestors />
				</>
			)}
		</Stack>
	);
};

export default Systems;
