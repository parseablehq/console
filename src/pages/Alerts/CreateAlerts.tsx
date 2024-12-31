import {
	Button,
	Select,
	Stack,
	Text,
	TextInput,
	Box,
	Breadcrumbs,
	Anchor,
	Divider,
	Group,
	ThemeIcon,
	ScrollArea,
} from '@mantine/core';
import classes from './styles/AlertStyles.module.css';
import { useDocumentTitle } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

const activeBtnClass = `${classes.toggleBtnText} ${classes.toggleBtnActive}`;
const inActiveBtnClass = classes.toggleBtnText;

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

const SeverityLevels = ['Low(P3)', 'Medium(P2)', 'High(P1)', 'Critical(P0)'];
const PageTitle = () => {
	return <Text size="lg">New Alert</Text>;
};

type CombinatorToggleType = {
	isOrSelected: boolean;
	// onCombinatorChange: (combinator: Combinator) => void;
};

const CombinatorToggle = (props: CombinatorToggleType) => {
	const { isOrSelected } = props;
	return (
		<Box className={classes.toggleBtnContainer}>
			<Text
				style={{ fontSize: '0.6rem' }}
				className={isOrSelected ? activeBtnClass : inActiveBtnClass}
				onClick={() => console.log('hello world')}>
				OR
			</Text>
			<Text
				style={{ fontSize: '0.6rem' }}
				className={!isOrSelected ? activeBtnClass : inActiveBtnClass}
				onClick={() => console.log('and')}>
				AND
			</Text>
		</Box>
	);
};
const AddRuleGroupBtn = () => {
	// const [, setFilterStore] = useFilterStore(() => null);
	// const onClick = useCallback(() => {
	// 	setFilterStore((store) => createRuleGroup(store));
	// }, []);
	return (
		<Stack
			h="12rem"
			className={classes.rulesContainer}
			style={{ cursor: 'pointer' }}
			onClick={() => console.log('adding rules')}>
			<Stack style={{ flexDirection: 'row' }} align="center" gap={8}>
				<ThemeIcon radius="lg" size="sm" p={4}>
					<IconPlus stroke={3} />
				</ThemeIcon>
				<Text size="md" fw={600}>
					Add
				</Text>
			</Stack>
		</Stack>
	);
};

const ConditionBox = () => {
	return (
		<Group w="78%" style={{ border: '1px solid red' }}>
			<Stack style={{ border: '2px solid red' }}>
				<Text style={{ position: 'absolute', top: 0, left: '45%' }}>Condition</Text>
			</Stack>
			<Box w="100%" style={{ display: 'flex', justifyContent: 'end' }}>
				<Box className={classes.parentCombinatorToggleContainer}>
					<CombinatorToggle isOrSelected={false} />
				</Box>
			</Box>
			<Select w="32.5%" label="Field" />
			<Select w="31%" label="Operator" />
			<TextInput w="33%" label="Value" />
			<Button leftSection={<IconPlus stroke={1.2} size={'1rem'} />}>Condition</Button>
		</Group>
	);
};

export default function CreateAlerts() {
	useDocumentTitle('Parseable | Alerts');
	return (
		<Stack style={{ padding: '0.5rem' }}>
			<Breadcrumbs separator=">">{items}</Breadcrumbs>
			<PageTitle />
			<Stack>
				<AlertTitle />
				<SelectStream />

				<ScrollArea h="88%" style={{ justifyContent: 'center' }}>
					<Box h="4rem" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<Text>Pills Container</Text>
					</Box>
					<Stack style={{ justifyContent: 'center', gap: 0 }}>
						<Stack className={classes.rulesContainer}>
							<Select w="12%" label="Aggregate" defaultValue={AggregateOptions[0]} data={AggregateOptions} />

							<ConditionBox />

							<Select w="6%" label="Operator" />
							<TextInput w="10%" label="Value" />
						</Stack>
						<Stack style={{ height: 80, position: 'relative' }}>
							<Stack className={classes.ruleSetConnector} />
							<Stack style={{ position: 'absolute', height: 80, alignItems: 'center', justifyContent: 'center' }}>
								<Stack className={classes.parentCombinatorToggleContainer}>
									<CombinatorToggle
										isOrSelected={false}
										// onCombinatorChange={onParentCombinatorChange}
									/>
								</Stack>
							</Stack>
						</Stack>
						<AddRuleGroupBtn />
					</Stack>
					<Divider size="sm"></Divider>
					<Stack>
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
				</ScrollArea>
				<Box style={{ display: 'flex', justifyContent: 'end', gap: 10 }}>
					<Button variant="outline">Discard</Button>
					<Button>Save Alert</Button>
				</Box>
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
