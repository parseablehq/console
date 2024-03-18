import { Box, Divider, Stack } from '@mantine/core';
import { FC } from 'react';
import Queriers from './Queriers';
import Ingestors from './Ingestors';

const Systems: FC = () => {
	return (
		<Stack
			style={{
				display: 'flex',
				width: '100%',
				height: '100%',
				flexDirection: 'column',
				padding: '1.25rem'
			}}>
			{/* <Queriers /> */}
			{/* <Divider/> */}
			<Ingestors />
		</Stack>
	);
};

export default Systems;
