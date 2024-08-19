import { Box, Button, Modal, Stack, Text, Tooltip, px } from '@mantine/core';
import { FC, useEffect, useMemo } from 'react';
import { useAbout } from '@/hooks/useGetAbout';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import styles from './styles/InfoModal.module.css';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const { setInstanceConfig } = appStoreReducers;

type InfoModalProps = {
	opened: boolean;
	close(): void;
};

const InfoModal: FC<InfoModalProps> = (props) => {
	const { opened, close } = props;

	const { getAboutData, getAboutIsError, getAboutIsLoading } = useAbout();
	const [analytics, setAppStore] = useAppStore((store) => store.instanceConfig?.analytics);
	const llmStatus = useMemo(() => {
		let status = 'LLM API Key not set';
		if (getAboutData?.data?.llmActive) {
			status = `${getAboutData?.data.llmProvider} configured`;
		}
		return status;
	}, [getAboutData?.data?.llmActive]);

	useEffect(() => {
		if (getAboutData?.data) {
			setAppStore((store) => setInstanceConfig(store, getAboutData?.data));
		}
	}, [getAboutData?.data]);

	const classes = styles;
	const {
		container,
		aboutTitle,
		aboutDescription,
		actionBtn,
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
				{getAboutIsError ? (
					<Text className={aboutDescription}>Error...</Text>
				) : getAboutIsLoading ? (
					<Text className={aboutDescription}>Loading...</Text>
				) : getAboutData?.data ? (
					<>
						<Box className={aboutTextBox}>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> License: </Text>
								<Text className={aboutTextValue}> {getAboutData?.data.license} </Text>
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
								<Text className={aboutTextValue}> {getAboutData?.data.commit} </Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> Version: </Text>
								<Text className={aboutTextValue}> {getAboutData?.data.version} </Text>
								{getAboutData?.data.updateAvailable ? (
									<Button
										variant="outline"
										component={'a'}
										href="https://github.com/parseablehq/parseable/releases/latest"
										target="_blank"
										className={actionBtnRed}
										leftSection={<IconAlertCircle size={px('1.2rem')} stroke={1.5} />}>
										Upgrade to latest version {getAboutData?.data.latestVersion}
									</Button>
								) : null}
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> UI Version: </Text>
								<Text className={aboutTextValue}> {getAboutData?.data.uiVersion} </Text>
							</Box>
						</Box>
						<Box className={aboutTextBox}>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}> Deployment Id: </Text>
								<Text className={aboutTextValue}> {getAboutData?.data.deploymentId} </Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Mode</Text>
								<Text className={aboutTextValue}>{getAboutData?.data.mode}</Text>
							</Box>
							{getAboutData?.data.staging && (
								<Box className={aboutTextInnerBox}>
									<Text className={aboutTextKey}>Staging</Text>
									<Text className={aboutTextValue}>{getAboutData?.data.staging}</Text>
								</Box>
							)}
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Store</Text>
								<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={4}>
									<Text className={aboutTextValue} style={{ width: '100%' }}>
										{getAboutData?.data?.store?.type}
									</Text>
									<Tooltip label={getAboutData?.data?.store?.path}>
										<IconInfoCircle style={{ cursor: 'pointer' }} size="1.2rem" color="gray" stroke={1.5} />
									</Tooltip>
								</Stack>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Cache</Text>
								<Text className={aboutTextValue}>{getAboutData?.data.cache}</Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>LLM Status</Text>
								<Text className={aboutTextValue}>{llmStatus}</Text>
							</Box>
							<Box className={aboutTextInnerBox}>
								<Text className={aboutTextKey}>Usage Analytics</Text>
								<Text className={aboutTextValue}>
									{analytics?.clarityTag ? 'Tracking (MS Clarity)' : 'Not Tracking'}
								</Text>
							</Box>
						</Box>
					</>
				) : null}
			</Box>
		</Modal>
	);
};

export default InfoModal;
