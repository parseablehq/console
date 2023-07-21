import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import LogTable from './LogTable';
import { useLogsStyles } from './styles';
import ViewLog from './ViewLog';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Dashboard');

	const { classes } = useLogsStyles();
	const { container } = classes;

	return (
		<Box className={container}>
			<LogTable />
			<ViewLog />
		</Box>
	);
};

export default Logs;
