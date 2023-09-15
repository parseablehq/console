import logoInvert from '@/assets/images/brand/logo-invert.svg';
import { HOME_ROUTE } from '@/constants/routes';
import { HEADER_HEIGHT } from '@/constants/theme';
import type { HeaderProps as MantineHeaderProps } from '@mantine/core';
import { Box, Button, Image, Header as MantineHeader, Tooltip } from '@mantine/core';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useHeaderStyles } from './styles';

type PrimaryHeaderProps = Omit<MantineHeaderProps, 'children' | 'height' | 'className'>;

const PrimaryHeader: FC<PrimaryHeaderProps> = (props) => {
	const { classes } = useHeaderStyles();
	const { container, logoContainer, navContainer, imageSty, actionBtn } = classes;

	return (
		<MantineHeader {...props} className={container} height={HEADER_HEIGHT} p={0} withBorder>
			<Box className={logoContainer}>
				<Link to={HOME_ROUTE}>
					<Image className={imageSty} src={logoInvert} height={24} alt="Parseable Logo" />
				</Link>
			</Box>
			<Box className={navContainer}>
				<Box
					display={'flex'}
					sx={{
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
							className={actionBtn}>
							<Image height={30} fit="fill" src={'/AGPLv3_Logo.svg'} />
						</Button>
					</Tooltip>
				</Box>
			</Box>
		</MantineHeader>
	);
};

export default PrimaryHeader;
