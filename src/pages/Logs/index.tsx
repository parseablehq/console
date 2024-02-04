import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import LogTable from './LogTable';
import ViewLog from './ViewLog';
import QueryEditor from './QueryEditor';
// import HeaderPagination from './HeaderPagination';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Logs');

	return (
		<Box style={{ flex: 1, display: 'flex', position: 'relative', flexDirection: 'column' }}>
			{/* <HeaderPagination /> */}
			<LogTable />
			<ViewLog />
			<QueryEditor />
		</Box>
	);
};

export default Logs;
