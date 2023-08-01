import { createStyles } from '@mantine/core';
import { heights, sizing, widths } from '../Mantine/sizing';

export const useNavbarStyles = createStyles((theme) => {
	const { colors, radius, fontSizes } = theme;
	const { fontWeights, sizing } = theme.other;
	const white = colors.white[0];
	const sColor = colors.brandSecondary[0];
	const defaultRadius = radius[theme.defaultRadius as string];

	const pColor = colors.brandPrimary[0];

	return {
		container: {
			display: 'flex',
			background: white,
			flexDirection: 'column',
			alignItems: 'center',
			color: theme.colors.gray[7],
			fontFamily: theme.fontFamily,
			fontSize: fontSizes.md,
			fontWeight: fontWeights.normal,
			lineHeight: 'normal',
		},
		streamsBtn: {
			padding: '24px 24px 14px 24px',
			':hover': { background: 'white' },
			cursor: 'default',
			color: theme.colors.gray[6],
		},
		linkBtnActive: {
			color: pColor,
			'&:hover *': {
				color: sColor,
			},
			fontWeight: fontWeights.bold,
		},
		linkBtn: {
			color: theme.colors.gray[6],
			'&:hover *': {
				color: sColor,
			},
		},
		selectStreambtn: {
			'.mantine-Input-rightSection ': {
				'& svg': {
					stroke: colors.gray[2],
				},
			},
			'& input': {
				border: `${sizing.px} ${colors.gray[2]} solid`,
				borderRadius: defaultRadius,
			},
			'.mantine-Select-item[data-selected="true"]': {
				background: pColor,
				'&:hover': { background: sColor, color: white },
			},
			'.mantine-Select-item': {
				'&:hover': { color: sColor },
			},
			margin: '0 24px 0 24px',
		},
		lowerContainer: {
			marginBottom: '50px',
		},
		actionBtn: {
			paddingLeft: '24px',
			height: '40px',
			color: theme.colors.gray[6],
			'&:hover *': {
				color: sColor,
			},
		},

		userBtn: {
			cursor: 'default',
			paddingLeft: '24px',
			height: '40px',
			color: theme.colors.gray[6],
			'&:hover ': {
				background: white,
			},
		},
		userContainer: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		userText: {
			fontSize: fontSizes.sm,
		},
	};
});

//infoModal, infoModalTitle, infoModalDescription
export const useInfoModalStyles = createStyles((theme) => {
	const { colors, radius, fontSizes, shadows, spacing } = theme;
	const { fontWeights } = theme.other;
	const white = colors.white[0];
	const sColor = colors.brandSecondary[0];
	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			height: '100%',
			width: '100%',
			
		},
		innerContainer: {
			padding: spacing.md,
		},
		infoModal: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			background: white,
			color: theme.colors.gray[7],
			fontFamily: theme.fontFamily,
			fontSize: fontSizes.md,
			fontWeight: fontWeights.normal,
			lineHeight: 'normal',
			padding: '24px',
			borderRadius: defaultRadius,
			boxShadow: shadows.sm,
		},
		aboutTitle: {
			fontSize: fontSizes.md,
			textAlign: 'center',
			color: colors.gray[7],
			fontWeight: fontWeights.bold,
		},
		aboutDescription: {
			fontSize: fontSizes.sm,
			textAlign: 'center',
			color: colors.dimmed[0],
			marginTop: spacing.xs,

			'&::after': {
				content: '""',
				borderRadius: defaultRadius,
				display: 'block',
				backgroundColor: sColor,
				width: widths[14],
				height: heights['0.5'],
				marginTop: theme.spacing.sm,
				marginLeft: 'auto',
				marginRight: 'auto',
				marginBottom: spacing.sm,
			},
		},
		aboutText: {
			'& tr': {
				transition: 'transform .2s ease-in-out',
				'&: hover': {
					transform: 'scale(1.05)',
					" & td "	: {
						border: `${sizing.px} solid ${colors.gray[2]}`,
					}

				},
			},
		

			'& tr>td:last-of-type': {
				fontSize: fontSizes.sm,
				color: colors.dimmed[0],
				lineHeight: 'normal',
				'&: hover': {
					color: sColor,
				}
			},
		},
		helpTitle: {
			fontSize: fontSizes.md,
			textAlign: 'center',
			color: colors.gray[7],
			fontWeight: fontWeights.bold,
		},

		helpDescription: {
			fontSize: fontSizes.sm,
			textAlign: 'center',
			color: colors.dimmed[0],
			marginTop: spacing.xs,

			'&::after': {
				content: '""',
				borderRadius: defaultRadius,
				display: 'block',
				backgroundColor: sColor,
				width: widths[14],
				height: heights['0.5'],
				marginTop: theme.spacing.sm,
				marginLeft: 'auto',
				marginRight: 'auto',
				marginBottom: '31px',
			},
		},

		HelpIconBox: {
			marginLeft: spacing.md,
			transition: 'transform .2s ease-in-out',
			'&:hover': {
				transform: 'scale(1.05)',
			},
		},

		helpToolip: {
			"& .mantine-Tooltip-tooltip": {
				fontWeight: fontWeights.semibold,
				fontSize: fontSizes.sm,
				color: colors.gray[7],
				backgroundColor: colors.black[0],
			}
		},
		helpIconContainer: {
			display: 'flex',
			alignItems: 'center',
			width: '100%',
			justifyContent: 'center',
		},
	};
});
