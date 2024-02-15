import { Box, Drawer } from '@mantine/core';
import type { FC } from 'react';
import { LOAD_LIMIT, useLogsPageContext } from './Context';
import React, { useEffect } from 'react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import QueryCodeEditor from './QueryCodeEditor';
import viewLogStyles from './styles/ViewLogs.module.css'

const QueryEditor: FC = () => {
	const {
		state: {
			custQuerySearchState: { showQueryEditor },
		},
		methods: { toggleShowQueryEditor },
	} = useLogsPageContext();
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const onClose = () => toggleShowQueryEditor();
	const classes = viewLogStyles;
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

	return (
		<Drawer opened={showQueryEditor} onClose={onClose} position="right" size="lg" withCloseButton={false} padding={0}>
			<Box className={classes.container} style={{ height: '100vh' }}>
				<QueryCodeEditor inputRef={inputRef} />
			</Box>
		</Drawer>
	);
};

export default QueryEditor;
