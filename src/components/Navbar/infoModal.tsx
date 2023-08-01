import {  Anchor, Box, Image, Modal, Table, Text, Tooltip } from '@mantine/core';
import { FC, useEffect } from 'react';
import { useInfoModalStyles } from './styles';
import docImage from '@/assets/images/doc.webp';
import githubLogo from '@/assets/images/github-logo.webp';
import slackLogo from '@/assets/images/slack-logo.webp';
import { useGetAbout } from '@/hooks/useGetAbout';

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

type HelpCardProps = {
	data: (typeof helpResources)[number];
};

const HelpCard: FC<HelpCardProps> = (props) => {
	const { data } = props;

	const { classes } = useInfoModalStyles();
	const { HelpIconBox, helpToolip } = classes;

	return (
		<Box className={HelpIconBox}>
			<Anchor underline={false} href={data.href} target="_blank" className={helpToolip}>
				<Tooltip label={data.description} position="bottom" withArrow>
					<Image maw={45} src={data.image} alt={data.title} />
				</Tooltip>
			</Anchor>
		</Box>
	);
};

type InfoModalProps = {
	opened: boolean;
	close(): void;
};

const InfoModal: FC<InfoModalProps> = (props) => {
	const { opened, close } = props;

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

	const { classes } = useInfoModalStyles();
	const {
		container,
		innerContainer,
		infoModal,
		helpTitle,
		helpDescription,
		aboutText,
		aboutTitle,
		aboutDescription,
		helpIconContainer,
	} = classes;

	return (
		<Modal
			className={infoModal}
			opened={opened}
			onClose={close}
			withinPortal
			withCloseButton={false}
			size="xl"
			centered>
			<Box className={container}>
				<Box className={innerContainer}>
				<Text className={aboutTitle}>About</Text>
					{error ? (
						<Text className={aboutDescription} >Error...</Text>
					) : loading ? (
						<Text className={aboutDescription}>Loading...</Text>
					) : data ? (
						<>
							<Text className={aboutDescription} id="info-modal-description">
								Here you can find useful information about your Parseable instance.
							</Text>

							<Table highlightOnHover withBorder>
								<tbody className={aboutText}>
									<tr>
										<td>Commit</td>
										<td>{data.commit}</td>
									</tr>
									<tr>
										<td>Deployment Id</td>
										<td>{data.deploymentId}</td>
									</tr>
									<tr>
										<td>Latest Version</td>
										<td>{data.latestVersion}</td>
									</tr>
									<tr>
										<td>License</td>
										<td>{data.license}</td>
									</tr>
									<tr>
										<td>Mode</td>
										<td>{data.mode}</td>
									</tr>
									<tr>
										<td>Staging</td>
										<td>{data.staging}</td>
									</tr>
									<tr>
										<td>Store</td>
										<td>{data.store}</td>
									</tr>
									<tr>
										<td>Version</td>
										<td>{data.version}</td>
									</tr>
								</tbody>
							</Table>
						</>
					) : null}
				</Box>
				<Box className={innerContainer}>
					<Text className={helpTitle}>Need any help?</Text>
					<Text className={helpDescription}>Here you can find useful resources and information.</Text>

					<Box mt={12} className={helpIconContainer}>
						{helpResources.map((data) => (
							<HelpCard key={data.title} data={data} />
						))}
					</Box>
				</Box>
			</Box>
		</Modal>
	);
};

export default InfoModal;
