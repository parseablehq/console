import { FC } from 'react';
import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import LogTable from './LogTable';

const LiveTail: FC = () => {
	useDocumentTitle('Parseable | Live tail');

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'column' }}>
			<LogTable />
		</Box>
	);
};

export default LiveTail;
