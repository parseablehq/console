import React, { FC, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Text, TextInput, Tooltip, px } from '@mantine/core';
import { useQueryResult } from '@/hooks/useQueryResult';
import { ErrorMarker, errChecker } from './ErrorMarker';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlayFilled, IconFileInfo } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import { useQueryCodeEditorStyles } from './styles';
import dayjs from 'dayjs';
import { notify } from '@/utils/notification';
import { usePostLLM } from '@/hooks/usePostLLM';
import { sanitseSqlString } from '@/utils/sanitseSqlString';

const QueryCodeEditor: FC = () => {
	const {
		state: { subLogQuery, subRefreshInterval, subLogSelectedTimeRange, subInstanceConfig },
	} = useHeaderContext();
	const {
		state: { result, subSchemaToggle },
	} = useQueryPageContext();

	const { fetchQueryMutation } = useQueryResult();
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();
	const [isSchemaOpen, setIsSchemaOpen] = useMountedState(false);
	const [refreshInterval, setRefreshInterval] = useMountedState<number | null>(null);
	const [currentStreamName, setCurrentStreamName] = useMountedState<string>(subLogQuery.get().streamName);
	const [query, setQuery] = useMountedState<string>('');
	const [aiQuery, setAiQuery] = useMountedState('');
	const [isLlmActive, setIsLlmActive] = useMountedState(subInstanceConfig.get()?.llmActive);
	const { data: resAIQuery, postLLMQuery } = usePostLLM();

	const handleAIGenerate = useCallback(() => {
		if (!aiQuery?.length) {
			notify({ message: 'Please enter a valid query' });
			return;
		}
		postLLMQuery(aiQuery, currentStreamName);
	}, [aiQuery]);

	useEffect(() => {
		if (resAIQuery) {
			const warningMsg =
				'-- LLM generated query is experimental and may produce incorrect answers\n-- Always verify the generated SQL before executing\n\n';
			setQuery(warningMsg + resAIQuery);
		}
	}, [resAIQuery]);

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
		const subLLMActiveListener = subInstanceConfig.subscribe((state) => {
			setIsLlmActive(state?.llmActive);
		});
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
			subLLMActiveListener();
		};
	}, [subLogQuery.get(), subSchemaToggle.get(), subRefreshInterval.get()]);

	useEffect(() => {
		if (subLogQuery.get().streamName) {
			setQuery(`SELECT * FROM ${subLogQuery.get().streamName} LIMIT 100  ; `);
		}
	}, []);

	useEffect(() => {
		if (fetchQueryMutation?.data?.length > 0) {
			result.set(JSON.stringify(fetchQueryMutation?.data, null, 2));
		}
	}, [fetchQueryMutation.isSuccess]);

	function handleEditorDidMount(editor: any, monaco: any) {
		editorRef.current = editor;
		monacoRef.current = monaco;
		editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, async () => {
			runQuery(editor.getValue());
		});
	}

	const runQuery = (inputQuery: string) => {
		const query = sanitseSqlString(inputQuery);

		notifications.show({
			id: 'load-data',
			loading: true,
			color: '#545BEB',
			title: 'Running Query',
			message: 'Data will be loaded.',
			autoClose: false,
			withCloseButton: false,
		});
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
		fetchQueryMutation.mutate({ logsQuery: LogQuery, query: parsedQuery });
	};

	const { classes } = useQueryCodeEditorStyles();
	const { container, runQueryBtn, textContext, actionBtn } = classes;

	return (
		<Box style={{ height: '100%' }}>
			{isLlmActive ? (
				<TextInput
					type="text"
					name="ai_query"
					id="ai_query"
					value={aiQuery}
					onChange={(e) => setAiQuery(e.target.value)}
					placeholder="Enter plain text to generate SQL query using OpenAI"
					rightSectionWidth={'auto'}
					sx={{
						// border: '1px solid #545BEB',
						// backgroundColor: 'rgba(84,91,235,.2)',

						'& .mantine-Input-input': {
							// color: '#FC466B',
							border: 'none',
							borderRadius: 0,
							backgroundColor: 'rgba(84,91,235,.2)',
							'::placeholder': {
								// color: "rgba(0,0,107,.7)",
							},
						},
						'& .mantine-TextInput-rightSection	': {
							height: '100%',
						},
					}}
					rightSection={
						<Button variant="filled" color="brandPrimary.0" radius={0} onClick={handleAIGenerate} h={'100%'}>
							✨ Generate
						</Button>
					}
				/>
			) : null}
			<Box className={container}>
				<Text className={textContext}>Query</Text>
				<Box style={{ height: '100%', width: '100%', textAlign: 'right' }}>
					{!isLlmActive ? (
						<a style={{ marginRight: '2rem' }} href="https://www.parseable.io/docs/api/llm-queries">
							Enable SQL generation with OpenAI
						</a>
					) : null}
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

			<Box sx={{ height: 'calc(100% - 96px)' }}>
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
						padding: { top: 10 },
					}}
				/>
			</Box>
		</Box>
	);
};

export default QueryCodeEditor;
