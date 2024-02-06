import React, { FC, MutableRefObject, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, Button, Flex, Text, TextInput, Tooltip, px } from '@mantine/core';
import { ErrorMarker, errChecker } from './ErrorMarker';
import { IconPlayerPlayFilled, IconRotate } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import { notify } from '@/utils/notification';
import { usePostLLM } from '@/hooks/usePostLLM';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import { LOAD_LIMIT, useLogsPageContext } from '../Logs/Context';
import { Field } from '@/@types/parseable/dataType';
import queryCodeStyles from './styles/QueryCode.module.css'

type QueryCodeEditorProps = {
	inputRef: MutableRefObject<any>;
};

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

const QueryCodeEditor: FC<QueryCodeEditorProps> = (props) => {
	const {
		state: { subLogQuery, subInstanceConfig },
	} = useHeaderContext();
	const {
		state: {
			custQuerySearchState: { isQuerySearchActive },
			subLogStreamSchema,
		},
		methods: { resetQuerySearch, setCustSearchQuery },
	} = useLogsPageContext();

	const fields = subLogStreamSchema.get()?.fields || [];
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();
	const [localStreamName, setlocalStreamName] = useMountedState<string>(subLogQuery.get().streamName);
	const [query, setQuery] = useMountedState<string>('');
	const [aiQuery, setAiQuery] = useMountedState('');
	const [localLlmActive, setlocalLlmActive] = useMountedState(subInstanceConfig.get()?.llmActive);
	const { data: resAIQuery, postLLMQuery } = usePostLLM();
	const currentStreamName = subLogQuery.get().streamName;
	const isLlmActive = !!subInstanceConfig.get()?.llmActive;

	const updateQuery = useCallback((query: string) => {
		props.inputRef.current = query;
		setQuery(query)
	}, [])

	const handleAIGenerate = useCallback(() => {
		if (!aiQuery?.length) {
			notify({ message: 'Please enter a valid query' });
			return;
		}
		postLLMQuery(aiQuery, localStreamName);
	}, [aiQuery]);

	useEffect(() => {
		if (resAIQuery) {
			const warningMsg =
				'-- LLM generated query is experimental and may produce incorrect answers\n-- Always verify the generated SQL before executing\n\n';
				updateQuery(warningMsg + resAIQuery);
		}
	}, [resAIQuery]);

	const handleEditorChange = (code: any) => {
		updateQuery(code);
		errChecker(code, subLogQuery.get().streamName);
		monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), 'owner', ErrorMarker);
	};

	useEffect(() => {
		if (currentStreamName !== localStreamName) {
			setlocalStreamName(currentStreamName);
			const query = `SELECT * FROM ${currentStreamName} LIMIT ${LOAD_LIMIT}; `
			updateQuery(query);
		}
		setlocalLlmActive(isLlmActive);
	}, [currentStreamName, isLlmActive]);

	useEffect(() => {
		updateQuery(props.inputRef.current);
	}, []);

	function handleEditorDidMount(editor: any, monaco: any) {
		editorRef.current = editor;
		monacoRef.current = monaco;
		editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, async () => {
			runQuery(props.inputRef.current);
		});
	}

	const runQuery = (inputQuery: string) => {
		const query = sanitiseSqlString(inputQuery);
		const parsedQuery = query.replace(/(\r\n|\n|\r)/gm, '');
		setCustSearchQuery(parsedQuery);
	};

	const classes = queryCodeStyles;
	const { container, runQueryBtn, textContext, clearQueryBtn } = classes;

	return (
		<Box style={{ height: '100%' }}>
			<Box className={container}>
				<Text className={textContext}>Search Query</Text>
				<Box style={{ height: '100%', display: 'flex', textAlign: 'right', alignItems: 'center' }}>
					<Tooltip
						label={'Click to exit editor and reset search'}
						style={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button
							variant="default"
							className={clearQueryBtn}
							onClick={resetQuerySearch}
							disabled={!isQuerySearchActive}
							leftSection={<IconRotate size={px('1rem')} stroke={2} />}>
							Reset
						</Button>
					</Tooltip>
					<Tooltip
						label={'Click to run query or ctrl + enter '}
						style={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button
							variant="default"
							className={runQueryBtn}
							onClick={() => {
								runQuery(query);
							}}
							leftSection={<IconPlayerPlayFilled size={px('1rem')} stroke={1} />}>
							Search
						</Button>
					</Tooltip>
				</Box>
			</Box>
			<Box style={{ marginTop: 16, marginBottom: 8 }}>
				{localLlmActive ? (
					<TextInput
						type="text"
						name="ai_query"
						id="ai_query"
						value={aiQuery}
						onChange={(e) => setAiQuery(e.target.value)}
						placeholder="Enter plain text to generate SQL query using OpenAI"
						rightSectionWidth={'auto'}
						style={{
							'& .mantine-Input-input': {
								border: 'none',
								borderRadius: 0,
								backgroundColor: 'rgba(84,91,235,.2)',
								'::placeholder': {},
							},
							'& .mantine-TextInput-rightSection	': {
								height: '100%',
							},
						}}
						rightSection={
							<Button variant="filled" color="brandPrimary.4" radius={0} onClick={handleAIGenerate} h={'100%'}>
								✨ Generate
							</Button>
						}
					/>
				) : (
					<Box style={{ width: '100%' }}>
						<Box component="a" href="https://www.parseable.com/docs/integrations/llm" target="_blank">
							Know More: How to enable SQL generation with OpenAI ?
						</Box>
					</Box>
				)}
			</Box>
			<Box>
				<SchemaList {...{ currentStreamName, fields }} />
			</Box>
			<Box style={{ height: 'calc(100% - 400px)' }}>
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
			</Box>
		</Box>
	);
};

const SchemaList = (props: { currentStreamName: string; fields: Field[] }) => {
	const { currentStreamName, fields } = props;
	if (!fields || fields.length === 0) return null;

	const { leftColumns, rightColumns } = genColumnConfig(fields);
	return (
		<Box>
			<Text
				style={{
					fontSize: 12,
					color: '#098658',
					fontFamily: 'monospace',
				}}>{`/* Schema for ${currentStreamName}`}</Text>
			<Flex style={{ alignItems: 'flex-start', padding: 6, paddingTop: 4 }}>
				<Box style={{ width: '50%' }}>
					{leftColumns.map((config, index) => {
						return <Text key={index} style={{ fontSize: 12, color: '#098658', fontFamily: 'monospace' }}>{`${config}\n\n`}</Text>;
					})}
				</Box>
				<Box style={{ width: '50%' }}>
					{rightColumns.map((config, index) => {
						return <Text key={index} style={{ fontSize: 12, color: '#098658', fontFamily: 'monospace' }}>{`${config}\n\n`}</Text>;
					})}
				</Box>
			</Flex>
			<Text style={{ fontSize: 12, color: '#098658', fontFamily: 'monospace' }}> */</Text>
		</Box>
	);
};

export default QueryCodeEditor;
