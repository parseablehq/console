import React ,{ FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryPageContext } from './Context';
import { Box, Button } from '@mantine/core';
import { useQueryResult } from '@/hooks/useQueryResult';
import { ErrorMarker, errChecker } from "./ErrorMarker";

const QueryCodeEditor: FC = () => {
  const { state: { query, result, subLogQuery } } = useQueryPageContext();
  const { data: queryResult, getQueryData , error} = useQueryResult();
  const editorRef = React.useRef<any>();
  const monacoRef = React.useRef<any>();
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
    const parsedQuery=query.get().replace(/(\r\n|\n|\r)/gm, "")
    getQueryData(subLogQuery.get(), parsedQuery);
  }
  useEffect(() => {
    result.set(JSON.stringify(queryResult?.data));
  }, [queryResult]);

  return (
    <>

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
        <Button variant='default' style={{ background: "#545BEB", color: "white", height: "40px" }} onClick={runQuery}>Run Query</Button>
      </Box>
    </>

  );
};

export default QueryCodeEditor;
