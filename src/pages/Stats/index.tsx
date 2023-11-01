import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import Status from './Status';
import Alerts from './Alerts';
import { useStatsStyles } from './styles';
import Retention from './Retention';

const Stats: FC = () => {
	useDocumentTitle('Parseable | Stats');

	const { classes } = useStatsStyles();
	const { container } = classes;
	return (
		<Box className={container}>
			<Status />
			<Retention />
			<Alerts />
		</Box>
	);
};

export default Stats;
