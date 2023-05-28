import loginBg from '@/assets/images/login-bg.svg';
import { createStyles } from '@mantine/core';

export const useLoginStyles = createStyles((theme) => {
	const { colors, other, spacing, radius, shadows, primaryColor, fontSizes } = theme;

	const { fontWeights, widths } = other;

	const pColor = colors[primaryColor][2];

	return {
		container: {
			position: 'relative',
			flex: 1,
			backgroundImage: `url(${loginBg})`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'top center',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},

		formContainer: {
			position: 'relative',
			background: colors.white,
			padding: spacing.xl,
			borderRadius: radius.sm,
			boxShadow: shadows.sm,
			width: widths[96],
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		},

		formInput: {
			width: widths.full,
		},

		loginBtnStyle: {
			background: colors.brandSecondary[1],
			width: widths.full,

			'&:hover': {
				background: colors.brandSecondary[0],
			},
		},

		titleStyle: {
			color: pColor,
			fontWeight: fontWeights.bold,
			fontSize: fontSizes.sm,
		},

		descriptionStyle: {
			textAlign: 'center',
			fontSize: fontSizes.sm,
			color: colors.dimmed[0],
		},

		errorStyle: {
			color: colors.error,
		},
	};
});

export const useForgetPassStyles = createStyles((theme) => {
	const { colors, primaryColor, fontSizes, spacing } = theme;

	const { fontWeights, sizing, widths } = theme.other;

	const pColor = colors[primaryColor][2];

	return {
		forgetPassBtnText: {
			color: colors.blue[9],
			textDecorationLine: 'underline',
			fontSize: fontSizes.sm,
		},

		titleStyle: {
			color: pColor,
			textAlign: 'center',
			fontSize: fontSizes.sm,
			fontWeight: fontWeights.bold,
		},

		descriptionStyle: {
			textAlign: 'center',
			fontSize: fontSizes.sm,
			color: colors.dimmed[0],
		},

		stepContainer: {
			display: 'flex',
			marginRight: spacing.md,
			marginLeft: spacing.md,
		},

		stepNumberContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			marginRight: spacing.md,
		},

		stepNumber: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			color: colors.white,
			background: colors[primaryColor][1],
			height: sizing[9],
			width: sizing[9],
			borderRadius: '100%',
			fontWeight: fontWeights.bold,
		},

		stepVerticalLine: {
			width: widths.px,
			flexGrow: 1,
			background: colors.dimmed[0],
		},

		stepTitle: {
			color: colors[primaryColor][1],
			fontWeight: fontWeights.bold,
			fontSize: fontSizes.sm,
		},

		stepDescription: {
			marginTop: spacing.xs,
			color: colors.dimmed[0],
			fontSize: fontSizes.xs,
			fontWeight: fontWeights.medium,
		},
	};
});
