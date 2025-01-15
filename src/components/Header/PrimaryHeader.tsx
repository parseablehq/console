import icon from '@/assets/images/brand/icon.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Button, Divider, Image, Stack } from '@mantine/core';
import { FC, useCallback } from 'react';
import styles from './styles/Header.module.css';
import HelpModal from './HelpModal';
import _ from 'lodash';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { OSS_LICENSE_TYPE } from '@/constants';

const PrimaryHeader: FC = () => {
	const classes = styles;
	const { logoContainer, imageSty } = classes;
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const [instanceConfig] = useAppStore((store) => store.instanceConfig);
	const toggleHelpModal = useCallback(() => setAppStore(appStoreReducers.toggleHelpModal), []);
	if (maximized) return null;

	return (
		<Stack
			className={classes.primaryHeaderContainer}
			style={{
				height: PRIMARY_HEADER_HEIGHT,
			}}
			gap={0}>
			<HelpModal />
			<Stack className={logoContainer} w={NAVBAR_WIDTH + 20} style={{ alignItems: 'center', justifyContent: 'center' }}>
				<a href={HOME_ROUTE}>
					<Image className={imageSty} src={icon} height={24} alt="Parseable Logo" />
				</a>
			</Stack>
			<Stack
				className={classes.rightSection}
				style={{ flexDirection: 'row', height: '100%', justifyContent: 'flex-end' }}
				gap={8}>
				{instanceConfig?.license && _.isEqual(instanceConfig?.license, OSS_LICENSE_TYPE) && (
					<Button
						variant="outline"
						style={{ border: 'none' }}
						component={'a'}
						href="mailto:sales@parseable.io?subject=Production%20Support%20Query"
						target="_blank">
						Upgrade
					</Button>
				)}
				<Divider orientation="vertical" />
				<Button onClick={toggleHelpModal} style={{ border: 'none' }} variant="outline">
					Help
				</Button>
			</Stack>
		</Stack>
	);
};

export default PrimaryHeader;
