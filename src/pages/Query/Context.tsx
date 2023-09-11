import { Axios } from '@/api/axios';
import { IS_LLM_ACTIVE_URL } from '@/api/constants';
import useMountedState from '@/hooks/useMountedState';
import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';

import type { FC } from 'react';
import { ReactNode, createContext, useContext, useEffect } from 'react';

const Context = createContext({});

const { Provider } = Context;

export const defaultQueryResult = '';

interface QueryPageContextState {
	result: SubData<string>;
	subSchemaToggle: SubData<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface QueryPageContextMethods {}

interface QueryPageContextValue {
	state: QueryPageContextState;
	methods: QueryPageContextMethods;
	isLlmActive: boolean;
}

interface QueryPageProviderProps {
	children: ReactNode;
}

const QueryPageProvider: FC<QueryPageProviderProps> = ({ children }) => {
	const result = useSubscribeState<string>(defaultQueryResult);
	const subSchemaToggle = useSubscribeState<boolean>(false);
	const [isLlmActive, setIsLlmActive] = useMountedState(false);

	const state: QueryPageContextState = {
		result,
		subSchemaToggle,
	};

	const methods: QueryPageContextMethods = {};

	// function to test if LLM key has been set up in the backend
	const checkIfLlmActive = async () => {
		try {
			const { data } = await Axios().post(IS_LLM_ACTIVE_URL);
			setIsLlmActive(data.is_active);
		} catch (error) {
			console.log('Error in getting LLM status: ', error);
		}
	};

	useEffect(() => {
		checkIfLlmActive();
	}, []);

	return <Provider value={{ state, methods, isLlmActive }}>{children}</Provider>;
};

export const useQueryPageContext = () => useContext(Context) as QueryPageContextValue;

export default QueryPageProvider;
