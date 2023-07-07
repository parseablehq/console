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
  const { state: {result, subLogQuery } } = useQueryPageContext();
  const { data: queryResult, getQueryData , error,resetData } = useQueryResult();
  const editorRef = React.useRef<any>();
  const monacoRef = React.useRef<any>();
	const { classes } = useQueryStyles();
	const { runQueryBtn } = classes;
  const [query, setQuery] = React.useState<string>(`SELECT * FROM ${subLogQuery.get().streamName} LIMIT 100`);

  const handleEditorChange = (code: any) => {
    setQuery(code);
    errChecker(code,subLogQuery.get().streamName);
    monacoRef.current?.editor.setModelMarkers(
      editorRef.current?.getModel(),
      "owner",
      ErrorMarker
    );
  };

  useEffect(() => { 
    if (subLogQuery.get().streamName) {
      setQuery(`SELECT * FROM ${subLogQuery.get().streamName} LIMIT 100;`);
      result.set("");
    }
  } , [subLogQuery.get().streamName]);

  function handleEditorDidMount(editor:any, monaco:any) {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }
  const runQuery = () => {
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
    const parsedQuery=query.replace(/(\r\n|\n|\r)/gm, "");
    getQueryData(subLogQuery.get(), parsedQuery);

  }
  useEffect(() => {
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
      return;
    }
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
      return;
    }

  }, [queryResult , error]);

  return (
    <Box style={{ height: "100%", textAlign: "right" }} >
      <Editor
        height={"calc(100% - 40px)"}
        defaultLanguage="sql"
        value={query}
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
