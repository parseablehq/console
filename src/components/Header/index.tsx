import logoInvert from '@/assets/images/brand/logo-invert.svg';
import docImage from '@/assets/images/doc.webp';
import githubLogo from '@/assets/images/github-logo.webp';
import slackLogo from '@/assets/images/slack-logo.webp';
import { HOME_ROUTE, LOGIN_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT } from '@/constants/theme';
import type { BoxProps, HeaderProps as MantineHeaderProps, UnstyledButtonProps } from '@mantine/core';
import { Anchor, Box, Card, Image, Header as MantineHeader, Text, UnstyledButton, Modal, px } from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconHelpCircle, IconLogout, IconUser } from '@tabler/icons-react';
import { FC, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHeaderStyles } from './styles';

type HeaderProps = Omit<MantineHeaderProps, 'children' | 'height' | 'className'>;

const Header: FC<HeaderProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, actionsContainer } = classes;

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} px="xl" withBorder={true}>
			<Link to={HOME_ROUTE} style={{ height: 25 }}>
				<Image maw={HEADER_HEIGHT * 2.5} mx="auto" src={logoInvert} alt="Parseable Logo" />
			</Link>
			<Box className={actionsContainer}>
				<Help mr="lg" />
				<User mr="lg" />
				<SignOut />
			</Box>
		</MantineHeader>
	);
};

const helpResources = [
	{
		image: slackLogo,
		title: 'Slack',
		description: 'Connect with us',
		href: 'https://launchpass.com/parseable',
	},
	{
		image: githubLogo,
		title: 'GitHub',
		description: 'Find resources',
		href: 'https://github.com/parseablehq/parseable',
	},
	{
		image: docImage,
		title: 'Documentation',
		description: 'Learn more',
		href: 'https://www.parseable.io/docs/introduction',
	},
];

const Help: FC<UnstyledButtonProps> = (props) => {
	const [opened, { close, open }] = useDisclosure();

	const { classes } = useHeaderStyles();
	const { actionBtn, actionBtnText, helpTitle, helpDescription } = classes;

	return (
		<Fragment>
			<UnstyledButton {...props} className={actionBtn} onClick={open} variant="filled">
				<IconHelpCircle size={px('1.1rem')} />
				<Text ml="xs" className={actionBtnText}>
					Help
				</Text>
			</UnstyledButton>
			<Modal withinPortal opened={opened} onClose={close} withCloseButton={false} size="sm" centered>
				<Text className={helpTitle}>Need any help?</Text>
				<Text className={helpDescription}>Here you can find useful resources and information.</Text>
				<Box>
					{helpResources.map((data) => (
						<HelpCard key={data.title} data={data} />
					))}
				</Box>
			</Modal>
		</Fragment>
	);
};

type HelpCardProps = {
	data: (typeof helpResources)[number];
};

const HelpCard: FC<HelpCardProps> = (props) => {
	const { data } = props;

	const { classes } = useHeaderStyles();
	const { helpCard, helpCardTitle, helpCardDescription } = classes;

	return (
		<Anchor underline={false} href={data.href} target="_blank">
			<Card className={helpCard}>
				<Box>
					<Text className={helpCardTitle}>{data.title}</Text>
					<Text className={helpCardDescription}>{data.description}</Text>
				</Box>
				<Image maw={45} src={data.image} alt={data.title} />
			</Card>
		</Anchor>
	);
};

const User: FC<BoxProps> = (props) => {
	const [username] = useLocalStorage({ key: 'username', getInitialValueInEffect: false });

	const { classes } = useHeaderStyles();
	const { userContainer, userText } = classes;

	return (
		<Box className={userContainer} {...props}>
			<IconUser size={px('1.1rem')} />
			<Text ml="xs" className={userText}>
				{username}
			</Text>
		</Box>
	);
};

const SignOut: FC<UnstyledButtonProps> = (props) => {
	const nav = useNavigate();
	const [, , removeCredentials] = useLocalStorage({ key: 'credentials' });
	const [, , removeUsername] = useLocalStorage({ key: 'username' });

	const onSignOut = () => {
		removeCredentials();
		removeUsername();
		nav(
			{
				pathname: LOGIN_ROUTE,
			},
			{ replace: true },
		);
	};

	const { classes } = useHeaderStyles();
	const { actionBtn } = classes;

	return (
		<UnstyledButton {...props} onClick={onSignOut} className={actionBtn}>
			<IconLogout size={px('1.2rem')}  />
		</UnstyledButton>
	);
};

export default Header;
