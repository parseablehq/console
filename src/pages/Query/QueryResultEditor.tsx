import React, { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';
import { Box, Button } from '@mantine/core';
import { IconCopy, IconSearch, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryStyles } from './styles';


const QueryResultEditor: FC = () => {
    const { state: { result } } = useQueryPageContext();
    const [resultValue, setResultValue] = useMountedState<string>(result.get());
    const editorRef = React.useRef<any>();
    const monacoRef = React.useRef<any>();
    const { classes } = useQueryStyles();
	const { actionBtn } = classes;

    useEffect(() => {
        const resultValueListener = result.subscribe(setResultValue);

        return () => {
            resultValueListener();
        }

    }, [resultValue]);

    const formatJSON = (jsonString: string) => {
        try {
            const jsonObject = JSON.parse(jsonString);
            return JSON.stringify(jsonObject, null, 2);
        } catch (e) {
            return jsonString;
        }
    }
    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
        monacoRef.current = monaco;
    }

    const runFind = () => {
        editorRef.current?.getAction('actions.find').run();
    }
    const runCopy = () => {
        // Focus the editor.
        editorRef.current?.focus();
        // Get the current editor's content.
        const data = editorRef.current?.getModel()?.getValue();
        // Set the clipboard contents.
        navigator.clipboard.writeText(data || "");

        notifications.show({
            color: 'green',
            icon: <IconCheck size="1rem" />,
            message: 'Copy Successfully',
            autoClose: 1000,
        })
    }

    return (

        <Box style={{ height: "100%", textAlign: "right" }} >
            <Button variant='default' leftIcon={<IconCopy size="1rem" />} className={actionBtn} onClick={runCopy} >Copy</Button>
            <Button variant='default' leftIcon={<IconSearch size="1rem" />} onClick={runFind}  className={actionBtn} >Find</Button>
            <Editor
                height={"calc(100% - 25px)"}
                defaultLanguage="json"
                value={formatJSON(resultValue)}
                onMount={handleEditorDidMount}
                options={{
                    scrollBeyondLastLine: false,
                    readOnly: true,
                    fontSize: 12,
                    wordWrap: "on",
                    minimap: { enabled: false },
                    automaticLayout: true,
                    mouseWheelZoom: true,
                    glyphMargin: true,
                    wordBasedSuggestions: true,
                }}
            />
        </Box>
    );
};

export default QueryResultEditor;