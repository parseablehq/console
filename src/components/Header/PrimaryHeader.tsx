import logoInvert from '@/assets/images/brand/logo-invert.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT, NAVBAR_WIDTH, PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Box, Button, Image, Stack, Tooltip } from '@mantine/core';
import { FC } from 'react';
import styles from './styles/Header.module.css';
import { IconHelp, IconPremiumRights, IconStackPop } from '@tabler/icons-react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import InfoModal from '../Navbar/infoModal';
import HelpModal from './HelpModal';

const PrimaryHeader: FC = () => {
	const classes = styles;
	const { container, logoContainer, navContainer, imageSty, actionBtn } = classes;
	const {
		state: { maximized, helpModalOpen },
		methods: { toggleHelpModal },
	} = useHeaderContext();

	if (maximized) return null;

	return (
		<Box
			className={classes.primaryHeaderContainer}
			style={{
				height: PRIMARY_HEADER_HEIGHT,
			}}>
			<HelpModal opened={helpModalOpen} close={toggleHelpModal} />
			<Box className={logoContainer} w={200}>
				<a href={HOME_ROUTE}>
					<Image className={imageSty} src={logoInvert} height={32} alt="Parseable Logo" />
				</a>
			</Box>
			<Stack style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '1rem' }}>
				<Button
					leftSection={<IconStackPop />}
					component={'a'}
					href="mailto:sales@parseable.io?subject=Production%20Support%20Query"
					target="_blank">
					Upgrade
				</Button>
				<Button leftSection={<IconHelp />} onClick={toggleHelpModal}>
					Help
				</Button>
			</Stack>
		</Box>
	);
};

export default PrimaryHeader;
