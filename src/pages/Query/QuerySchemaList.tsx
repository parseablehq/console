import { FC, useEffect } from 'react';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Table, Box, Title, Button, ScrollArea } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
// import { useQuerySchemaListStyles } from './styles';
import classes from "./Query.module.css"
import { useQueryPageContext } from './Context';

const QuerySchemaList: FC = () => {
	const { data: querySchema, getDataSchema, resetData, loading, error: logStreamSchemaError } = useGetLogStreamSchema();
	const {
		state: { subLogQuery },
	} = useHeaderContext();
	const {
		state: { subSchemaToggle },
	} = useQueryPageContext();


	useEffect(() => {
		const subSchemaToggleListener = subSchemaToggle.subscribe((state) => {
			if (state) {
				getDataSchema(subLogQuery.get().streamName);
			}
		});
		const subQueryListener = subLogQuery.subscribe((state) => {
			if (querySchema) {
				resetData();
			}
			getDataSchema(state.streamName);
		});
		return () => {
			subQueryListener();
			subSchemaToggleListener();
		};
	}, [querySchema]);


	const renderList = querySchema?.fields.map((field, index) => {
		if (typeof field.data_type === 'string')
			return (
				<tr key={index}>
					<td>{field.name}</td>
					<td>{field.data_type}</td>
				</tr>
			);
		else {
			return (
				<tr key={index}>
					<td>{field.name}</td>
					<td>{JSON.stringify(field.data_type)}</td>
				</tr>
			);
		}
	});

	const { actionBtn, container, textContext, theadSt, tbodySt, innercontainer, scrollAreaSt } = classes;

	return (
		<Box className={container}>
			<Box className={innercontainer}>
				<Title className={textContext}> Schema for {subLogQuery.get().streamName}</Title>
				<Button variant="default" className={actionBtn} onClick={() => subSchemaToggle.set((state) => !state)}>
					<IconX />
				</Button>
			</Box>

			{!logStreamSchemaError ? (
				!loading && Boolean(querySchema) ? (
					querySchema?.fields.length ? (
						<ScrollArea type="always" className={scrollAreaSt}>
							<Table>
								<thead className={theadSt}>
									<tr>
										<th>Field</th>
										<th>Type</th>
									</tr>
								</thead>
								<tbody className={tbodySt}>{renderList}</tbody>
							</Table>
						</ScrollArea>
					) : (
						<p>No Data</p>
					)
				) : (
					<p>loading..</p>
				)
			) : (
				<p>Error: {logStreamSchemaError}</p>
			)}
		</Box>
	);
};

export default QuerySchemaList;
