import { Box } from '@mantine/core';
import { useLogsStore } from '../../providers/LogsProvider';
import JsonView from './JSONView';
import LogTable from './StaticLogTable';
import useLogsFetcher from './useLogsFetcher';
import LogsViewConfig from './LogsViewConfig';

const LogsView = (props: { schemaLoading: boolean }) => {
	const { schemaLoading } = props;
	const { errorMessage, hasNoData, showTable, isFetchingCount, logsLoading } = useLogsFetcher({
		schemaLoading,
	});
	const [viewMode] = useLogsStore((store) => store.viewMode);
	const viewOpts = {
		errorMessage,
		hasNoData,
		showTable,
		isFetchingCount,
	};

	return (
		<Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
			<LogsViewConfig schemaLoading={schemaLoading} logsLoading={logsLoading} />
			{viewMode === 'table' ? <LogTable {...viewOpts} /> : <JsonView {...viewOpts} />}
		</Box>
	);
};

export default LogsView;
