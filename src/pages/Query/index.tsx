import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import { useQueryStyles } from './styles';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import QueryCodeEditor from './QueryCodeEditor';
import QueryResultEditor from './QueryResultEditor';
import { useParams } from "react-router-dom";
import QuerySchemaList from './QuerySchemaList';
import { useQueryPageContext, DEFAULT_FIXED_DURATIONS } from './Context';
import dayjs from 'dayjs';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Query');
	const { state: { subLogQuery } } = useQueryPageContext();
	const { streamName } = useParams();
	const { classes } = useQueryStyles();
	const { container } = classes;

	if (subLogQuery.get().streamName !== streamName) {
		const now = dayjs();

		subLogQuery.set((state) => {
			state.searchText = '';
			state.streamName = streamName || '';
			state.page = 1;
			state.startTime = now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate();
			state.endTime = now.toDate();
		});

	}

	return (
		<Box className={container}>
			<PanelGroup direction="horizontal">
				<Panel defaultSize={20} >
					<QuerySchemaList />
				</Panel>
				<PanelResizeHandle style={{
					width: "10px",
					background: "#CCCCCC",
				}}>
					<Box sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}>
						&#8942;
					</Box>
				</PanelResizeHandle>
				<Panel >
					<PanelGroup direction="vertical">
						<Panel defaultSize={20}>
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
						<Panel defaultSize={80}>
							<QueryResultEditor />
						</Panel>
					</PanelGroup>
					
				</Panel>
			</PanelGroup>

		</Box>
	);
};

export default Logs;
