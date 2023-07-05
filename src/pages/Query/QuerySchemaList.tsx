import { FC, useEffect } from 'react';
import { useGetLogStreamSchema } from '@/hooks/useGetLogStreamSchema';
import { useQueryPageContext } from './Context';
import { Table, Box, Title } from '@mantine/core';



const QuerySchemaList: FC = () => {
	const { data: querySchema, getDataSchema, resetData, loading, error: logStreamSchemaError } = useGetLogStreamSchema();
	const { state: { subLogQuery } } = useQueryPageContext();

	useEffect(() => {

		if (subLogQuery.get().streamName) {
			if (querySchema) {
				resetData();
			}
			getDataSchema(subLogQuery.get().streamName);
		}
	}, []);

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

	return (

		<Box sx={{ padding: 5 ,height:"100%",overflow:"auto"}}>
			<Title order={4}> Schema for {subLogQuery.get().streamName}</Title >

			{!(logStreamSchemaError) ? (
				!loading && !!querySchema ? (
					!!querySchema.fields.length ? (
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
