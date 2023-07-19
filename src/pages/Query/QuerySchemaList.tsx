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
	const {actionBtn ,container ,textContext ,theadSt ,tbodySt ,innercontainer}=classes;

	return (
<Box  className={container}>
		<Box className={innercontainer}>
			<Title className={textContext}> Schema for {subLogQuery.get().streamName}</Title >
			<Button variant='default'  className={actionBtn} onClick={()=> subSchemaToggle.set((state)=>!state) }><IconSquareRoundedXFilled/></Button>
		</Box>
			
			{!(logStreamSchemaError) ? (
				!loading && Boolean(querySchema) ? (
					(querySchema?.fields.length) ? (
						<Table >
						  <thead className={theadSt}>
							<tr>
							  <th>Feild</th>
							  <th>Type</th>
							</tr>
						  </thead>
						  <tbody className={tbodySt}>{renderList}</tbody>
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
