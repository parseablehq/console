import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import { useQueryStyles } from './styles';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import QueryCodeEditor from './QueryCodeEditor';
import QueryResultEditor from './QueryResultEditor';
// import QuerySchemaList from './QuerySchemaList';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Query');

	const { classes } = useQueryStyles();
	const { container,innerContainer1 } = classes;


	return (
		<Box className={container}>
			<Box className={innerContainer1}>
					<PanelGroup direction="vertical">
						<Panel defaultSize={30}>
							<QueryCodeEditor />
						</Panel>
						<PanelResizeHandle style={{
							height: "10px",
							background: "#CCCCCC",
						}}>
							<Box sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "100%",
								height: "1px",
							}}>
								&#8230;
							</Box>
						</PanelResizeHandle>
						<Panel defaultSize={70}>
							<QueryResultEditor />
						</Panel>
					</PanelGroup>

			</Box>

		</Box>
	);
};

export default Logs;
