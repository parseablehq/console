import { HEADER_HEIGHT ,NAVBAR_WIDTH} from '@/constants/theme';

import { createStyles } from '@mantine/core';

export const useQueryStyles = createStyles((theme) => {
	const { colors ,spacing,fontSizes,radius } = theme;
	const { heights,widths,fontWeights ,sizing} = theme.other;
	const sColor = colors.brandSecondary[0];
	const pColor =colors.brandPrimary[0];
	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			display: 'flex',
			position: 'relative',
		},
		innerContainer1:{
			position: 'relative',
			flex: 1,
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT}px)`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			// padding: px(spacing.sm),
		},
		runQueryBtn: {
			background: pColor, 
			color: "white", 
			height: "40px", 
			marginRight: "5px",
			'&:hover': {
				background: sColor,
			},
		},
		actionBtn:{
			'&:hover': {
				color: sColor,
			},
			height: "25px", marginRight: "5px"
		},
		innerContainer: {
			display: 'flex',
			paddingTop: spacing.xxs,
			marginRight: spacing.md,
		},
		labelStyle: {
			fontSize: fontSizes.xs,
			fontWeight: fontWeights.semibold,
		},
		intervalBtn: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			background: pColor,
			color: colors.white[0],
			paddingLeft: spacing.xs,
			paddingRight: spacing.xs,
			minWidth: widths[20],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			borderLeft: 'none',

			'&:hover': {
				background: sColor,
			},
		},
		timeRangeBTn: {
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
			color: colors.black[0],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			minWidth: widths[20],
			background: colors.gray[0],
			fontWeight: fontWeights.medium,
			fontSize: fontSizes.xs,

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
			padding: spacing.xs,
			// boxShadow: shadows.sm,
			// marginBottom: spacing.md,
			// borderRadius: defaultRadius,
			borderBottom: `${sizing.px} ${colors.gray[2]} solid`,
			justifyContent: 'space-between',
			alignItems: 'center',
			
		},

		labelStyle: {
			fontSize: fontSizes.xs,
			fontWeight: fontWeights.semibold,
		},

		innerContainer: {
			display: 'flex',
			paddingTop: spacing.xxs,
			marginRight: spacing.md,
		},

		intervalBtn: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			background: pColor,
			color: colors.white[0],
			paddingLeft: spacing.xs,
			paddingRight: spacing.xs,
			minWidth: widths[20],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			borderLeft: 'none',

			'&:hover': {
				background: sColor,
			},
		},

		timeRangeBTn: {
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
			color: colors.black[0],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			minWidth: widths[20],
			background: colors.gray[0],
			fontWeight: fontWeights.medium,
			fontSize: fontSizes.xs,

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
		},

		searchTypeBtn: {
			border: `${sizing.px} ${colors.gray[2]} solid`,
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
			background: pColor,
			color: colors.white[0],
			borderRight: 'none',
			fontWeight: fontWeights.semibold,
			paddingRight: spacing.sm,
			'&:hover': {
				background: pColor,
			},
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
				background: colors.gray[0],
				border: `${sizing.px} ${colors.gray[2]} solid`,
			},
		},
	};
});