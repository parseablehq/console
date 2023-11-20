import React, { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';
import { ActionIcon, Box, Text } from '@mantine/core';
import { IconClipboard, IconSearch, IconCheck, IconDownload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import classes from './Query.module.css';

const QueryResultEditor: FC = () => {
	const {
		state: { result },
	} = useQueryPageContext();
	const [resultValue, setResultValue] = useMountedState<{ data: any } | null>(result.get());
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
	const downloadCSV = () => {
		const fileName = 'Parseable-logs';
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

		// clean up "a" element & remove ObjectURL
		document.body.removeChild(link);
		URL.revokeObjectURL(href);
	};

	const { HeaderContainer, textContext } = classes;
	return (
		<Box style={{ height: '100%' }}>
			<Box className={HeaderContainer}>
				<Text className={textContext}>Result</Text>
				<Box style={{ height: '100%', width: '100%', textAlign: 'right' }}>
					{resultValue && (
						<ActionIcon variant="default" radius={'md'} mr={'md'} size={'lg'} onClick={downloadCSV}>
							<IconDownload stroke={1.5} />
						</ActionIcon>
					)}
					<ActionIcon variant="default" radius={'md'} mr={'md'} size={'lg'} onClick={runCopy}>
						<IconClipboard stroke={1.5} />
					</ActionIcon>
					<ActionIcon variant="default" radius={'md'} size={'lg'} onClick={runFind}>
						<IconSearch stroke={1.5} />
					</ActionIcon>
				</Box>
			</Box>
			<Box style={{ marginTop: '5px', height: 'calc(100% - 60px)' }}>
				<Editor
					height={'100%'}
					defaultLanguage="json"
					value={formatJSON(resultValue ?? {data:{}})}
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
		</Box>
	);
};

export default QueryResultEditor;
