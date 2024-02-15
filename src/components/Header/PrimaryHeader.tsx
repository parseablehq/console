import logoInvert from '@/assets/images/brand/logo-invert.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { Box, Button, Image, Tooltip } from '@mantine/core';
import { FC } from 'react';
import styles from './styles/Header.module.css'


const PrimaryHeader: FC = () => {
	const classes = styles;
	const { container, logoContainer, navContainer, imageSty, actionBtn } = classes;

	return (
		<Box className={container} style={{ height: HEADER_HEIGHT }}>
			<Box className={logoContainer} style={{ minWidth: NAVBAR_WIDTH }}>
				<a href={HOME_ROUTE}>
					<Image className={imageSty} src={logoInvert} height={32} alt="Parseable Logo" />
				</a>
			</Box>
			<Box className={navContainer}>
				<Box
					display={'flex'}
					style={{
						justifyContent: 'flex-end',
						alignItems: 'center',
						width: '100%',
						paddingLeft: '1rem',
					}}
					pr={'xl'}>
					<Tooltip label="Upgrade to production support" position="bottom">
						<Button
							variant="outline"
							component={'a'}
							href="mailto:sales@parseable.io?subject=Production%20Support%20Query"
							target="_blank"
							className={actionBtn}
							style={{ border: 'none', background: 'transparent' }}>
							<Image height={30} fit="fill" src={'/AGPLv3_Logo.svg'} />
						</Button>
					</Tooltip>
				</Box>
			</Box>
		</Box>
	);
};

export default PrimaryHeader;
