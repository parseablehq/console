import { useLogsStore } from '../../providers/LogsProvider';
import JsonView from './JSONView';
import LogTable from './StaticLogTable';
import useLogsFetcher from './useLogsFetcher';

const LogsView = (props: { schemaLoading: boolean }) => {
	const { schemaLoading } = props;
	const { errorMessage, hasNoData, showTable, footerCountLoading, footerCountRefetching } = useLogsFetcher({
		schemaLoading,
	});
	const [viewMode] = useLogsStore((store) => store.viewMode);
	const isFetchingCount = footerCountLoading || footerCountRefetching;
	const viewOpts = {
		errorMessage,
		hasNoData,
		showTable,
		isFetchingCount,
	};
	return viewMode === 'table' ? <LogTable {...viewOpts} /> : <JsonView {...viewOpts} />;
};

export default LogsView;
