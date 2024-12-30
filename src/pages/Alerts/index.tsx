import { Button, Select, Stack, Text, TextInput, Box, Breadcrumbs, Anchor, Divider, Group } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { useDocumentTitle } from '@mantine/hooks';
import { useEffect } from 'react';
// import { IconHomeStats } from '@tabler/icons-react';

const items = [
	{
		title:
			// <IconHome size={'1rem'} />
			// <IconHomeFilled size={'1rem'} />
			// <IconHomeStats stroke={1.5} size="1rem" />

			' Home',
		href: '/',
	},
	{ title: 'Alerts', href: '/alerts' },
	{ title: 'Create Alerts', href: '/alerts' },
].map((item, index) => (
	<Anchor href={item.href} key={index} style={{ alignItems: 'center' }}>
		{item.title}
	</Anchor>
));

const SeverityLevels = ['Low(P3)', 'Medium(P2)', 'High(P1)', 'Critical(P0)'];
// const PageTitle = () => {
// 	return <Text>Alerts</Text>;
// };

// const CreateAlertsBtn = () => {
// 	const createAlerts = () => {
// 		console.log('clicked');
// 	};
// 	return (
// 		<Button onClick={createAlerts} leftSection={<IconPlus size={'1rem'} stroke={1.5} />}>
// 			Create
// 		</Button>
// 	);
// };

const AlertBuilderPills = () => {
	return (
		<Stack
			style={{
				padding: '1rem',
				justifyContent: 'space-around',
				border: '1px solid gray',
			}}>
			<TextInput w="33rem" label="Aggregate" styles={{ label: { paddingBottom: '0.5rem' } }} />
			<Divider label="Metric" />
			<Group w="100%" style={{ flexDirection: 'row' }}>
				<Select w="32%" label="Field" />
				<Select w="32%" label="Operator" />
				<TextInput w="32%" label="Value" />
			</Group>
			<Divider label="Threshold" />
			<Group w="100%" style={{ flexDirection: 'row' }}>
				<Select w="32%" label="Operator" />
				<TextInput w="32%" label="Value" />
			</Group>
		</Stack>
	);
};

export default function Alerts() {
	useDocumentTitle('Parseable | Alerts');
	return (
		<Stack style={{ padding: '1rem' }}>
			<Breadcrumbs separator=">">{items}</Breadcrumbs>

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
				<Text size="lg"> New Alert</Text>
				<AlertTitle />
				<SelectStream />
				{/* <ContactPoint /> */}

				<Stack style={{ display: 'flex', flexDirection: 'row' }}>
					<Stack w="50%" style={{ justifyContent: 'center' }}>
						<Stack
							style={{
								padding: '1rem',
								justifyContent: 'space-around',
								border: '1px solid gray',
								flexDirection: 'row',
							}}>
							<Select
								w="8%"
								label="Aggregate"
								defaultValue={'AVG'}
								data={['AVG', 'COUNT', 'MAX', 'MIN', 'SUM']}
								// styles={{ label: { paddingBottom: '0.5rem' } }}
							/>
							{/* <Divider label="Conditions" /> */}

							<Select label="Field" />
							<Select w="22%" label="Operator" />
							<TextInput w="25%" label="Value" />

							{/* </Box> */}
							{/* <Divider label="Threshold" /> */}
							{/* <Group w="100%" style={{ flexDirection: 'row', border: '2px solid red' }}> */}
							<Select w="6%" label="Operator" />
							<TextInput w="10%" label="Value" />
							{/* </Group> */}
						</Stack>
						<Divider orientation="vertical" label="Or / AND" />
						<Stack
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
					</Stack>
					<Divider orientation="vertical" size="sm"></Divider>
					<Stack w="50%">
						<Group>
							<CodeHighlight
								code="Select * from backend"
								language="SQL"
								styles={{ copy: { marginLeft: '550px' }, root: { width: '100%' } }}
								copyLabel="Copy SQL"
							/>
						</Group>
						<Divider label="Target" />
						<Group>
							<TextInput label="Target" w="100%" />
							<Box w="100%" style={{ display: 'flex', justifyContent: 'end', gap: 10 }}>
								<Button variant="outline">Edit</Button>
								<Button>Save </Button>
							</Box>
						</Group>
						<Divider label="Evalution" />
						<Group>
							<TextInput w="49%" label="Time" placeholder="Start Time" />
							<TextInput w="49%" label="Frequency" placeholder="10s" />
						</Group>
						<Divider label="Severity" />
						<Group>
							<Select
								label="Severity"
								size="sm"
								w="15rem"
								defaultValue={SeverityLevels[1]}
								data={SeverityLevels}></Select>
						</Group>
					</Stack>
				</Stack>
			</Stack>
			<Box style={{ display: 'flex', justifyContent: 'end', gap: 10 }}>
				<Button variant="outline">Discard</Button>
				<Button>Save Alert</Button>
			</Box>
		</Stack>
	);
}

const AlertTitle = () => {
	return <TextInput label="Alert Title" size="sm" w="15rem" />;
};

const SelectStream = () => {
	return <Select label="Select Stream" size="sm" w="15rem" data={['Backend', 'Frontend', 'abc', 'test']}></Select>;
};

// const ContactPoint = () => {
// 	return (
// 		<Stack style={{ display: 'flex', flexDirection: 'row', alignItems: 'end' }}>
// 			<TextInput label="Add Contact Point" w="50rem"></TextInput>
// 			<Button>Add</Button>
// 		</Stack>
// 	);
// };
