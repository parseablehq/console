import logoInvert from '@/assets/images/brand/logo-invert.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { PRIMARY_HEADER_HEIGHT } from '@/constants/theme';
import { Box, Button, Image, Stack } from '@mantine/core';
import { FC } from 'react';
import styles from './styles/Header.module.css';
import { IconHelp, IconStackPop } from '@tabler/icons-react';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import HelpModal from './HelpModal';

const PrimaryHeader: FC = () => {
	const classes = styles;
	const { logoContainer, imageSty } = classes;
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
