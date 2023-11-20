import useSubscribeState, { SubData } from '@/hooks/useSubscribeState';

import type { FC } from 'react';
import { ReactNode, createContext, useContext } from 'react';

const Context = createContext({});

const { Provider } = Context;

export const defaultQueryResult = null;

interface QueryPageContextState {
	result: SubData<{data:any}|null>;
	subSchemaToggle: SubData<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface QueryPageContextMethods {}

interface QueryPageContextValue {
	state: QueryPageContextState;
	methods: QueryPageContextMethods;
}

interface QueryPageProviderProps {
	children: ReactNode;
}

const QueryPageProvider: FC<QueryPageProviderProps> = ({ children }) => {
	const result = useSubscribeState<{data:any}|null>(defaultQueryResult);
	const subSchemaToggle = useSubscribeState<boolean>(false);

	const state: QueryPageContextState = {
		result,
		subSchemaToggle,
	};

	const methods: QueryPageContextMethods = {};

	return <Provider value={{ state, methods }}>{children}</Provider>;
};

export const useQueryPageContext = () => useContext(Context) as QueryPageContextValue;

export default QueryPageProvider;
