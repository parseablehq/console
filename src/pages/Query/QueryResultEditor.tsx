import { FC, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {  useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';


const QueryResultEditor: FC = () => {
    const { state: { result } } = useQueryPageContext();
    const [resultValue, setResultValue] = useMountedState<string>(result.get());
    
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
	return (
        
        <Editor 
        height="100%" 
        defaultLanguage="json" 
        value={formatJSON(resultValue)}
        options = {{
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
	);
};

export default QueryResultEditor;