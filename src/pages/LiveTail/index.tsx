import { FC } from 'react';
import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { useLiveTailStyles } from './styles';
import LogTable from './LogTable';

const LiveTail: FC = () => {
	useDocumentTitle('Parseable | Live tail');

	const { classes } = useLiveTailStyles();
	const { container } = classes;

	return (
		<Box className={container}>
			<LogTable />
		</Box>
	);
};

export default LiveTail;
