import { Box, Center, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect } from 'react';
import LogStreamList from './LogStreamList';
import { useLogsStyles } from './styles';
import { useLogsPageContext } from './Context';
import useMountedState from '@/hooks/useMountedState';

const Logs: FC = () => {
	useDocumentTitle('Parseable | Dashboard');

	const { classes } = useLogsStyles();
	const { container } = classes;

	const {
		state: { subSelectedStream },
	} = useLogsPageContext();

	const [selectedStream, setSelectedStream] = useMountedState('');

	useEffect(() => {
		const listener = subSelectedStream.subscribe(setSelectedStream);

		return () => listener();
	}, []);

	return (
		<Box className={container}>
			<LogStreamList />
			<Center
				style={{
					flex: 1,
				}}>
				<Text>{selectedStream}</Text>
			</Center>
		</Box>
	);
};

export default Logs;
