import React ,{ FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import { Box, Button } from '@mantine/core';
import { useQueryResult } from '@/hooks/useQueryResult';
import { ErrorMarker, errChecker } from "./ErrorMarker";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert  } from '@tabler/icons-react';
import { useQueryStyles } from './styles';

const QueryCodeEditor: FC = () => {
  const { state: { query, result, subLogQuery } } = useQueryPageContext();
  const { data: queryResult, getQueryData , error } = useQueryResult();
  const editorRef = React.useRef<any>();
  const monacoRef = React.useRef<any>();
	const { classes } = useQueryStyles();
	const { runQueryBtn } = classes;

  query.set(`SELECT * FROM ${subLogQuery.get().streamName} LIMIT 10;`);

  const handleEditorChange = (code: any) => {
    query.set(code);
    errChecker(code,subLogQuery.get().streamName);
    monacoRef.current?.editor.setModelMarkers(
      editorRef.current?.getModel(),
      "owner",
      ErrorMarker
    );
    
  };

  function handleEditorDidMount(editor:any, monaco:any) {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }
  const runQuery = () => { 
    notifications.show({
      id: 'load-data',
      loading: true,
      color: '#545BEB',
      title: 'Running Query',
      message: 'Data will be loaded.',
      autoClose: false,
      withCloseButton: false,
    });
    const parsedQuery=query.get().replace(/(\r\n|\n|\r)/gm, "")
    getQueryData(subLogQuery.get(), parsedQuery);

  }
  useEffect(() => {

    if(queryResult){
      result.set(JSON.stringify(queryResult?.data, null, 2));
      notifications.update({
        id: 'load-data',
        color: 'green',
        title: 'Data was loaded',
        message: 'Successfully Loaded!!',
        icon: <IconCheck size="1rem" />,
        autoClose: 1000,
      });
    }
    if(error){
      notifications.update({
        id: 'load-data',
        color: 'red',
        title: 'Error Occured',
        message: 'Error Occured, please check your query and try again',
        icon: <IconFileAlert  size="1rem" />,
        autoClose: 2000,
      });
      result.set(error);
    }
  }, [queryResult , error]);

  return (
    <Box style={{ height: "100%", textAlign: "right" }} >
      <Editor
        height={"calc(100% - 40px)"}
        defaultLanguage="sql"
        value={query.get()}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          scrollBeyondLastLine: false,
          readOnly: false,
          fontSize: 12,
          wordWrap: "on",
          minimap: { enabled: false },
          automaticLayout: true,
          mouseWheelZoom: true,
          glyphMargin: true,
        }}
      />
        <Button variant='default' className={runQueryBtn} onClick={runQuery}>Run Query</Button>
      </Box>
  );
};

export default QueryCodeEditor;
