import React, { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';
import { Box, Button, Text, px } from '@mantine/core';
import { IconCopy, IconSearch, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryResultEditorStyles } from './styles';


const QueryResultEditor: FC = () => {
    const { state: { result } } = useQueryPageContext();
    const [resultValue, setResultValue] = useMountedState<string>(result.get());
    const editorRef = React.useRef<any>();
    const monacoRef = React.useRef<any>();


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
    const { classes } = useQueryResultEditorStyles();
    const { actionBtn, container, textContext } = classes;
    return (

        <Box  style={{ height: "100%" }}>
            <Box className={container}>
                <Text className={textContext}>Result</Text>
                <Box style={{ height: "100%", width:"100%", textAlign: "right" }} >
                <Button variant='default' leftIcon={<IconCopy size={px('1.2rem')} stroke={1.5} />} className={actionBtn} onClick={runCopy} >Copy</Button>
                <Button variant='default' leftIcon={<IconSearch size={px('1.2rem')} stroke={1.5} />} onClick={runFind} className={actionBtn} >Find</Button>
                </Box>
            </Box>
      <Box sx={{marginTop:"5px", height:"calc(100% - 60px)"}}>
      <Editor
                height={"100%"}
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
        </Box>
    );
};

export default QueryResultEditor;