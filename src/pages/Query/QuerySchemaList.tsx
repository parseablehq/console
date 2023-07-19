import { FC, useEffect } from 'react';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Table, Box, Title, Button } from '@mantine/core';
import {  IconSquareRoundedXFilled } from '@tabler/icons-react';
import {  useQuerySchemaListStyles } from './styles';
import { useQueryPageContext } from './Context';

const QuerySchemaList: FC = () => {
	const { data: querySchema, getDataSchema, resetData, loading, error: logStreamSchemaError } = useGetLogStreamSchema();
	const { state: { subLogQuery } } = useHeaderContext();
	const { state: { subSchemaToggle } } = useQueryPageContext();

	useEffect(() => {
		if (subLogQuery.get().streamName) {
			if (querySchema) {
				resetData();
			}
			getDataSchema(subLogQuery.get().streamName);
		}
	}, [subLogQuery.get()]);

	const renderList = querySchema?.fields.map((field, index) => {
		if(typeof field.data_type === "string")
		return (
			<tr key={index}>
				<td>{field.name}</td>
				<td>{field.data_type}</td>
			</tr>
		);
		else{
			return (
				<tr key={index}>
					<td>{field.name}</td>
					<td>{JSON.stringify(field.data_type)}</td>
				</tr>
			);
		}
	});

const {classes} = useQuerySchemaListStyles();
	const {actionBtn ,container}=classes;

	return (
<Box  style={{ height: "100%" }}>
		<Box className={container}>
			<Title order={4}> Schema for {subLogQuery.get().streamName}</Title >
			<Button variant='default'  className={actionBtn} onClick={()=> subSchemaToggle.set((state)=>!state) }><IconSquareRoundedXFilled/></Button>
		</Box>
			
			{!(logStreamSchemaError) ? (
				!loading && Boolean(querySchema) ? (
					(querySchema?.fields.length) ? (
						<Table >
						  <thead>
							<tr>
							  <th>Feild</th>
							  <th>Type</th>
							</tr>
						  </thead>
						  <tbody>{renderList}</tbody>
						</Table>
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
