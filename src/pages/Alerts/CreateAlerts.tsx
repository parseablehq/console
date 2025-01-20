import { useState } from 'react';
import {
	Button,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
	Box,
	Breadcrumbs,
	Anchor,
	// Divider,
	Group,
	// ThemeIcon,
	// ScrollArea,
	FloatingIndicator,
	UnstyledButton,
} from '@mantine/core';
import classes from './styles/AlertStyles.module.css';
import { useDocumentTitle } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

// type CombinatorToggleType = {
// 	isOrSelected: boolean;
// 	// onCombinatorChange: (combinator: Combinator) => void;
// };

// const activeBtnClass = `${classes.toggleBtnText} ${classes.toggleBtnActive}`;
// const inActiveBtnClass = classes.toggleBtnText;

const items = [
	{
		title: ' Home',
		href: '/',
	},
	{ title: 'Alerts', href: '/alerts' },
	{ title: 'Create Alerts', href: '/alerts' },
].map((item, index) => (
	<Anchor href={item.href} key={index} style={{ alignItems: 'center' }}>
		{item.title}
	</Anchor>
));

const AggregateOptions = ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'];

// const SeverityLevels = ['Low(P3)', 'Medium(P2)', 'High(P1)', 'Critical(P0)'];

const data = ['Threshold', 'Rate', 'Type3', 'Type4'];

function TypeSelect() {
	const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
	const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
	const [active, setActive] = useState(0);

	const setControlRef = (index: number) => (node: HTMLButtonElement) => {
		controlsRefs[index] = node;
		setControlsRefs(controlsRefs);
	};

	const controls = data.map((item, index) => (
		<UnstyledButton
			key={item}
			className={classes.control}
			ref={setControlRef(index)}
			onClick={() => setActive(index)}
			mod={{ active: active === index }}>
			<span className={classes.controlLabel}>{item}</span>
		</UnstyledButton>
	));

	return (
		<div>
			<Text className={classes.label}>Select Type</Text>
			<div className={classes.root} ref={setRootRef}>
				{controls}

				<FloatingIndicator target={controlsRefs[active]} parent={rootRef} className={classes.indicator} />
			</div>
		</div>
	);
}

const PageTitle = () => {
	return <Text size="lg">New Alert</Text>;
};

// const CombinatorToggle = (props: CombinatorToggleType) => {
// 	const { isOrSelected } = props;
// 	return (
// 		<Box className={classes.toggleBtnContainer}>
// 			<Text
// 				style={{ fontSize: '0.6rem' }}
// 				className={isOrSelected ? activeBtnClass : inActiveBtnClass}
// 				onClick={() => console.log('hello world')}>
// 				OR
// 			</Text>
// 			<Text
// 				style={{ fontSize: '0.6rem' }}
// 				className={!isOrSelected ? activeBtnClass : inActiveBtnClass}
// 				onClick={() => console.log('and')}>
// 				AND
// 			</Text>
// 		</Box>
// 	);
// };
// const AddRuleGroupBtn = () => {
// 	return (
// 		<Stack
// 			h="12rem"
// 			className={classes.rulesContainer}
// 			style={{ cursor: 'pointer' }}
// 			onClick={() => console.log('adding rules')}>
// 			<Stack style={{ flexDirection: 'row' }} align="center" gap={8}>
// 				<ThemeIcon radius="lg" size="sm" p={4}>
// 					<IconPlus stroke={3} />
// 				</ThemeIcon>
// 				<Text size="md" fw={600}>
// 					Add
// 				</Text>
// 			</Stack>
// 		</Stack>
// 	);
// };

// const ConditionBox = () => {
// 	return (
// 		<div
// 			className={classes.rulesContainer}
// 			style={{
// 				width: '78%',
// 				position: 'relative',
// 			}}>
// 			<span
// 				className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-600"
// 				style={{
// 					position: 'absolute',
// 					top: '-5.8%',
// 					left: '45%',
// 					background: '#f5f5f5',
// 					padding: '0rem 1rem',
// 					color: '#4b52ea',
// 					fontWeight: 700,
// 				}}>
// 				Condition
// 			</span>
// 			<Box w="100%" style={{ display: 'flex', justifyContent: 'end' }}>
// 				<Box className={classes.parentCombinatorToggleContainer}>
// 					<CombinatorToggle isOrSelected={false} />
// 				</Box>
// 			</Box>
// 			<Group gap={10}>
// 				<Select w="32.5%" label="Field" />
// 				<Select w="31%" label="Operator" />
// 				<TextInput w="33%" label="Value" />
// 				<Button leftSection={<IconPlus stroke={1.2} size={'1rem'} />}>Condition</Button>
// 			</Group>
// 		</div>
// 	);
// };

// function AlertBuilder() {
// 	return (
// 		<Stack h="40vh" style={{ justifyContent: 'center', alignItems: 'center' }}>
// 			<ScrollArea
// 				w="65%"
// 				scrollbars="y"
// 				type="always"
// 				scrollbarSize={12}
// 				px={16}
// 				py={20}
// 				style={{ background: '#f5f5f5', borderRadius: 20 }}
// 				styles={{ thumb: { backgroundColor: '#4b52ea' } }}>
// 				<Stack style={{ justifyContent: 'center', gap: 0 }}>
// 					<Stack className={classes.rulesContainer}>
// 						<Select
// 							w="12%"
// 							label="Aggregate"
// 							defaultValue={AggregateOptions[0]}
// 							data={AggregateOptions}
// 							styles={{ label: { color: '#4b52ea', fontWeight: 700 } }}
// 						/>

// 						<ConditionBox />

// 						<Select w="6%" label="Operator" styles={{ label: { color: '#4b52ea', fontWeight: 700 } }} />
// 						<TextInput w="10%" label="Value" styles={{ label: { color: '#4b52ea', fontWeight: 700 } }} />
// 					</Stack>
// 					<Stack style={{ height: 80, position: 'relative' }}>
// 						<Stack className={classes.ruleSetConnector} />
// 						<Stack style={{ position: 'absolute', height: 80, alignItems: 'center', justifyContent: 'center' }}>
// 							<Stack className={classes.parentCombinatorToggleContainer}>
// 								<CombinatorToggle
// 									isOrSelected={false}
// 									// onCombinatorChange={onParentCombinatorChange}
// 								/>
// 							</Stack>
// 						</Stack>
// 					</Stack>
// 					<AddRuleGroupBtn />
// 				</Stack>
// 				<Stack pt={20}>
// 					<Divider label="Target" />
// 					<Group>
// 						<TextInput label="Target" w="100%" />
// 						<Box w="100%" style={{ display: 'flex', justifyContent: 'end', gap: 10 }}>
// 							<Button variant="outline">Edit</Button>
// 							<Button>Save </Button>
// 						</Box>
// 					</Group>
// 					<Divider label="Evalution" />
// 					<Group>
// 						<TextInput w="49%" label="Time" placeholder="Start Time" />
// 						<TextInput w="49%" label="Frequency" placeholder="10s" />
// 					</Group>
// 					<Divider label="Severity" />
// 					<Group>
// 						<Select
// 							label="Severity"
// 							size="sm"
// 							w="15rem"
// 							defaultValue={SeverityLevels[1]}
// 							data={SeverityLevels}></Select>
// 					</Group>
// 				</Stack>
// 			</ScrollArea>
// 		</Stack>
// 	);
// }

function AlertsForm() {
	return (
		<Stack>
			{/* rules */}
			<Stack>
				<Text style={{ color: '#4b52ea', fontWeight: 700, fontSize: 14 }}>Condition</Text>
				<Group w={'50%'} gap={10}>
					<Select w="32.5%" label="Field" />
					<Select w="31%" label="Operator" />
					<TextInput w="33%" label="Value" />
					<Button leftSection={<IconPlus stroke={1.2} size={'1rem'} />}>Condition</Button>
				</Group>
			</Stack>
			{/* eval */}
			<Stack ml={'2%'} mt="1%" style={{ borderLeft: '2px solid #4B52EA', padding: '1rem' }}>
				<Text style={{ color: '#4b52ea', fontWeight: 700, fontSize: 14 }}>Evalution Details</Text>
				<Group>
					<Select w="12%" label="Aggregate" defaultValue={AggregateOptions[0]} data={AggregateOptions} />
					<Select w="6%" label="Operator" styles={{ label: { color: '#4b52ea', fontWeight: 700 } }} />
					<TextInput w="10%" label="Value" styles={{ label: { color: '#4b52ea', fontWeight: 700 } }} />
				</Group>
				<Group>
					<Select w="12%" label="Window" defaultValue={'Window'} data={['Window']} />
					<Select w="6%" label="Frequency" styles={{ label: { color: '#4b52ea', fontWeight: 700 } }} />
				</Group>
			</Stack>

			{/* Target */}
			<Stack mt="1%">
				<Text style={{ color: '#4b52ea', fontWeight: 700, fontSize: 14 }}>Target</Text>
				<Select w="12%" label="Type" defaultValue={'Slack'} data={['Slack', 'Webhook']} />
				<TextInput w="40%" label="Target" />
				<Button w="5%" leftSection={<IconPlus stroke={1.2} size={'1rem'} />}>
					Target
				</Button>
				<Textarea label="Message" w="40%" />
			</Stack>
		</Stack>
	);
}

export default function CreateAlerts() {
	useDocumentTitle('Parseable | Alerts');
	return (
		<Stack h="95vh" style={{ padding: '0.5rem' }}>
			<Breadcrumbs separator=">">{items}</Breadcrumbs>
			<PageTitle />
			<AlertTitle />
			<SelectStream />
			<TypeSelect />

			<Box h={'100%'} className={classes.alertFormContainer}>
				<AlertsForm />
			</Box>

			<Box style={{ display: 'flex', justifyContent: 'end', gap: 10 }}>
				<Button variant="outline">Set Alert</Button>
			</Box>
		</Stack>
	);
}

const AlertTitle = () => {
	return (
		<TextInput
			label="Alert Title"
			size="sm"
			w="15rem"
			styles={{ label: { color: '#4b52ea', fontWeight: 700, fontSize: 14 } }}
		/>
	);
};

const SelectStream = () => {
	return (
		<Select
			label="Select Stream"
			size="sm"
			w="15rem"
			data={['Backend', 'Frontend', 'abc', 'test']}
			styles={{ label: { color: '#4b52ea', fontWeight: 700, fontSize: 14 } }}></Select>
	);
};
