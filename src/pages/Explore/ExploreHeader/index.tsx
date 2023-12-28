import { FC, useEffect } from 'react';
import classes from './ExploreHeader.module.css';
import { Box, Modal, Select, Text } from '@mantine/core';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import { AppContext } from '@/@types/parseable/api/query';
import TimeRange from '@/components/Header/TimeRange';
import RefreshInterval from '@/components/Header/RefreshInterval';
import { useDisclosure } from '@mantine/hooks';
import Status from './Status';
import { IconAlarm, IconBookmark, IconInfoCircle, IconSettings, IconTrash } from '@tabler/icons-react';
import Alerts from './Alerts';
import Retention from './Retention';
import DeleteStream from './DeleteStream';

const ExploreHeader: FC = () => {
	const {
		state: { subAppContext },
	} = useHeaderContext();

	const [appContext, setAppContext] = useMountedState<AppContext>(subAppContext.get());

	useEffect(() => {
		const subAppContextListener = subAppContext.subscribe((value) => {
			setAppContext(value);
		});

		return () => {
			subAppContextListener();
		};
	}, []);
	return (
		<Box className={classes.header}>
			<Select
				placeholder="Pick one"
				searchable
				required
				value={appContext.selectedStream}
				onChange={(value) => {
					subAppContext.set({ ...appContext, selectedStream: value });
				}}
				allowDeselect={false}
				selectFirstOptionOnChange
				data={appContext && appContext.userSpecificStreams ? appContext.userSpecificStreams : []}
				leftSection={<span>Stream: </span>}
				leftSectionWidth={70}
			/>
			<Box className={classes.container}>
				<TimeRange />
				<RefreshInterval />
				<AboutStream />
				<SavedQueries />
				<StreamAlerts />
				<StreamRetention />
				<StreamDelete />
			</Box>
		</Box>
	);
};

const AboutStream: FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	return (
		<>
			<HeaderButton icon={<IconInfoCircle stroke={1.5} />} label="About" onClick={open} />
			<Modal opened={opened} onClose={close} title="About Stream">
				<Status />
			</Modal>
		</>
	);
};

const SavedQueries: FC = () => {
	return (
		<>
			<HeaderButton icon={<IconBookmark stroke={1.5} />} label="Saved Search" onClick={() => {}} />
		</>
	);
};

const StreamAlerts: FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	return (
		<>
			<HeaderButton icon={<IconAlarm stroke={1.5} />} label="Alerts" onClick={open} />
			<Modal opened={opened} onClose={close} title="Alerts">
				<Alerts />
			</Modal>
		</>
	);
};

const StreamRetention: FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	return (
		<>
			<HeaderButton icon={<IconSettings stroke={1.5} />} label="Retention" onClick={open} />
			<Modal opened={opened} onClose={close} title="Retention">
				<Retention />
			</Modal>
		</>
	);
};

const StreamDelete: FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	return (
		<>
			<HeaderButton icon={<IconTrash stroke={1.5} />} label="Delete" onClick={open} />
			<Modal opened={opened} onClose={close} title="Delete">
				<DeleteStream closeDelete={close} />
			</Modal>
		</>
	);
};

type HeaderButtonProps = {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
};

const HeaderButton: FC<HeaderButtonProps> = (props) => {
	const { icon, label, onClick } = props;
	return (
		<Box className={classes.headerButton} onClick={onClick}>
			{icon}
			<Text size="10px">{label}</Text>
		</Box>
	);
};

export default ExploreHeader;
