import React, { FC, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { ActionIcon, Box, Button, Text, TextInput, Tooltip } from '@mantine/core';
import { useQueryResult } from '@/hooks/useQueryResult';
import { ErrorMarker, errChecker } from './ErrorMarker';
import { notifications } from '@mantine/notifications';
import { IconPlayerPlayFilled, IconCheck, IconFileAlert, IconFileInfo } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import classes from './Query.module.css';
import { notifyError } from '@/utils/notification';
import { usePostLLM } from '@/hooks/usePostLLM';

const QueryCodeEditor: FC = () => {
	const {
		state: { subAppContext, subRefreshInterval, subTimeRange, subInstanceConfig },
	} = useHeaderContext();
	const {
		state: { result, subSchemaToggle },
	} = useQueryPageContext();

	const { data: queryResult, getQueryData, error, resetData } = useQueryResult();
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();
	const [isSchemaOpen, setIsSchemaOpen] = useMountedState(false);
	const [refreshInterval, setRefreshInterval] = useMountedState<number | null>(null);
	const [currentStreamName, setCurrentStreamName] = useMountedState<string | null>(subAppContext.get().selectedStream);
	const [query, setQuery] = useMountedState<string>('');
	const [aiQuery, setAiQuery] = useMountedState('');
	const [isLlmActive, setIsLlmActive] = useMountedState(subInstanceConfig.get()?.llmActive);
	const { data: resAIQuery, postLLMQuery } = usePostLLM();

	const handleAIGenerate = useCallback(() => {
		if (!aiQuery?.length) {
			notifyError({ message: 'Please enter a valid query' });
			return;
		}
		if (currentStreamName) {
			postLLMQuery(aiQuery, currentStreamName);
		}
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
		// errChecker(code, subLogQuery.get().streamName);

		if (currentStreamName) {
			errChecker(code, currentStreamName);
		}
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
		const subQueryListener = subAppContext.subscribe((state) => {
			if (state.selectedStream) {
				if (state.selectedStream !== currentStreamName) {
					setQuery(`SELECT * FROM ${state.selectedStream} LIMIT 100  ; `);
					result.set(null);
				}
				setCurrentStreamName(state.selectedStream);
			}
		});
		return () => {
			listener();
			refreshIntervalListener();
			subQueryListener();
			subLLMActiveListener();
		};
	}, [subAppContext.get(), subSchemaToggle.get(), subRefreshInterval.get()]);

	useEffect(() => {
		if (subAppContext.get().selectedStream) {
			setQuery(`SELECT * FROM ${subAppContext.get().selectedStream} LIMIT 100  ; `);
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
		const limitRegex = /limit\s+(\d+)/i;
		if (!limitRegex.test(withoutTrailingSemicolon)) {
			notifyError({ message: 'default limit used i.e - 1000' });
			return `${withoutTrailingSemicolon.trim()} LIMIT 1000`;
		}
		return withoutTrailingSemicolon;
	};

	const runQuery = (inputQuery: string) => {
		const query = sanitseSqlString(inputQuery);

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
		let LogQuery = {
			startTime: subTimeRange.get().startTime,
			endTime: subTimeRange.get().endTime,
			streamName: currentStreamName ?? '',
			limit: 1000,
			pageOffset: 0,
		};
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
				loading: false,
			});
			result.set({ data: error });
			return;
		}
		if (queryResult) {
			result.set(queryResult);
			notifications.update({
				id: 'load-data',
				color: 'green',
				title: 'Data was loaded',
				message: 'Successfully Loaded',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
				loading: false,
			});
			return;
		}
	}, [queryResult, error]);

	const { HeaderContainer, textContext } = classes;

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
					styles={{
						input: {
							paddingLeft: '20px',
							border: 'none',
							borderRadius: 0,
							backgroundColor: 'rgba(84,91,235,.2)',
						},
						section: {
							height: '100%',
						},
					}}
					rightSection={
						<Button variant="filled" color="brandPrimary" radius={0} onClick={handleAIGenerate} h={'100%'}>
							✨ Generate
						</Button>
					}
				/>
			) : null}
			<Box className={HeaderContainer}>
				<Text className={textContext}>Query</Text>
				<Box style={{ height: '100%', width: '100%', textAlign: 'right' }}>
					{!isLlmActive ? (
						<a style={{ marginRight: '2rem' }} href="https://www.parseable.io/docs/api/llm-queries">
							Enable SQL generation with OpenAI
						</a>
					) : null}
					<Tooltip
						label={`View Schema for ${subAppContext.get().selectedStream}`}
						style={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<ActionIcon
							variant="default"
							radius={'md'}
							size={'lg'}
							mr={'md'}
							aria-label="Schema"
							onClick={() => subSchemaToggle.set(!isSchemaOpen)}>
							<IconFileInfo stroke={1.5} />
						</ActionIcon>
					</Tooltip>
					<Tooltip
						label={'Click to Run Query or ctrl + enter '}
						style={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<ActionIcon
							variant="default"
							radius={'md'}
							size={'lg'}
							onClick={() => {
								runQuery(query);
							}}>
							<IconPlayerPlayFilled stroke={1.5} />
						</ActionIcon>
					</Tooltip>
				</Box>
			</Box>

			<Box style={{ height: 'calc(100% - 96px)' }}>
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
