// import { createStyles } from '@mantine/core';
// import { heights, sizing, widths } from '../Mantine/sizing';

// export const useNavbarStyles = createStyles((theme) => {
// 	const { colors, fontSizes } = theme;
// 	const { fontWeights } = theme.other;
// 	const white = colors.white[0];
// 	const sColor = colors.brandSecondary[0];


// 	const pColor = colors.brandPrimary[0];

// 	return {
// 		container: {
// 			display: 'flex',
// 			background: white,
// 			flexDirection: 'column',
// 			alignItems: 'center',
// 			color: theme.colors.gray[7],
// 			fontFamily: theme.fontFamily,
// 			fontSize: fontSizes.md,
// 			fontWeight: fontWeights.normal,
// 			lineHeight: 'normal',
// 		},
// 		streamsBtn: {
// 			padding: '14px 24px 14px 24px',
// 			':hover': { background: 'white' },
// 			cursor: 'default',
// 			color: theme.colors.gray[6],
// 		},
// 		userManagementBtn: {
// 			padding: '14px 0px 14px 24px',
// 			color: theme.colors.gray[6],
// 		},
// 		userManagementBtnActive: {
// 			padding: '14px 0px 14px 24px',
// 			color: pColor,
// 			fontWeight: fontWeights.bold,
// 		},

// 		linkBtnActive: {
// 			color: pColor,
// 			'&:hover *': {
// 				color: sColor,
// 			},
// 			fontWeight: fontWeights.bold,
// 		},
// 		linkBtn: {
// 			color: theme.colors.gray[6],
// 			'&:hover *': {
// 				color: sColor,
// 			},
// 		},
// 		selectStreambtn: {
// 			margin: '0 24px 0 24px',
// 		},
// 		lowerContainer: {
// 			marginBottom: '50px',
// 		},
// 		actionBtn: {
// 			paddingLeft: '24px',
// 			height: '40px',
// 			color: theme.colors.gray[6],
// 			'&:hover *': {
// 				color: sColor,
// 			},
// 		},

// 		userBtn: {
// 			cursor: 'default',
// 			paddingLeft: '24px',
// 			height: '40px',
// 			color: theme.colors.gray[6],
// 			'&:hover ': {
// 				background: white,
// 			},
// 		},
// 		userContainer: {
// 			display: 'flex',
// 			alignItems: 'center',
// 			justifyContent: 'center',
// 		},
// 		userText: {
// 			fontSize: fontSizes.sm,
// 		},
// 		modalStyle: {
// 			'& .mantine-Paper-root ': {
// 				overflowY: 'inherit',
// 			},
// 			'& .mantine-Modal-header	':{
// 				borderRadius: "8px 8px 0px 0px",
// 				backgroundColor: colors.gray[1],
// 			},
// 			'& .mantine-Modal-title	':{
// 				fontWeight: 'bold',
// 			},
// 			"& .mantine-Modal-body ":{	
// 				paddingTop: '1rem !important',
// 			}
// 		},
// 		modalActionBtn: {
// 			backgroundColor: theme.colors.brandSecondary[0],
// 			color: "white",
// 		},
// 		modalCancelBtn: {
// 			borderColor: theme.colors.gray[2],
// 			color: theme.colors.gray[5]
// 		}
// 	};
// });

// //infoModal, infoModalTitle, infoModalDescription
// export const useInfoModalStyles = createStyles((theme) => {
// 	const { colors, radius, fontSizes, spacing } = theme;
// 	const { fontWeights } = theme.other;
// 	const white = colors.white[0];
// 	const sColor = colors.brandSecondary[0];
// 	const defaultRadius = radius[theme.defaultRadius as string];

// 	return {
// 		container: {
// 			height: '100%',
// 			width: '100%',
			
// 		},
	
// 		aboutTitle: {
// 			fontSize: fontSizes.md,
// 			textAlign: 'center',
// 			color: colors.gray[7],
// 			fontWeight: fontWeights.bold,
// 		},
// 		parseableText: {
// 			color: colors.brandSecondary[0],
// 		},
// 		aboutDescription: {
// 			fontSize: fontSizes.sm,
// 			textAlign: 'center',
// 			color: colors.dimmed[0],
// 			marginTop: spacing.xs,

// 			'&::after': {
// 				content: '""',
// 				borderRadius: defaultRadius,
// 				display: 'block',
// 				backgroundColor: sColor,
// 				width: widths[14],
// 				height: heights['0.5'],
// 				marginTop: theme.spacing.sm,
// 				marginLeft: 'auto',
// 				marginRight: 'auto',
// 				marginBottom: spacing.sm,
// 			},
// 		},
// 		aboutTextBox: {
// 			marginTop: spacing.md,
// 			marginBottom: spacing.md,
// 			width: '100%',
// 			display: 'flex',
// 			borderRadius: defaultRadius,
// 			border: `${sizing.px} solid ${colors.gray[2]}`,
// 			padding: spacing.md,
// 			flexDirection: 'column',
// 		},
// 		aboutTextInnerBox: {
// 			display: 'flex',
// 			width: '100%',
// 			alignItems: 'center',
// 			marginTop: spacing.xs,
// 			marginBottom: spacing.xs,
// 		},
// 		aboutTextKey: {
// 			fontSize: fontSizes.sm,
// 			color: colors.gray[7],
// 			lineHeight: 'normal',
// 			width: '15%',
// 		},
// 		aboutTextValue: {
// 			fontSize: fontSizes.sm,
// 			color: colors.dimmed[0],
// 			lineHeight: 'normal',
// 			width: '85%',
// 		},
// 		actionBtn: {
		
// 			color: theme.colors.brandPrimary[0],
// 			borderRadius: defaultRadius,
// 			border: `${sizing.px} solid ${colors.gray[2]}`,
// 			position: 'absolute',
// 			right: spacing.xl,
// 			transition: 'transform .2s ease-in-out',

// 			'&:hover ': {
// 				transform: 'scale(1.03)',
// 				color: sColor,
// 				backgroundColor: white,
// 			},
// 		},
// 		actionBtnRed: {
// 			color: "rgb(224, 49, 49)",
// 			borderRadius: defaultRadius,
// 			border: `${sizing.px} solid ${colors.gray[2]}`,
// 			position: 'absolute',
// 			right: spacing.xl,
// 			transition: 'transform .2s ease-in-out',
// 			'&:hover ': {
// 				color: "green",
// 				transform: 'scale(1.03)',
// 				backgroundColor: white,
// 			},
// 		},

// 		helpTitle: {
// 			fontSize: fontSizes.md,
// 			textAlign: 'center',
// 			color: colors.gray[7],
// 			fontWeight: fontWeights.bold,
// 		},

// 		HelpIconBox: {
// 			'&:hover': {
// 				color: sColor,
// 				transform: 'scale(1.4)',
// 			},
// 			height: '34px',
// 			transition: 'transform .2s ease-in-out',
// 			width: '34px',
// 			padding: '0px',
// 			marginInlineEnd: spacing.xs,
// 			color: colors.gray[5],
// 			borderColor: colors.gray[2],
// 		},

// 		helpIconContainer: {
// 			display: 'flex',
// 			alignItems: 'center',
// 			width: '100%',
// 			justifyContent: 'center',
// 		},
		
// 	};
// });
