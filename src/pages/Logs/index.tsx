import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import LogTable from './LogTable';
import { useLogsStyles } from './styles';
import ViewLog from './ViewLog';
import QueryEditor from './QueryEditor';
// import HeaderPagination from './HeaderPagination';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');

	const { classes } = useLogsStyles();
	const { container } = classes;

	return (
		<Box className={container}>
			{/* <HeaderPagination /> */}
			<LogTable />
			<ViewLog />
			<QueryEditor />
		</Box>
	);
};

export default Logs;
