import React, { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';
import { ActionIcon, Box, Menu, ScrollArea, SegmentedControl, Table, Text, rem } from '@mantine/core';
import { IconClipboard, IconSearch, IconCheck, IconDownload, IconCsv, IconJson } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import classes from './Query.module.css';

const fileName = 'Parseable-logs';

const QueryResultEditor: FC = () => {
	const {
		state: { result },
	} = useQueryPageContext();
	const [resultValue, setResultValue] = useMountedState<{ data: any } | null>(result.get());
	const [view, setView] = useMountedState('json');
	const editorRef = React.useRef<any>();
	const monacoRef = React.useRef<any>();

	useEffect(() => {
		const resultValueListener = result.subscribe(setResultValue);

		return () => {
			resultValueListener();
		};
	}, [resultValue]);

	const formatJSON = (jsonString: { data: any }) => {
		try {
			if (jsonString && typeof jsonString.data === 'object') {
				return JSON.stringify(jsonString.data, null, 2);
			} else {
				return JSON.stringify(jsonString, null, 2);
			}
		} catch (e) {
			return 'Error in parsing the error.';
		}
	};
	function handleEditorDidMount(editor: any, monaco: any) {
		editorRef.current = editor;
		monacoRef.current = monaco;
	}

	const runFind = () => {
		editorRef.current?.getAction('actions.find').run();
	};
	const runCopy = () => {
		// Focus the editor.
		editorRef.current?.focus();
		// Get the current editor's content.
		const data = editorRef.current?.getModel()?.getValue();
		// Set the clipboard contents.
		navigator.clipboard.writeText(data || '');

		notifications.show({
			color: 'green',
			icon: <IconCheck size="1rem" />,
			message: 'Copy Successfully',
			autoClose: 1000,
		});
	};
	const downloadJson = () => {
		let json = undefined;
		if (resultValue && typeof resultValue.data === 'object') {
			json = JSON.stringify(resultValue.data, null, 2);
		} else {
			json = JSON.stringify(resultValue, null, 2);
		}

		const blob = new Blob([json], { type: 'application/json' });
		const href = URL.createObjectURL(blob);

		// create "a" HTLM element with href to file
		const link = document.createElement('a');
		link.href = href;
		link.download = fileName + '.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(href);
	};

	function downloadCsv() {
		let csvData;
		if (resultValue && typeof resultValue.data === 'object') {
			csvData = jsonToCsv(resultValue.data);
		} else {
			csvData = jsonToCsv(resultValue);
		}
		let blob = new Blob([csvData], { type: 'text/csv' });
		let url = URL.createObjectURL(blob);
		let a = document.createElement('a');
		a.href = url;
		a.download = fileName + '.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	function jsonToCsv(jsonData: any) {
		let csv = '';
		// Get the headers
		let headers = Object.keys(jsonData[0]);
		csv += headers.join(',') + '\n';
		// Add the data
		jsonData.forEach(function (row: any) {
			let data = headers.map((header) => JSON.stringify(row[header])).join(','); // Add JSON.stringify statement
			csv += data + '\n';
		});
		return csv;
	}

	const renderView = () => {
		if (view === 'json') {
			return (
				<Box style={{ height: 'calc(100% - 55px)', width: 'calc(100% - 10px)' }}>
					<Editor
						height={'100%'}
						defaultLanguage="json"
						value={formatJSON(resultValue ?? { data: {} })}
						onMount={handleEditorDidMount}
						options={{
							scrollBeyondLastLine: false,
							readOnly: true,
							fontSize: 12,
							wordWrap: 'on',
							minimap: { enabled: false },
							automaticLayout: true,
							mouseWheelZoom: true,
							glyphMargin: true,
							wordBasedSuggestions: true,
						}}
					/>
				</Box>
			);
		}
		if (view === 'table') {
			return (
				<ScrollArea className={classes.tableWrapper}>
					<Table striped highlightOnHover withTableBorder withColumnBorders>
						<Table.Thead
							style={{
								position: 'sticky',
								top: 0,
								background:"white"
							}}>
							<Table.Tr>
								{resultValue && resultValue.data.length !== 0
									? Object.keys(resultValue.data[0]).map((key) => {
											return <Table.Th>{key}</Table.Th>;
									  })
									: 'null'}
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{resultValue &&
								resultValue.data.length !== 0 &&
								resultValue.data.map((item: any) => {
									return (
										<Table.Tr>
											{Object.values(item).map((value: any) => {
												return <Table.Td>{value}</Table.Td>;
											})}
										</Table.Tr>
									);
								})}
						</Table.Tbody>
					</Table>
				</ScrollArea>
			);
		}
	};

	const { HeaderContainer, textContext } = classes;
	return (
		<Box style={{ height: '100%' }}>
			<Box className={HeaderContainer}>
				<Text className={textContext}>Result</Text>
				<Box className={classes.HeaderContainerRight}>
					{resultValue && (
						<>
							{resultValue.data.length !== 0 && (
								<SegmentedControl
									data={[
										{ value: 'json', label: 'JSON' },
										{ value: 'table', label: 'Table' },
									]}
									value={view}
									onChange={setView}
								/>
							)}
							<Menu shadow="md" width={200}>
								<Menu.Target>
									<ActionIcon variant="default" radius={'md'} size={'lg'}>
										<IconDownload stroke={1.5} />
									</ActionIcon>
								</Menu.Target>

								<Menu.Dropdown>
									<Menu.Label>Download</Menu.Label>
									{resultValue.data.length !== 0 && (
										<Menu.Item
											onClick={downloadCsv}
											leftSection={<IconCsv style={{ width: rem(14), height: rem(14) }} />}>
											Download as csv
										</Menu.Item>
									)}

									<Menu.Item
										onClick={downloadJson}
										leftSection={<IconJson style={{ width: rem(14), height: rem(14) }} />}>
										Download as json
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						</>
					)}
					<ActionIcon variant="default" radius={'md'} size={'lg'} onClick={runCopy}>
						<IconClipboard stroke={1.5} />
					</ActionIcon>
					<ActionIcon variant="default" radius={'md'} size={'lg'} onClick={runFind}>
						<IconSearch stroke={1.5} />
					</ActionIcon>
				</Box>
			</Box>
			{renderView()}
		</Box>
	);
};

export default QueryResultEditor;
