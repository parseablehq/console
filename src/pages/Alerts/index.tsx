import { Stack } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import CreateAlerts from './CreateAlerts';

export default function Alerts() {
	useDocumentTitle('Parseable | Alerts');
	return (
		<Stack style={{ overflowY: 'hidden' }}>
			<CreateAlerts />
		</Stack>
	);
}
