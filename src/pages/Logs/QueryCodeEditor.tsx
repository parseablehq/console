import React, { FC, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Flex, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { ErrorMarker, errChecker } from './ErrorMarker';
import useMountedState from '@/hooks/useMountedState';
import { notify } from '@/utils/notification';
import { usePostLLM } from '@/hooks/usePostLLM';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import { LOAD_LIMIT, useLogsPageContext } from './logsContextProvider';
import { Field } from '@/@types/parseable/dataType';
import queryCodeStyles from './styles/QueryCode.module.css';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const genColumnConfig = (fields: Field[]) => {
	const columnConfig = { leftColumns: [], rightColumns: [] };
	if (fields.length === 0) return columnConfig;

	const partitionIndex = (fields.length + (fields.length % 2)) / 2;
	return fields.reduce((acc: { leftColumns: string[]; rightColumns: string[] }, field, index: number) => {
		const { name, data_type } = field;
		const config =
			typeof data_type === 'string'
				? `${index + 1}. ${name} - ${data_type}`
				: `${index + 1}. ${name} - ${JSON.stringify(data_type)}`;
		return index + 1 > partitionIndex
			? { ...acc, rightColumns: [...acc.rightColumns, config] }
			: { ...acc, leftColumns: [...acc.leftColumns, config] };
	}, columnConfig);
};

const QueryCodeEditor: FC = () => {
	const [llmActive] = useAppStore(store => store.instanceConfig?.llmActive)
	const {
		state: {
			custQuerySearchState: { isQuerySearchActive, mode },
			subLogStreamSchema,
			queryCodeEditorRef,
		},
		methods: { resetQuerySearch, setCustSearchQuery, closeBuilderModal },
	} = useLogsPageContext();

	const fields = subLogStreamSchema.get()?.fields || [];
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();
	const [currentStream] = useAppStore(store => store.currentStream)
	const [localStreamName, setlocalStreamName] = useMountedState<string | null>(currentStream);
	const [query, setQuery] = useMountedState<string>('');
	const [aiQuery, setAiQuery] = useMountedState('');
	const [localLlmActive, setlocalLlmActive] = useMountedState(llmActive);
	const { data: resAIQuery, postLLMQuery } = usePostLLM();
	const isLlmActive = !!llmActive;
	const isSqlSearchActive = isQuerySearchActive && mode === 'sql';

	const updateQuery = useCallback((query: string) => {
		queryCodeEditorRef.current = query;
		setQuery(query);
	}, []);

	const handleAIGenerate = useCallback(() => {
		if (!aiQuery?.length) {
			notify({ message: 'Please enter a valid query' });
			return;
		}
		localStreamName && postLLMQuery(aiQuery, localStreamName);
	}, [aiQuery]);

	useEffect(() => {
		if (resAIQuery) {
			const warningMsg =
				'-- LLM generated query is experimental and may produce incorrect answers\n-- Always verify the generated SQL before executing\n\n';
			updateQuery(warningMsg + resAIQuery);
		}
	}, [resAIQuery]);

	const handleEditorChange = (code: any) => {
		if (currentStream) {
			updateQuery(code);
			errChecker(code, currentStream);
			monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), 'owner', ErrorMarker);
		}
	};

	useEffect(() => {
		if (currentStream !== localStreamName) {
			setlocalStreamName(currentStream);
			const query = `SELECT * FROM ${currentStream} LIMIT ${LOAD_LIMIT}; `;
			updateQuery(query);
		}
		setlocalLlmActive(isLlmActive);
	}, [currentStream, isLlmActive]);

	useEffect(() => {
		updateQuery(queryCodeEditorRef.current);
	}, []);

	function handleEditorDidMount(editor: any, monaco: any) {
		editorRef.current = editor;
		monacoRef.current = monaco;
		editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, async () => {
			runQuery(queryCodeEditorRef.current);
		});
	}

	const runQuery = (inputQuery: string) => {
		const query = sanitiseSqlString(inputQuery);
		const parsedQuery = query.replace(/(\r\n|\n|\r)/gm, '');
		setCustSearchQuery(parsedQuery, 'sql');
		closeBuilderModal();
	};

	return (
		<Stack style={{ flex: 1 }}>
			<ScrollArea>
				<Box style={{ marginTop: 16, marginBottom: 8 }}>
					{localLlmActive ? (
						<Stack gap={0} style={{flexDirection: 'row', width: '100%'}}>
							<TextInput
								type="text"
								name="ai_query"
								id="ai_query"
								value={aiQuery}
								onChange={(e) => setAiQuery(e.target.value)}
								placeholder="Enter plain text to generate SQL query using OpenAI"
								w="85%"
							/>
							<Button variant="filled" w="15%" color="brandPrimary.4" radius={0} onClick={handleAIGenerate}>
								✨ Generate
							</Button>
						</Stack>
					) : (
						<Box style={{ width: '100%' }}>
							<Box component="a" href="https://www.parseable.com/docs/integrations/llm" target="_blank">
								Know More: How to enable SQL generation with OpenAI ?
							</Box>
						</Box>
					)}
				</Box>
				<SchemaList {...{ currentStream, fields }} />
				<Stack style={{ height: 200, flex: 1 }}>
					<Editor
						defaultLanguage="sql"
						value={query}
						onChange={handleEditorChange}
						options={{
							scrollBeyondLastLine: false,
							readOnly: false,
							fontSize: 12,
							wordWrap: 'on',
							minimap: { enabled: false },
							automaticLayout: true,
							mouseWheelZoom: true,
							padding: { top: 8 },
						}}
						onMount={handleEditorDidMount}
					/>
				</Stack>
			</ScrollArea>
			<Stack className={queryCodeStyles.footer} style={{ alignItems: 'center' }}>
				<Button onClick={resetQuerySearch} disabled={!isSqlSearchActive} variant='outline'>
					Clear
				</Button>
				<Button onClick={() => runQuery(query)}>Apply</Button>
			</Stack>
		</Stack>
	);
};

const SchemaList = (props: { currentStream: string | null; fields: Field[] }) => {
	const { currentStream, fields } = props;
	if (!fields || fields.length === 0) return null;

	const { leftColumns, rightColumns } = genColumnConfig(fields);
	return (
		<Box>
			<Text
				style={{
					fontSize: 12,
					color: '#098658',
					fontFamily: 'monospace',
				}}>{`/* Schema for ${currentStream}`}</Text>
			<Flex style={{ alignItems: 'flex-start', padding: 6, paddingTop: 4 }}>
				<Box style={{ width: '50%' }}>
					{leftColumns.map((config, index) => {
						return (
							<Text
								key={index}
								style={{ fontSize: 12, color: '#098658', fontFamily: 'monospace' }}>{`${config}\n\n`}</Text>
						);
					})}
				</Box>
				<Box style={{ width: '50%' }}>
					{rightColumns.map((config, index) => {
						return (
							<Text
								key={index}
								style={{ fontSize: 12, color: '#098658', fontFamily: 'monospace' }}>{`${config}\n\n`}</Text>
						);
					})}
				</Box>
			</Flex>
			<Text style={{ fontSize: 12, color: '#098658', fontFamily: 'monospace' }}> */</Text>
		</Box>
	);
};

export default QueryCodeEditor;
