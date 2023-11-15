import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import classes from './Query.module.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import QueryCodeEditor from './QueryCodeEditor';
import QueryResultEditor from './QueryResultEditor';
import QuerySchemaList from './QuerySchemaList';
import { useQueryPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Query');

	const { container, innerContainer, schemaContainer } = classes;
	const {
		state: { subSchemaToggle },
	} = useQueryPageContext();
	const [isSchemaOpen, setIsSchemaOpen] = useMountedState(false);

	useEffect(() => {
		const listener = subSchemaToggle.subscribe(setIsSchemaOpen);
		return () => {
			listener();
		};
	}, [subSchemaToggle.get()]);

	return (
		<Box className={container}>
			<Box className={innerContainer}>
				<PanelGroup direction="vertical">
					<Panel defaultSize={40}>
						<QueryCodeEditor />
					</Panel>
					<PanelResizeHandle
						style={{
							height: '10px',
							background: '#CCCCCC',
						}}>
						<Box
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '100%',
								height: '1px',
							}}>
							&#8230;
						</Box>
					</PanelResizeHandle>
					<Panel defaultSize={60}>
						{/* <QueryResultEditor /> */}
					</Panel>
				</PanelGroup>
			</Box>
			<Box className={schemaContainer} display={isSchemaOpen ? '' : 'none'}>
				{/* <QuerySchemaList /> */}
			</Box>
		</Box>
	);
};

export default Logs;
