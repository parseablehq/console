import { useLogsPageContext } from './logsContextProvider';
import { CodeHighlight } from '@mantine/code-highlight';

export const AppliedSQLQuery = () => {
	const {
		state: {
			custQuerySearchState: { custSearchQuery },
		},
	} = useLogsPageContext();
	return (
		<CodeHighlight
			withCopyButton={false}
			code={`${custSearchQuery};`}
			language="sql"
			styles={{ pre: { padding: 0, background: 'white' } }}
		/>
	);
};
