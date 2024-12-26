import { Button, Select, Stack, Text, TextInput, Tabs, Box } from '@mantine/core';
import Editor from '@monaco-editor/react';
import { useDocumentTitle } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
const PageTitle = () => {
	return <Text>Alerts</Text>;
};

const CreateAlertsBtn = () => {
	const createAlerts = () => {
		console.log('clicked');
	};
	return (
		<Button onClick={createAlerts} leftSection={<IconPlus size={'1rem'} stroke={1.5} />}>
			Create
		</Button>
	);
};

export default function Alerts() {
	useDocumentTitle('Parseable | Alerts');
	return (
		<Stack style={{ padding: '1rem' }}>
			{/* <Stack
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}>
				<PageTitle />
				<CreateAlertsBtn />
			</Stack> */}
			<Stack>
				<Text size="lg"> Create Alerts</Text>
				<AlertTitle />
				<SelectStream />
				<ContactPoint />
				<Tabs defaultValue="builder">
					<Tabs.List>
						<Tabs.Tab value="builder" style={{ fontSize: '1rem', fontWeight: 500 }}>
							Builder
						</Tabs.Tab>
						<Tabs.Tab value="sql" style={{ fontSize: '1rem', fontWeight: 500 }}>
							SQL
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="builder" style={{ padding: '1rem' }}>
						<Stack style={{ alignItems: 'center' }}>
							<Stack
								w="50vw"
								h="10rem"
								style={{
									padding: '2rem',
									flexDirection: 'row',
									justifyContent: 'space-around',
									alignItems: 'center',
									border: '1px solid gray',
								}}>
								<TextInput w="33rem" label="Aggregate" />
								<Select w="33rem" label="Operator" />
								<TextInput w="33rem" label="Threshhold" />
							</Stack>
							<Stack
								w="50vw"
								h="10rem"
								style={{
									padding: '2rem',
									flexDirection: 'row',
									justifyContent: 'space-around',
									alignItems: 'center',
									border: '1px dotted gray',
								}}>
								<Button>Add</Button>
							</Stack>
							<Box w="50vw" style={{ display: 'flex', justifyContent: 'end' }}>
								<Button>Apply</Button>
							</Box>
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value="sql" style={{ padding: '1rem' }}>
						<Stack style={{ alignItems: 'center' }}>
							<Box
								w="50vw"
								style={{
									border: '1px dotted green',
									height: 200,
									display: 'flex',
									flexDirection: 'column',
									marginBottom: '1rem',
								}}>
								<Editor
									defaultLanguage="sql"
									value={'hello '}
									// onChange={handleEditorChange}
									options={{
										scrollBeyondLastLine: false,
										readOnly: false,
										fontSize: 12,
										wordWrap: 'on',
										minimap: { enabled: false },
										automaticLayout: true,
										mouseWheelZoom: true,
										padding: { top: 8 },
									}}
									// onMount={handleEditorDidMount}
								/>
							</Box>
							<Box w="50vw" style={{ display: 'flex', justifyContent: 'end' }}>
								<Button>Apply</Button>
							</Box>
						</Stack>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</Stack>
	);
}

const AlertTitle = () => {
	return <TextInput label="Alert Title" size="sm" w="15rem" />;
};

const SelectStream = () => {
	return <Select label="Select Stream" size="sm" w="15rem" data={['Backend', 'Frontend', 'abc', 'test']}></Select>;
};

const ContactPoint = () => {
	return (
		<Stack style={{ display: 'flex', flexDirection: 'row', alignItems: 'end' }}>
			<TextInput label="Add Contact Point" w="50rem"></TextInput>
			<Button>Add</Button>
		</Stack>
	);
};
