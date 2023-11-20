import { FC, useEffect } from 'react';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Table, Box, ScrollArea, ActionIcon, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import classes from './Query.module.css';
import { useQueryPageContext } from './Context';

const QuerySchemaList: FC = () => {
	const { data: querySchema, getDataSchema, resetData, loading, error: logStreamSchemaError } = useGetLogStreamSchema();
	const {
		state: { subAppContext },
	} = useHeaderContext();
	const {
		state: { subSchemaToggle },
	} = useQueryPageContext();

	useEffect(() => {
		const subSchemaToggleListener = subSchemaToggle.subscribe((state) => {
			if (state) {
				if (subAppContext.get().selectedStream) {
					getDataSchema(subAppContext.get().selectedStream ?? '');
				}
			}
		});
		const subQueryListener = subAppContext.subscribe((state) => {
			if (querySchema) {
				resetData();
			}
			if (state.selectedStream) {
				getDataSchema(state.selectedStream);
			}
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

	const { HeaderContainer, theadSt, tbodySt, innercontainer, scrollAreaSt } = classes;

	return (
		<Box className={innercontainer}>
			<Box className={HeaderContainer}
			style={{
				justifyContent:"space-between"
			}}
			>
				<Text> Schema for {subAppContext.get().selectedStream}</Text>
				<ActionIcon
					variant="default"
					radius={'md'}
					mr={'md'}
					size={'lg'}
					onClick={() => subSchemaToggle.set((state) => !state)}>
					<IconX />
				</ActionIcon>
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
