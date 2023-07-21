import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';

export const useHeaderStyles = createStyles((theme) => {
	const { colors, spacing, fontSizes } = theme;
	const { fontWeights } = theme.other;

	return {
		container: {
			background: colors.gray[0],
			display: 'flex',
			alignItems: 'center',
			color: theme.colors.gray[7],
			fontFamily: theme.fontFamily,
			fontSize: fontSizes.md,
			fontWeight: fontWeights.normal,
			lineHeight: 'normal',
			height: HEADER_HEIGHT,
			width: '100%',
		},
		logoContainer: {
			display: 'flex',
			alignItems: 'self-end',
			width: NAVBAR_WIDTH,
			justifyContent: 'space-between',
			// padding: spacing.md,
		},
		imageSty: {
			marginLeft: spacing.md,
		},
		burgerIcon: {
			size: '24px',
			color: theme.colors.gray[7],
		},
		navContainer: {
			width: `calc(100% - ${NAVBAR_WIDTH}px)`,
			justifyContent: 'space-between',
		},
	};
});

export const useLogQueryStyles = createStyles((theme) => {
	const { spacing, radius, colors, fontSizes } = theme;
	const { sizing, widths, fontWeights } = theme.other;
	const defaultRadius = radius[theme.defaultRadius as string];
	const pColor = colors.brandPrimary[0];
	const sColor = colors.brandSecondary[0];
	return {
		container: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: spacing.md,
		},

		innerContainer: {
			display: 'flex',
			paddingTop: spacing.xxs,
			color: colors.gray[6],
		},
		homeIcon: {
			size: '24px',
			strokeWidth: 1.0,
		},
		activeBtn: {
			color: colors.brandPrimary[0],
			textDecoration: 'underline',
		},

		intervalBtn: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			background: colors.white[0],
			color: theme.colors.gray[6],
			minWidth: widths[20],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			padding: `${spacing.xs} ${spacing.sm}`,
			marginRight: spacing.xs,
			'&:hover': {
				background: colors.gray[1],
			},
		},
		refreshNowBtn: {
			background: colors.white[0],
			padding: 0,
			marginRight: spacing.xs,
			width: '36px',
			color: theme.colors.gray[6],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			'&:hover': {
				background: colors.gray[1],
			},
		},

		timeRangeBTn: {
			color: colors.gray[6],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			minWidth: widths[20],
			padding: `${spacing.xs} ${spacing.sm}`,
			marginRight: spacing.xs,
			background: colors.white[0],
			'&:hover': {
				background: colors.gray[1],
			},
		},

		timeRangeContainer: {
			display: 'flex',
		},

		fixedRangeContainer: {
			display: 'flex',
			flexDirection: 'column',
			background: colors.gray[0],
		},

		fixedRangeBtn: {
			color: colors.black,
			padding: spacing.sm,
			fontSize: fontSizes.sm,

			'&:hover': {
				background: colors.gray[1],
			},

			'&:first-of-type': {
				borderTopLeftRadius: defaultRadius,
			},

			'&:last-of-type': {
				borderBottomLeftRadius: defaultRadius,
			},
		},

		fixedRangeBtnSelected: {
			background: pColor,
			fontWeight: fontWeights.semibold,
			color: colors.white[0],

			'&:hover': {
				background: sColor,
			},
		},

		customRangeContainer: {
			padding: `${spacing.xs} ${spacing.lg}`,
			minWidth: widths[80],
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'stretch',
		},

		customTimeRangeFooter: {
			display: 'flex',
			marginTop: 'auto',
			justifyContent: 'end',
			alignItems: 'center',
		},

		customTimeRangeApplyBtn: {
			background: pColor,
			'&:hover': {
				background: sColor,
			},
		},

		searchContainer: {
			display: 'flex',
			paddingRight: spacing.sm,
		},

		searchTypeBtn: {
			border: `${sizing.px} ${colors.gray[1]} solid`,
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
			background: pColor,
			color: colors.white[0],
			borderRight: 'none',
			fontWeight: fontWeights.semibold,
			paddingRight: spacing.sm,
		},

		searchTypeActive: {
			background: pColor,
			fontWeight: fontWeights.medium,
			color: colors.white[0],

			'&:hover': {
				background: sColor,
			},
		},

		searchInput: {
			width: '100%',
			flex: 1,

			'& input': {
				background: colors.white[0],
				border: `${sizing.px} ${colors.gray[2]} solid`,
				borderRadius: defaultRadius,
				fontWeight: fontWeights.medium,
			},
		},
	};
});
