import { createStyles } from '@mantine/core';

export const useHeaderStyles = createStyles((theme) => {
	const {colors, spacing, fontSizes, radius, shadows } = theme;
	const { fontWeights, widths, heights } = theme.other;

	const white = colors.white[0];
	const sColor = colors.brandSecondary[0];
	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			background: white,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingLeft: spacing.lg,
		},

		actionsContainer: {
			display: 'flex',
			alignItems: 'center',
		},

		actionBtn: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',

			'&:hover *': {
				color: sColor,
			},
		},

		actionBtnText: {		
			fontSize: fontSizes.sm,
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
