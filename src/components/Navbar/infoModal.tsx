import { Box, Button, Modal, Text, Tooltip, px } from '@mantine/core';
import { FC, useEffect, useMemo } from 'react';
import { useInfoModalStyles } from './styles';
import { useGetAbout } from '@/hooks/useGetAbout';
import { IconAlertCircle, IconBook2, IconBrandGithub, IconBrandSlack, IconBusinessplan } from '@tabler/icons-react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';

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
		href: 'https://launchpass.com/parseable',
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

	const { classes } = useInfoModalStyles();
	const { HelpIconBox } = classes;

	return (
		<Tooltip label={data.description} position="bottom" withArrow sx={{ color: 'white', backgroundColor: 'black' }}>
			<Button className={HelpIconBox} component={'a'} href={data.href} target="_blank">
				<data.icon size={px('1.2rem')} stroke={1.5} />
			</Button>
		</Tooltip>
	);
};

type InfoModalProps = {
	opened: boolean;
	close(): void;
};

const InfoModal: FC<InfoModalProps> = (props) => {
	const { opened, close } = props;
	const {
		state: { subInstanceConfig },
	} = useHeaderContext();

	const { data, loading, error, getAbout, resetData } = useGetAbout();
	useEffect(() => {
		if (data) {
			resetData();
		}
		getAbout();
		return () => {
			resetData();
		};
	}, []);

	const llmStatus = useMemo(() => {
		let status = 'LLM API Key not set';
		if (data?.llmActive) {
			status = `${data.llmProvider} configured`;
		}
		return status;
	}, [data?.llmActive]);

	useEffect(() => {
		if (data) {
			subInstanceConfig.set(data);
		}
	}, [data]);

	const { classes } = useInfoModalStyles();
	const {
		container,
		aboutTitle,
		aboutDescription,
		actionBtn,
		helpIconContainer,
		aboutTextBox,
		aboutTextKey,
		aboutTextValue,
		aboutTextInnerBox,
		actionBtnRed,
	} = classes;

	return (
		<Modal opened={opened} onClose={close} withinPortal withCloseButton={false} size="xl" centered>
			<Box className={container}>
				<Text className={aboutTitle}>About Parseable</Text>
				<Text className={aboutDescription} id="info-modal-description">
					Important info about your Parseable deployment
				</Text>
				{error ? (
					<Text className={aboutDescription}>Error...</Text>
				) : loading ? (
					<Text className={aboutDescription}>Loading...</Text>
				) : data ? (
					<>
						<Box className={aboutTextBox}>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> License: </Text>
								<Text className={aboutTextValue}> {data.license} </Text>
								<Button
									variant="outline"
									component={'a'}
									href="mailto:sales@parseable.io?subject=Production%20Support%20Query"
									target="_blank"
									className={actionBtn}>
									Upgrade to production support
								</Button>
							</Box>
						</Box>
						<Box className={aboutTextBox}>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> Commit: </Text>
								<Text className={aboutTextValue}> {data.commit} </Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> Version: </Text>
								<Text className={aboutTextValue}> {data.version} </Text>
								{data.updateAvailable ? (
									<Button
										variant="outline"
										component={'a'}
										href="https://github.com/parseablehq/parseable/releases/latest"
										target="_blank"
										className={actionBtnRed}
										leftIcon={<IconAlertCircle size={px('1.2rem')} stroke={1.5} />}>
										Upgrade to latest version {data.latestVersion}
									</Button>
								) : null}
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> UI Version: </Text>
								<Text className={aboutTextValue}> {data.uiVersion} </Text>
							</Box>
						</Box>
						<Box className={aboutTextBox}>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> Deployment Id: </Text>
								<Text className={aboutTextValue}> {data.deploymentId} </Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Mode</Text>
								<Text className={aboutTextValue}>{data.mode}</Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Staging</Text>
								<Text className={aboutTextValue}>{data.staging}</Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Store</Text>
								<Text className={aboutTextValue}>{data.store}</Text>
							</Box>
							<Box className={aboutTextInnerBox}>
                                <Text className={aboutTextKey}>Cache Enabled</Text>
                                <Text className={aboutTextValue}>{data.cacheEnabled.toString()}</Text>
                            </Box>
                            <Box className={aboutTextInnerBox}>
                                <Text className={aboutTextKey}>Cache Directory</Text>
                                <Text className={aboutTextValue}>{data.cacheDir}</Text>
                            </Box>
                            <Box className={aboutTextInnerBox}>
                                <Text className={aboutTextKey}>Cache Size</Text>
                                <Text className={aboutTextValue}>{data.cacheSize}</Text>
                            </Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>LLM Status</Text>
								<Text className={aboutTextValue}>{llmStatus}</Text>
							</Box>
						</Box>
					</>
				) : null}

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

export default InfoModal;
