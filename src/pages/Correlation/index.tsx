import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import _ from 'lodash';
import { useDocumentTitle } from '@mantine/hooks';
import { Group, Stack } from '@mantine/core';
import LogsView from '../Stream/Views/Explore/LogsView';

const Correlation = () => {
	useDocumentTitle('Parseable | Correlation');

	return (
		<Group>
			<Stack style={{ flex: 1 }}>
				<LogsView schemaLoading={false} infoLoading={false} />
			</Stack>
			<Stack style={{ flex: 1 }}>
				<LogsView schemaLoading={false} infoLoading={false} />
			</Stack>
		</Group>
	);
};

export default Correlation;
