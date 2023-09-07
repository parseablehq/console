import React, { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Input, Text, Tooltip, px } from '@mantine/core';
import { useQueryResult } from '@/hooks/useQueryResult';
import { ErrorMarker, errChecker } from './ErrorMarker';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlayFilled, IconCheck, IconFileAlert, IconFileInfo } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import { useQueryCodeEditorStyles } from './styles';
import dayjs from 'dayjs';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { notify } from '@/utils/notification';
import { Axios } from '@/api/axios';
import { LLM_QUERY_URL } from '@/api/constants';
import { filterUnnecessaryFieldsFromRecord } from '@/utils';

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
	const [refreshInterval, setRefreshInterval] = useMountedState<number | null>(null);
	const [currentStreamName, setCurrentStreamName] = useMountedState<string>(subLogQuery.get().streamName);
	const [query, setQuery] = useMountedState<string>('');
	const [aiQuery, setAiQuery] = useMountedState('Show all records');
	const { data: querySchema, getDataSchema } = useGetLogStreamSchema();

	const handleAIGenerate = async () => {
		if (!aiQuery?.length) {
			notify({ message: 'Please enter a valid query' });
			return;
		}
		notify({ message: 'AI based SQL being generated.', title: 'Getting suggestions', autoClose: 3000, color: 'blue' });

		const columnData = querySchema?.fields || [];
		const usefulCols = filterUnnecessaryFieldsFromRecord(columnData);
		const stringified = JSON.stringify(usefulCols);

		const prompt = `I have a table called ${currentStreamName}. It has the columns:\n${stringified}
Based on this, please generate valid SQL for the query: "${aiQuery}"
Generate only the SQL as output. Also add comments in SQL syntax to explain your action. Don't output anything else.
If it is not possible to generate valid SQL, output as an SQL comment saying so.`;
		const resp = await Axios().post(LLM_QUERY_URL, { prompt });
		if (resp.status !== 200) {
			notify({
				message: 'Please check your internet connection and add a valid OpenAI API key',
				title: 'Error getting suggestions',
				color: 'red',
			});
			return;
		}

		const warningMsg =
			'-- Parseable AI is experimental and may produce incorrect answers\n-- Always verify the generated SQL before executing\n\n';
		setQuery(warningMsg + resp.data);
	};

	useEffect(() => {
		getDataSchema(currentStreamName);
	}, [currentStreamName]);

	const handleEditorChange = (code: any) => {
		setQuery(code);
		errChecker(code, subLogQuery.get().streamName);
		monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), 'owner', ErrorMarker);
	};

	useEffect(() => {
		if (subRefreshInterval.get()) {
			const interval = setInterval(() => {
				runQuery(query);
			}, subRefreshInterval.get() as number);
			return () => clearInterval(interval);
		}
	}, [refreshInterval, query]);

	useEffect(() => {
		const listener = subSchemaToggle.subscribe(setIsSchemaOpen);
		const refreshIntervalListener = subRefreshInterval.subscribe(setRefreshInterval);
		const subQueryListener = subLogQuery.subscribe((state) => {
			if (state.streamName) {
				if (state.streamName !== currentStreamName) {
					setQuery(`SELECT * FROM ${state.streamName} LIMIT 100  ; `);
					result.set('');
				}
				setCurrentStreamName(state.streamName);
			}
		});
		return () => {
			listener();
			refreshIntervalListener();
			subQueryListener();
		};
	}, [subLogQuery.get(), subSchemaToggle.get(), subRefreshInterval.get(), querySchema]);

	useEffect(() => {
		if (subLogQuery.get().streamName) {
			setQuery(`SELECT * FROM ${subLogQuery.get().streamName} LIMIT 100  ; `);
		}
	}, []);

	function handleEditorDidMount(editor: any, monaco: any) {
		editorRef.current = editor;
		monacoRef.current = monaco;
		editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, async () => {
			runQuery(editor.getValue());
		});
	}

	const sanitseSqlString = (sqlString: string): string => {
		const withoutComments = sqlString.replace(/--.*$/gm, '');
		const withoutNewLines = withoutComments.replace(/\n/g, ' ');
		const withoutTrailingSemicolon = withoutNewLines.replace(/;/, '');
		return withoutTrailingSemicolon;
	};

	const runQuery = (inputQuery: string) => {
		const query = sanitseSqlString(inputQuery);

		resetData();
		let LogQuery = {
			startTime: subLogQuery.get().startTime,
			endTime: subLogQuery.get().endTime,
			streamName: currentStreamName,
			access: [],
		};
		if (subLogSelectedTimeRange.get().state === 'fixed') {
			const now = dayjs();
			const timeDiff = subLogQuery.get().endTime.getTime() - subLogQuery.get().startTime.getTime();
			LogQuery = {
				startTime: now.subtract(timeDiff).toDate(),
				endTime: now.toDate(),
				streamName: currentStreamName,
				access: [],
			};
		}
		const parsedQuery = query.replace(/(\r\n|\n|\r)/gm, '');
		getQueryData(LogQuery, parsedQuery);
	};
	useEffect(() => {
		if (error) {
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred, please check your query and try again',
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
				message: 'Successfully Loaded',
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
					<Tooltip
						label={`View Schema for ${subLogQuery.get().streamName}`}
						sx={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button
							variant="default"
							className={actionBtn}
							aria-label="Schema"
							onClick={() => subSchemaToggle.set(!isSchemaOpen)}>
							<IconFileInfo size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Tooltip>
					<Tooltip
						label={'Click to Run Query or ctrl + enter '}
						sx={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button
							variant="default"
							className={runQueryBtn}
							onClick={() => {
								runQuery(query);
							}}>
							<IconPlayerPlayFilled size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Tooltip>
				</Box>
			</Box>
			<Box sx={{ marginTop: '5px', height: 'calc(100% - 60px)' }}>
				<Box className="flex" style={{ display: 'flex', margin: '15px', flexWrap: 'wrap' }}>
					<Input
						type="text"
						name="ai_query"
						id="ai_query"
						style={{ minWidth: '85%', margin: '2px 20px 10px 0' }}
						value={aiQuery}
						onChange={(e) => setAiQuery(e.target.value)}
						placeholder="Ask Parseable AI"
					/>
					<Button variant="gradient" onClick={handleAIGenerate}>
						Generate SQL
					</Button>
				</Box>
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
