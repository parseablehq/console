import type { FC } from 'react';
import { LOAD_LIMIT, useLogsPageContext } from './context';
import React, { useEffect } from 'react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import QueryCodeEditor from './QueryCodeEditor';
import { CodeHighlight } from '@mantine/code-highlight';

export const QueryEditor: FC = () => {
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const inputRef = React.useRef<any>(); // to store input value even after the editor unmounts
	const currentStreamName = subLogQuery.get().streamName;
	useEffect(() => {
		if (currentStreamName) {
			const defaultSearchQuery = `SELECT * FROM ${currentStreamName} LIMIT ${LOAD_LIMIT};`;
			inputRef.current = defaultSearchQuery;
		} else {
			inputRef.current = '';
		}
	}, [currentStreamName]);

	return <QueryCodeEditor inputRef={inputRef} />;
};

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
