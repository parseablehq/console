import { CodeHighlight } from '@mantine/code-highlight';
import { useLogsStore } from '../../providers/LogsProvider';

export const AppliedSQLQuery = () => {
	const [custSearchQuery] = useLogsStore(store => store.custQuerySearchState.custSearchQuery)
	return (
		<CodeHighlight
			withCopyButton={false}
			code={`${custSearchQuery};`}
			language="sql"
			styles={{ pre: { padding: 0, background: 'white' } }}
		/>
	);
};
