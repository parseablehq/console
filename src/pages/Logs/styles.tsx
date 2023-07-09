import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles, px } from '@mantine/core';

export const useLogsStyles = createStyles((theme) => {
	const { widths } = theme.other;
	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			display: 'flex',
			position: 'relative',
		},
	};
});

export const useLogStreamListStyles = createStyles((theme) => {
	const { colors, spacing, radius, primaryColor, fontSizes } = theme;
	const { widths, heights, fontWeights } = theme.other;

	const pColor = colors.brandPrimary[0];
	const containerWidth = widths[64];
	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			position: 'sticky',
			left: 0,
			height: '100%',
			display: 'flex',
			zIndex: 2,
		},

		streamContainer: {
			paddingBottom: spacing.lg,
			width: containerWidth,
			position: 'sticky',
			display: 'flex',
			flexDirection: 'column',
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT}px)`,
			visibility: 'visible',
			background: colors.gray[0],
			transition: 'width 0.3s ease',
			borderRightWidth: widths.px,
			borderColor: colors.gray[1],
			borderRightStyle: 'solid',
		},

		streamContainerClose: {
			borderRightStyle: 'none',
			width: 0,
		},

		chevronBtn: {
			alignSelf: 'center',
			width: widths[6],
			height: heights[9],
			background: colors.gray[0],
			display: 'flex',
			justifyItems: 'center',
			alignItems: 'center',
			borderTopRightRadius: defaultRadius,
			borderBottomRightRadius: defaultRadius,
			borderRightWidth: widths.px,
			borderTopWidth: widths.px,
			borderBottomWidth: widths.px,
			borderColor: colors.gray[1],
			borderStyle: 'solid',
		},

		chevronBtnClose: {
			background: colors[primaryColor][2],
			color: colors.white,
		},

		searchInputStyle: {
			margin: spacing.xs,
			marginBottom: 0,
		},

		streamListContainer: {
			display: 'flex',
			flexDirection: 'column',
			flex: 1,
		},

		streamBtn: {
			height: heights[11],
			maxWidth: `calc(${containerWidth} - ${spacing.lg})`,
			width: widths.full,
			overflow: 'hidden',
			display: 'block',
			borderTopRightRadius: defaultRadius,
			borderBottomRightRadius: defaultRadius,
			color: colors.gray[7],
			padding: `0 ${spacing.md}`,
			marginRight: spacing.md,
			fontWeight: fontWeights.medium,
			fontSize: fontSizes.sm,

			'&:hover': {
				background: colors.gray[2],
			},
		},

		streamBtnActive: {
			background: pColor,

			'&:hover': {
				background: pColor,
			},
		},

		streamText: {
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		streamTextActive: {
			color: colors.white[0],
		},

		retryContainer: {
			height: heights.full,
			width: widths.full,
		},
	};
});

export const useLogTableStyles = createStyles((theme) => {
	const { spacing, other, radius, shadows, colors } = theme;
	const { heights, widths, fontWeights } = other;
	const pColor = colors.brandPrimary[0];
	const sColor = colors.brandSecondary[0];

	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			position: 'relative',
			flex: 1,
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT}px)`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			// padding: px(spacing.sm),
		},

		innerContainer: {
			position: 'relative',
			flex: 1,
			maxHeight: `calc(${heights.screen} - ${2 * HEADER_HEIGHT}px)`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			padding: px(spacing.sm),
		},

		paginationRow: {
			'.mantine-Pagination-control': {
				'&:hover': {
					color: sColor,
				},
				'&:data-active=true': {
					color: pColor,
				},
			},
			'.mantine-Pagination-control[data-active=true]': {
				background: pColor,
				'&:hover': {
					backgroundColor: sColor,
					color: colors.white[0],
				},
			},
		},

		tableContainer: {
			position: 'relative',
			boxShadow: shadows.sm,
			borderRadius: defaultRadius,
		},

		tableStyle: {
			whiteSpace: 'nowrap',
			overflow: 'scroll',
			width: '100%',
			paddingBottom: 0,
		},

		theadStyle: {
			position: 'sticky',
			top: 0,
			zIndex: 1,

			'& th:last-of-type': {
				position: 'sticky',
				boxShadow: shadows.sm,
				right: 0,
			},
		},

		trStyle: {
			cursor: 'pointer',

			'&:hover': {
				background: colors.gray[1],
			},

			'& td': {
				height: heights[14],
				textAlign: 'left',
				verticalAlign: 'middle',
			},
		},

		tdArrowContainer: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},

		tdArrow: {
			position: 'sticky',
			right: 0,
			background: colors.white[0],
			boxShadow: shadows.sm,

			'tr:hover &': {
				background: colors.gray[1],
			},
		},

		thColumnMenuBtn: {
			width: widths[10],
			height: heights[10],
		},

		thColumnMenuDropdown: {
			maxHeight: heights[96],
			overflowX: 'hidden',
			overflowY: 'scroll',
		},

		footerContainer: {
			paddingTop: spacing.md,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
		},

		errorContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: heights.full,
		},

		limitContainer: {
			marginLeft: 'auto',
		},

		limitBtn: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			cursor: 'pointer',
			background: colors.white[0],
			boxShadow: shadows.sm,
			padding: `0.2rem ${spacing.xs}`,
			border: `${widths.px} ${colors.gray[1]} solid`,
			borderRadius: defaultRadius,

			'&:hover': {
				background: colors.gray[0],
			},
		},

		limitBtnText: {
			marginRight: spacing.md,
		},

		limitActive: {
			background: pColor,
			fontWeight: fontWeights.medium,
			color: colors.white[0],

			'&:hover': {
				background: sColor,
			},
		},
		limitOption: {
			fontWeight: fontWeights.medium,

			'&:hover': {
				color: sColor,
			},
		},
	};
});

export const useViewLogStyles = createStyles((theme) => {
	const { spacing, other, colors, fontSizes } = theme;
	const { fontWeights } = other;
	const pColor = colors.brandPrimary[0];

	return {
		container: {
			padding: spacing.lg,
		},

		headerContainer: {
			background: pColor,
			padding: spacing.sm,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		},

		headerTimeStampTitle: {
			color: colors.white,
			fontSize: fontSizes.sm,
			fontWeight: fontWeights.semibold,
		},

		headerTimeStamp: {
			color: colors.white,
			fontSize: fontSizes.sm,
			fontWeight: fontWeights.medium,
		},

		dataChipContainer: {
			display: 'flex',
			flexWrap: 'wrap',
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

export const useTableColumnStyle = createStyles((theme) => {
	const { spacing, colors, fontSizes, other, primaryColor } = theme;
	const { fontWeights, widths } = other;

	const pColor = colors[primaryColor];

	return {
		labelBtn: {
			width: widths.full,
			display: 'flex',
			alignItems: 'center',
			paddingLeft: spacing.xs,
			paddingRight: spacing.xs,

			'&:hover': {
				background: colors.gray[1],
			},
		},

		labelIcon: {
			marginRight: 'auto',
		},

		labelIconActive: {
			color: pColor[0],
		},

		searchInputStyle: {
			marginBottom: spacing.xs,
		},

		checkBoxStyle: {
			height: 35,
			paddingTop: spacing.xs,
			paddingBottom: spacing.xxs,
			fontWeight: fontWeights.medium,
			overflow: 'hidden',
			whiteSpace: 'nowrap',

			'& .mantine-Checkbox-label': {
				fontSize: fontSizes.sm,
			},

			'&:hover': {
				background: colors.gray[1],
			},
		},

		applyBtn: {
			marginTop: spacing.xs,
			width: widths.full,
			background: pColor[0],

			'&:hover': {
				background: pColor[1],
			},
		},
	};
});
