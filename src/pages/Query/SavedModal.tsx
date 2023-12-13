import useMountedState from '@/hooks/useMountedState';
import { notifyError } from '@/utils/notification';
import { CodeHighlightTabs } from '@mantine/code-highlight';
import {
	ActionIcon,
	Box,
	Button,
	Checkbox,
	Code,
	Group,
	Input,
	Modal,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconStar } from '@tabler/icons-react';
import superjson from 'superjson';

type SavedModalProps = {
	setQuery: (q: string) => void;
	streamName: string | null;
	query: string;
};

const key = 'saved-querier';
const defaultValue = [
	{
		name: 'test backend',
		streamName: 'backend',
		date: new Date(),
		query: "SELECT * FROM backend WHERE (datetime = 'jj' and ((method = 'GET'))) LIMIT 1000;",
	},
];
const SavedModal = ({ setQuery, streamName, query }: SavedModalProps) => {
	const [opened, { open, close }] = useDisclosure(true);
	const [name, setName] = useMountedState('');
	const [streamSpecific, setStreamSpecific] = useMountedState(true);

	const [savedQueries, setSavedQueries] = useLocalStorage({
		key,
		defaultValue,
		serialize: superjson.stringify,
		deserialize: (str) => (str === undefined ? defaultValue : superjson.parse(str)),
	});

	const saveQuery = () => {
		if(!name){
			notifyError({
				message:"Name is required!"
			})
			return
		}
		if (savedQueries) {
			const newQuery = [
				{
					name: name,
					streamName: streamName ?? '',
					date: new Date(),
					query: query,
				},
				...savedQueries,
			];
			setSavedQueries(newQuery);
			setName('')

		} else {
			const newQuery = [
				{
					name: name,
					streamName: streamName ?? '',
					date: new Date(),
					query: query,
				},
				...defaultValue,
			];
			setSavedQueries(newQuery);
			setName('')
		}
	};
	return (
		<>
			<Tooltip label={`Save Query`} style={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
				<ActionIcon variant="default" radius={'md'} size={'lg'} mr={'md'} aria-label="Save Query" onClick={open}>
					<IconStar stroke={1.5} />
				</ActionIcon>
			</Tooltip>
			<Modal opened={opened} onClose={close} size="auto">
				<Box
					style={{
						display: 'flex',
						gap: '1rem',
					}}>
					<Box>
						<Stack>
							<CodeHighlightTabs
								code={[
									{
										fileName: 'Current Query',
										code: query,
										language: 'tsx',
									},
								]}
							/>
							<Input.Label>Name</Input.Label>
							<Input
								value={name}
								required
								onChange={(event) => setName(event.currentTarget.value)}
								placeholder="Enter the name"
							/>
							<Button
								onClick={() => {
									saveQuery();
								}}>
								Save Query
							</Button>
						</Stack>
					</Box>

					<Box>
						<Group>
							<Text fw={700} size="md">
								Saved Queries
							</Text>
							<Checkbox checked={streamSpecific} onChange={(event) => setStreamSpecific(event.currentTarget.checked)} />
						</Group>

						{savedQueries?.map((query) => {
							if (streamSpecific && query.streamName === streamName) {
								return (
									<Stack
										key={query.name}
										mt={'md'}
										p={'md'}
										style={{
											border: '1px solid black',
											borderRadius: '1rem',
										}}>
										<Text>{query.name}</Text>
										<Code block>{query.query}</Code>
										<Button
											style={{
												alignSelf: 'flex-start',
											}}
											onClick={() => {
												setQuery(query.query);
											}}>
											Load Query
										</Button>
									</Stack>
								);
							} else if(!streamSpecific) {
								return (
									<Stack
										key={query.name}
										mt={'md'}
										p={'md'}
										style={{
											border: '1px solid black',
											borderRadius: '1rem',
										}}>
										<Text>{query.name}</Text>
										<Code block>{query.query}</Code>
										<Button
											style={{
												alignSelf: 'flex-start',
											}}
											onClick={() => {
												setQuery(query.query);
											}}>
											Load Query
										</Button>
									</Stack>
								);
							}
						})}
					</Box>
				</Box>
			</Modal>
		</>
	);
};

export default SavedModal;
