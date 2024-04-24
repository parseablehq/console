import { Box, Button, Modal, Text, Tooltip, px } from '@mantine/core';
import { FC, useCallback } from 'react';
import { IconBook2, IconBrandGithub, IconBrandSlack, IconBusinessplan } from '@tabler/icons-react';
import styles from './styles/HelpModal.module.css';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const helpResources = [
	{
		icon: IconBusinessplan,
		title: 'Production support',
		description: 'Get production support',
		href: 'mailto:sales@parseable.io?subject=Production%20Support%20Query', //https://www.parseable.io/pricing
	},
	{
		icon: IconBrandSlack,
		title: 'Slack',
		description: 'Join the Slack community',
		href: 'https://join.slack.com/t/parseable/shared_invite/zt-23t505gz7-zX4T10OvkS8RAhnme4gDZQ',
	},
	{
		icon: IconBrandGithub,
		title: 'GitHub',
		description: 'Find resources on GitHub',
		href: 'https://github.com/parseablehq/parseable',
	},
	{
		icon: IconBook2,
		title: 'Documentation',
		description: 'Refer the documentation',
		href: 'https://www.parseable.com/docs',
	},
];

type HelpCardProps = {
	data: (typeof helpResources)[number];
};

const HelpCard: FC<HelpCardProps> = (props) => {
	const { data } = props;

	const classes = styles;
	const { HelpIconBox } = classes;

	return (
		<Tooltip label={data.description} position="bottom" withArrow style={{ color: 'white', backgroundColor: 'black' }}>
			<Button className={HelpIconBox} component={'a'} href={data.href} target="_blank">
				<data.icon size={px('1.2rem')} stroke={1.5} />
			</Button>
		</Tooltip>
	);
};


const HelpModal: FC = () => {
	const [helpModalOpen, setAppStore] = useAppStore(store => store.helpModalOpen)
	const classes = styles;
	const { container, aboutTitle, aboutDescription, helpIconContainer } = classes;
	const onClose = useCallback(() => setAppStore(appStoreReducers.toggleHelpModal), [])

	return (
		<Modal opened={helpModalOpen} onClose={onClose} withinPortal withCloseButton={false} size="xl" centered padding={40}>
			<Box className={container}>
				<Text className={aboutTitle}>Need help?</Text>
				<Text className={aboutDescription}>Ensure uninterrupted deployment</Text>
				<Box mt={15} className={helpIconContainer}>
					{helpResources.map((data) => (
						<HelpCard key={data.title} data={data} />
					))}
				</Box>
			</Box>
		</Modal>
	);
};

export default HelpModal;
