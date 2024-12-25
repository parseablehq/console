import { Stack, Text } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
const PageTitle = () => {
	return <Text>Alerts</Text>;
};

export default function Alerts() {
	useDocumentTitle('Parseable | Alerts');
	return (
		<Stack style={{ padding: '1rem' }}>
			<PageTitle />
		</Stack>
	);
}
