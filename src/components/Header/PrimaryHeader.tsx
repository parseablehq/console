import icon from '@/assets/images/brand/icon.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Button, Image, Stack } from '@mantine/core';
import { FC, useCallback } from 'react';
import styles from './styles/Header.module.css';
import HelpModal from './HelpModal';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/AppProvider';

const PrimaryHeader: FC = () => {
	const classes = styles;
	const { logoContainer, imageSty } = classes;
	const [maximized, setAppStore] = useAppStore((store) => store.maximized);
	const toggleHelpModal = useCallback(() => setAppStore(appStoreReducers.toggleHelpModal), [])
	if (maximized) return null;

	return (
		<Stack
			className={classes.primaryHeaderContainer}
			style={{
				height: PRIMARY_HEADER_HEIGHT,
			}}
			gap={0}>
			<HelpModal />
			<Stack className={logoContainer} w={NAVBAR_WIDTH}>
				<a href={HOME_ROUTE}>
					<Image className={imageSty} src={icon} height={32} alt="Parseable Logo" />
				</a>
			</Stack>
			<Stack
				className={classes.rightSection}
				style={{ flexDirection: 'row', height: '100%', justifyContent: 'flex-end' }}
				gap={0}>
				<Button
					variant="outline"
					style={{ border: 'none', padding: '0 1rem' }}
					component={'a'}
					href="mailto:sales@parseable.io?subject=Production%20Support%20Query"
					target="_blank">
					Upgrade
				</Button>
				<Stack className={classes.divider} />
				<Button onClick={toggleHelpModal} style={{ border: 'none', padding: '0 1rem' }} variant="outline">
					Help
				</Button>
			</Stack>
		</Stack>
	);
};

export default PrimaryHeader;
