import React, { FC, MutableRefObject, useCallback, useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Flex, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { ErrorMarker, errChecker } from '../ErrorMarker';
import useMountedState from '@/hooks/useMountedState';
import { notify } from '@/utils/notification';
import { usePostLLM } from '@/hooks/usePostLLM';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';
import { Field } from '@/@types/parseable/dataType';
import queryCodeStyles from '../../styles/QueryCode.module.css';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useFilterStore } from '../../providers/FilterProvider';
import { LOAD_LIMIT, useLogsStore } from '../../providers/LogsProvider';
import { useStreamStore } from '../../providers/StreamProvider';

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

const defaultCustSQLQuery = (streamName: string | null) => {
	if (streamName && streamName.length > 0) {
		return `SELECT * FROM ${streamName} LIMIT ${LOAD_LIMIT};`;
	} else {
		return '';
	}
};

const QueryCodeEditor: FC<{
	queryCodeEditorRef: MutableRefObject<any>;
	onSqlSearchApply: (query: string) => void;
	onClear: () => void;
}> = (props) => {
	const [llmActive] = useAppStore((store) => store.instanceConfig?.llmActive);
	const [] = useFilterStore((store) => store);
	const [{ isQuerySearchActive, activeMode, savedFilterId, custSearchQuery }] = useLogsStore(
		(store) => store.custQuerySearchState,
	);
	const [schema] = useStreamStore((store) => store.schema);
	const fields = schema?.fields || [];
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [localStreamName, setlocalStreamName] = useMountedState<string | null>(currentStream);
	const [query, setQuery] = useMountedState<string>('');
	const [aiQuery, setAiQuery] = useMountedState('');
	const [localLlmActive, setlocalLlmActive] = useMountedState(llmActive);
	const { data: resAIQuery, postLLMQuery } = usePostLLM();
	const isLlmActive = !!llmActive;
	const isSqlSearchActive = isQuerySearchActive && activeMode === 'sql';

	useEffect(() => {
		if (props.queryCodeEditorRef.current === '' || currentStream !== localStreamName) {
			props.queryCodeEditorRef.current = defaultCustSQLQuery(currentStream);
		}
	}, [currentStream]);

	const updateQuery = useCallback((query: string) => {
		props.queryCodeEditorRef.current = query;
		setQuery(query);
	}, []);

	useEffect(() => {
		if (savedFilterId && isSqlSearchActive) {
			updateQuery(custSearchQuery);
		}
	}, [savedFilterId]);

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
		updateQuery(props.queryCodeEditorRef.current);
	}, []);

	const runQuery = useCallback(() => {
		const sanitizedQuery = sanitiseSqlString(query);
		const parsedQuery = sanitizedQuery.replace(/(\r\n|\n|\r)/gm, '');
		updateQuery(sanitizedQuery);
		props.onSqlSearchApply(parsedQuery);
	}, [query]);

	return (
		<Stack style={{ flex: 1, justifyContent: 'space-between' }}>
			<Box style={{ marginBottom: 8 }}>
				{localLlmActive ? (
					<Stack gap={0} style={{ flexDirection: 'row', width: '100%' }}>
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
						fontSize: 10,
						wordWrap: 'on',
						minimap: { enabled: false },
						automaticLayout: true,
						mouseWheelZoom: true,
						padding: { top: 8 },
					}}
					// onMount={handleEditorDidMount}
				/>
			</Stack>
			<Stack className={queryCodeStyles.footer} style={{ alignItems: 'center' }}>
				<Button onClick={props.onClear} disabled={!isSqlSearchActive} variant="outline">
					Clear
				</Button>
				<Button onClick={() => runQuery()}>Apply</Button>
			</Stack>
		</Stack>
	);
};

const SchemaList = (props: { currentStream: string | null; fields: Field[] }) => {
	const schemaListDivRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
	const [schemaDivHeight, setSchemaDivHeight] = useState<number>(0);
	const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const height = schemaListDivRef.current && schemaListDivRef.current.offsetHeight;
		setSchemaDivHeight(height ? height : 0);
	}, []);
	const { currentStream, fields } = props;
	if (!fields || fields.length === 0) return null;

	const { leftColumns, rightColumns } = genColumnConfig(fields);

	return (
		<Stack style={{ height: 190 }}>
			<ScrollArea scrollbars="y" onScrollPositionChange={onScrollPositionChange}>
				<Box ref={schemaListDivRef} >
					<Text
						style={{
							fontSize: '0.7rem',
							color: '#098658',
							fontFamily: 'monospace',
						}}>{`/* Schema for ${currentStream}`}</Text>
					<Flex style={{ alignItems: 'flex-start', padding: 6, paddingTop: 4 }}>
						<Box style={{ width: '50%' }}>
							{leftColumns.map((config, index) => {
								return (
									<Text
										key={index}
										style={{ fontSize: '0.7rem', color: '#098658', fontFamily: 'monospace' }}>{`${config}\n\n`}</Text>
								);
							})}
						</Box>
						<Box style={{ width: '50%' }}>
							{rightColumns.map((config, index) => {
								return (
									<Text
										key={index}
										style={{ fontSize: '0.7rem', color: '#098658', fontFamily: 'monospace' }}>{`${config}\n\n`}</Text>
								);
							})}
						</Box>
					</Flex>
					<Text style={{ fontSize: '0.7rem', color: '#098658', fontFamily: 'monospace' }}> */</Text>
				</Box>
			</ScrollArea>
			{schemaDivHeight > 190 && scrollPosition.y < 10 ? (
				<Text style={{ fontSize: '0.8rem', color: '#095286', textAlign: 'center' }}>Scroll to see more</Text>
			) : null}
		</Stack>
	);
};

export default QueryCodeEditor;
