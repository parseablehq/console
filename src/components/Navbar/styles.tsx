import { createStyles } from '@mantine/core';
import { heights, widths } from '../Mantine/sizing';

export const useNavbarStyles = createStyles((theme) => {
	const { colors, radius, fontSizes, shadows ,spacing} = theme;
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
			lineHeight: "normal",
		},
		streamsBtn: {
			padding:"24px 24px 14px 24px", ":hover": { background: "white" }

		},
		linkBtnActive: {
			color: pColor,
			'&:hover *': {
				color: sColor,
			},
			fontWeight: fontWeights.bold,
		},
		linkBtn: {
			color: theme.colors.gray[5],
			'&:hover *': {
				color: sColor,
			},
		},
		selectStreambtn: {
			'.mantine-Input-rightSection ': {
				"& svg": {
					stroke: colors.gray[2],
				}
			},
			'& input': {
				border: `${sizing.px} ${colors.gray[2]} solid`,
				borderRadius: defaultRadius,
			},
			'.mantine-Select-item[data-selected="true"]': {
				background: pColor,
				"&:hover": { background: sColor, color: white }
			},
			'.mantine-Select-item': {
				"&:hover": { color: sColor }
			},
			margin: "0 24px 0 24px"

		}
		,lowerContainer: {
			marginBottom:"50px"
		},
		actionBtn: {
			paddingLeft:"24px", 
			height:"56px",
			color: theme.colors.gray[6],
			'&:hover *': {
				color: sColor,
			}
		},

		userBtn: {		
			paddingLeft:"24px", 
			height:"56px",
			color: theme.colors.gray[6],
		},

		helpTitle: {
			fontSize: fontSizes.md,
			textAlign: 'center',
			color: white,
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
			},
		},

		helpCard: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			boxShadow: shadows.sm,
			marginTop: spacing.sm,
			transition: 'transform .2s ease-in-out',

			'&:hover': {
				transform: 'scale(1.05)',
			},
		},

		helpCardTitle: {
			fontWeight: fontWeights.semibold,

			'&::after': {
				content: '""',
				display: 'block',
				backgroundColor: white,
				width: widths[14],
				height: heights['0.5'],
				marginTop: spacing.xs,
				marginBottom: spacing.xs,
			},
		},

		helpCardDescription: {
			color: colors.dimmed[0],
			fontSize: fontSizes.sm,
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
