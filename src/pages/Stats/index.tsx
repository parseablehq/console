import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import Status from './Status';
import Alerts from './Alerts';

const Stats: FC = () => {
	useDocumentTitle('Parseable | Stats');

	return (
		<Box style={{ flex: 1, position: 'relative' }}>
			<Status />
			<Alerts />
		</Box>
	);
};

export default Stats;
