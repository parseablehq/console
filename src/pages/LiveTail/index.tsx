import { Box, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';


import { useLiveTailStyles } from './styles';

const LiveTail: FC = () => {
	useDocumentTitle('Parseable | Live Tail');

	const { classes } = useLiveTailStyles();
	const { container } = classes;
	return (
		<Box className={container}>
			<Text>Live Tail</Text>
		</Box>
	);
};

export default LiveTail;
