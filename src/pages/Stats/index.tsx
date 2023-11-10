import { Box } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import Status from './Status';
import Alerts from './Alerts';

import Retention from './Retention';

const Stats: FC = () => {
	useDocumentTitle('Parseable | Stats');
	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'column',
				flex: '1 1 auto',
				overflow: 'scroll',
			}}>
			<Status />
			<Retention />
			<Alerts />
		</Box>
	);
};

export default Stats;
