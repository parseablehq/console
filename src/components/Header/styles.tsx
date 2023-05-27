import { createStyles } from '@mantine/core';

const useHeaderStyles = createStyles((theme) => {
	const { primaryColor, colors, spacing, fontSizes, radius, shadows } = theme;
	const { fontWeights, widths, heights } = theme.other;

	const pColor = colors[primaryColor][2];
	const sColor = colors.brandSecondary[2];

	return {
		container: {
			background: pColor,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingLeft: spacing.lg,
			border: 'none',
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

		actionBtnIcon: {
			color: colors.gray[3],
		},

		actionBtnText: {
			color: colors.gray[3],
			fontSize: fontSizes.sm,
		},

		helpTitle: {
			fontSize: fontSizes.md,
			textAlign: 'center',
			color: pColor,
			fontWeight: fontWeights.bold,
		},

		helpDescription: {
			fontSize: fontSizes.sm,
			textAlign: 'center',
			color: colors.dimmed[0],
			marginTop: spacing.xs,

			'&::after': {
				content: '""',
				borderRadius: radius.lg,
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
				backgroundColor: pColor,
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

		userIcon: {
			color: colors.gray[3],
		},

		userText: {
			color: colors.gray[3],
			fontSize: fontSizes.sm,
		},
	};
});

export default useHeaderStyles;
