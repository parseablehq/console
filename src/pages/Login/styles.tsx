// // import loginBg from '@/assets/images/login-bg.svg';
// import { createStyles, rem } from '@mantine/core';

// export const useLoginStyles = createStyles((theme) => {
// 	const { colors, other, spacing, radius, shadows, primaryColor, fontSizes } = theme;

// 	const { fontWeights, widths } = other;

// 	const pColor = colors[primaryColor][2];

// 	const defaultRadius = radius[theme.defaultRadius as string];

// 	return {
// 		sideContainer:{
// 			display: 'flex',
// 			flexDirection: 'column',
// 			width: '30vw',
// 			background: 'radial-gradient(circle at 78.7% 87.8%, rgb(250, 250, 250) 70%, rgb(225, 234, 238) 60%)',
// 			padding: rem(20),
// 			[theme.fn.smallerThan('md')]: {
// 				display: 'none',
// 			  },
// 		},

// 		container: {
// 			position: 'relative',
// 			flex: 1,
// 			// backgroundImage: `url(${loginBg})`,
// 			backgroundRepeat: 'no-repeat',
// 			backgroundPosition: 'top center',
// 			display: 'flex',
// 			alignItems: 'center',
// 			justifyContent: 'center',
// 		},

// 		formContainer: {
// 			position: 'relative',
// 			background: colors.white,
// 			padding: spacing.xl,
// 			borderRadius: defaultRadius,
// 			boxShadow: shadows.lg,
// 			border: `1px solid ${colors.gray[2]}`,
// 			width: widths[96],
// 			display: 'flex',
// 			flexDirection: 'column',
// 			alignItems: 'center',
// 		},

// 		formInput: {
// 			width: widths.full,
// 		},

// 		loginBtnStyle: {
// 			background: colors.brandPrimary[0],
// 			width: widths.full,

// 			'&:hover': {
// 				background: colors.brandSecondary[0],
// 			},
// 		},

// 		titleStyle: {
// 			color: pColor,
// 			fontWeight: fontWeights.bold,
// 			fontSize: fontSizes.xl,
// 		},

// 		descriptionStyle: {
// 			textAlign: 'center',
// 			fontSize: fontSizes.sm,
// 			color: colors.dimmed[0],
// 		},

// 		errorStyle: {
// 			color: colors.error,
// 		},
// 	};
// });

// export const useForgetPassStyles = createStyles((theme) => {
// 	const { colors, primaryColor, fontSizes, spacing } = theme;

// 	const { fontWeights, sizing, widths } = theme.other;

// 	const pColor = colors[primaryColor][2];

// 	return {
// 		forgetPassBtnText: {
// 			color: colors.blue[9],
// 			textDecorationLine: 'underline',
// 			fontSize: fontSizes.sm,
// 		},

// 		titleStyle: {
// 			color: pColor,
// 			textAlign: 'center',
// 			fontSize: fontSizes.sm,
// 			fontWeight: fontWeights.bold,
// 		},

// 		descriptionStyle: {
// 			textAlign: 'center',
// 			fontSize: fontSizes.sm,
// 			color: colors.dimmed[0],
// 		},

// 		stepContainer: {
// 			display: 'flex',
// 			marginRight: spacing.md,
// 			marginLeft: spacing.md,
// 		},

// 		stepNumberContainer: {
// 			display: 'flex',
// 			flexDirection: 'column',
// 			alignItems: 'center',
// 			marginRight: spacing.md,
// 		},

// 		stepNumber: {
// 			display: 'flex',
// 			justifyContent: 'center',
// 			alignItems: 'center',
// 			color: colors.white,
// 			background: colors[primaryColor][1],
// 			height: sizing[9],
// 			width: sizing[9],
// 			borderRadius: '100%',
// 			fontWeight: fontWeights.bold,
// 		},

// 		stepVerticalLine: {
// 			width: widths.px,
// 			flexGrow: 1,
// 			background: colors.dimmed[0],
// 		},

// 		stepTitle: {
// 			color: colors[primaryColor][1],
// 			fontWeight: fontWeights.bold,
// 			fontSize: fontSizes.sm,
// 		},

// 		stepDescription: {
// 			marginTop: spacing.xs,
// 			color: colors.dimmed[0],
// 			fontSize: fontSizes.xs,
// 			fontWeight: fontWeights.medium,
// 		},
// 	};
// });
