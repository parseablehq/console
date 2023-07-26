import React, { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Text, px } from '@mantine/core';
import { useQueryResult } from '@/hooks/useQueryResult';
import { ErrorMarker, errChecker } from './ErrorMarker';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlayFilled, IconCheck, IconFileAlert, IconFileInfo } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import { useQueryCodeEditorStyles } from './styles';
import dayjs from 'dayjs';

const QueryCodeEditor: FC = () => {
	const {
		state: { subLogQuery, subRefreshInterval, subLogSelectedTimeRange },
	} = useHeaderContext();
	const {
		state: { result, subSchemaToggle },
	} = useQueryPageContext();

	const { data: queryResult, getQueryData, error, resetData } = useQueryResult();
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();
	const [isSchemaOpen, setIsSchemaOpen] = useMountedState(false);
	const [query, setQuery] = React.useState<string>(`SELECT * FROM ${subLogQuery.get().streamName} LIMIT 100`);
	const [refreshInterval, setRefreshInterval] = useMountedState<number | null>(null);
	const [currentStreamName, setCurrentStreamName] = useMountedState<string>('');

	const handleEditorChange = (code: any) => {
		setQuery(code);
		errChecker(code, subLogQuery.get().streamName);
		monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), 'owner', ErrorMarker);
	};

	useEffect(() => {
		if (subRefreshInterval.get()) {
			const interval = setInterval(() => {
				runQuery();
			}, subRefreshInterval.get() as number);
			return () => clearInterval(interval);
		}
	}, [refreshInterval, query]);

	useEffect(() => {
		const listener = subSchemaToggle.subscribe(setIsSchemaOpen);
		const refreshIntervalListener = subRefreshInterval.subscribe(setRefreshInterval);
		const subQueryListener = subLogQuery.subscribe((state) => {
			if (state.streamName!==currentStreamName) {
				setCurrentStreamName(state.streamName);
				setQuery(`SELECT * FROM ${state.streamName} LIMIT 100  ; `);
				console.log(['state.streamName',state.streamName,currentStreamName]);
				result.set('');
			}
		});
		return () => {
			listener();
			refreshIntervalListener();
			subQueryListener();
		};
	}, [currentStreamName]);


	function handleEditorDidMount(editor: any, monaco: any) {
		editorRef.current = editor;
		monacoRef.current = monaco;
	}
	const runQuery = () => {
		resetData();
		notifications.show({
			id: 'load-data',
			loading: true,
			color: '#545BEB',
			title: 'Running Query',
			message: 'Data will be loaded.',
			autoClose: false,
			withCloseButton: false,
		});
		if (subLogSelectedTimeRange.get().includes('Past')) {
			const now = dayjs();
			const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
			subLogQuery.set((state) => {
				state.startTime = now.subtract(timeDiff).toDate();
				state.endTime = now.toDate();
			});
		}
		const parsedQuery = query.replace(/(\r\n|\n|\r)/gm, '');
		getQueryData(subLogQuery.get(), parsedQuery);
	};
	useEffect(() => {
		if (error) {
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error Occured',
				message: 'Error Occured, please check your query and try again',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
			result.set(error);
			return;
		}
		if (queryResult) {
			result.set(JSON.stringify(queryResult?.data, null, 2));
			notifications.update({
				id: 'load-data',
				color: 'green',
				title: 'Data was loaded',
				message: 'Successfully Loaded!!',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
			return;
		}
	}, [queryResult, error]);

	const { classes } = useQueryCodeEditorStyles();
	const { container, runQueryBtn, textContext, actionBtn } = classes;

	return (
		<Box style={{ height: '100%' }}>
			<Box className={container}>
				<Text className={textContext}>Query</Text>
				<Box style={{ height: '100%', width: '100%', textAlign: 'right' }}>
					<Button variant="default" className={actionBtn} onClick={() => subSchemaToggle.set(!isSchemaOpen)}>
						<IconFileInfo size={px('1.2rem')} stroke={1.5} />
					</Button>
					<Button variant="default" className={runQueryBtn} onClick={runQuery}>
						<IconPlayerPlayFilled size={px('1.2rem')} stroke={1.5} />
					</Button>
				</Box>
			</Box>
			<Box sx={{ marginTop: '5px', height: 'calc(100% - 60px)' }}>
				<Editor
					height={'100%'}
					defaultLanguage="sql"
					value={query}
					onChange={handleEditorChange}
					onMount={handleEditorDidMount}
					options={{
						scrollBeyondLastLine: false,
						readOnly: false,
						fontSize: 12,
						wordWrap: 'on',
						minimap: { enabled: false },
						automaticLayout: true,
						mouseWheelZoom: true,
						glyphMargin: true,
					}}
				/>
			</Box>
		</Box>
	);
};

export default QueryCodeEditor;
