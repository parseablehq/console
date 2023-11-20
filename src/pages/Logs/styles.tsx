import { HEADER_HEIGHT } from '@/constants/theme';
import { createStyles } from '@mantine/core';

export const useLogsStyles = createStyles(() => {
	return {
		container: {
			flex: 1,
			display: 'flex',
			position: 'relative',
			flexDirection: 'column',
		},
	};
});

export const useLogTableStyles = createStyles((theme) => {
	const { spacing, other, radius, shadows, colors, fontSizes } = theme;
	const { heights, widths, fontWeights } = other;
	const pColor = colors.brandPrimary[0];
	const sColor = colors.brandSecondary[0];

	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			position: 'relative',
			flex: 1,
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT * 2}px )`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
		},

		innerContainer: {
			position: 'relative',
			flex: 1,
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT * 2}px)`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
		},
		tableContainer: {
			position: 'relative',
		},

		pinnedTableContainer: {},

		pinnedScrollView: {
			overflow: 'unset !important',

			'& .mantine-ScrollArea-root ': {},
		},

		tableStyle: {
			whiteSpace: 'nowrap',
			overflow: 'scroll',
			width: '100%',
			padding: 0,
		},

		theadStyle: {
			position: 'sticky',
			zIndex: 1,
			top: 0,
			'& th:last-of-type': {
				position: 'sticky',
				boxShadow: shadows.sm,
				right: 0,
			},
		},
		theadStylePinned: {
			position: 'sticky',
			top: 0,
		},

		trStyle: {
			cursor: 'pointer',
			background: colors.white,
			'&:hover': {
				background: colors.gray[1],
			},

			'& td': {
				height: heights[10],
				textAlign: 'left',
				verticalAlign: 'middle',
				border: 'none !important',
			},
			zIndex: 2,
		},
		trEvenStyle: {
			cursor: 'pointer',
			background: colors.gray[0],

			'&:hover': {
				background: colors.gray[1],
			},

			'& td': {
				height: heights[10],
				textAlign: 'left',
				verticalAlign: 'middle',
				border: 'none !important',
			},
			zIndex: 2,
		},

		tdArrowContainer: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},

		tdArrow: {
			position: 'sticky',
			right: 0,
			background: 'inherit',
			boxShadow: shadows.sm,

			'tr:hover &': {
				background: colors.gray[1],
			},
		},

		thColumnMenuBtn: {
			width: widths[6],
			height: heights[6],
		},

		thColumnMenuResetBtn: {
			margin: spacing.sm,
		},

		thColumnMenuDropdown: {
			maxHeight: heights[96],
			overflowX: 'hidden',
			overflowY: 'scroll',
		},

		thColumnMenuDragHandle: {
			...theme.fn.focusStyles(),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			height: '100%',
			color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
			paddingRight: theme.spacing.md,
		},

		thColumnMenuDraggable: {
			display: 'flex',
		},

		footerContainer: {
			padding: spacing.md,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			background: colors.gray[0],
			borderTop: `${widths.px} ${colors.gray[1]} solid`,
		},

		errorContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: heights.full,
		},

		limitContainer: {},

		limitBtn: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			cursor: 'pointer',
			fontSize: fontSizes.sm,
			background: colors.white[0],
			padding: `0.2rem ${spacing.xs}`,
			border: `${widths.px} ${colors.gray[1]} solid`,
			borderRadius: defaultRadius,
			'&:hover': {
				background: colors.gray[1],
			},
		},

		limitBtnText: {},

		limitActive: {
			background: pColor,
			fontWeight: fontWeights.medium,
			color: colors.white[0],

			'&:hover': {
				background: sColor,
			},
		},
		limitOption: {
			fontWeight: fontWeights.normal,

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
			position: 'sticky',
			top: 0,
			zIndex: 10,
			background: pColor,
			padding: spacing.md,
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

export const useTableColumnStyle = createStyles((theme) => {
	const { spacing, colors, fontSizes, other } = theme;
	const { fontWeights, widths } = other;

	const pColor = colors.brandPrimary[0];
	const sColor = colors.brandSecondary[0];

	return {
		labelBtn: {
			width: widths.full,
			display: 'flex',
			alignItems: 'center',
			textAlign: 'left',
			padding: `${spacing.xs} ${spacing.sm}`,
			fontWeight: fontWeights.medium,
			'&:hover': {
				background: colors.gray[1],
			},
			height: '100%',
		},

		labelIcon: {
			color: colors.gray[5],
			marginLeft: spacing.xs,
		},

		labelIconActive: {
			color: pColor[0],
		},

		searchInputStyle: {
			marginBottom: spacing.xs,
		},
		filterText: {
			display: 'flex',
			alignItems: 'center',
			color: colors.gray[6],
			padding: 0,
			fontSize: fontSizes.sm,
			fontWeight: fontWeights.normal,
			cursor: 'default',
		},

		checkBoxStyle: {
			height: 35,
			paddingTop: spacing.xs,
			paddingBottom: spacing.xxs,
			fontWeight: fontWeights.normal,
			overflow: 'hidden',
			whiteSpace: 'nowrap',

			'& .mantine-Checkbox-label': {
				fontSize: fontSizes.sm,
			},

			'&:hover': {
				background: colors.gray[0],
				color: sColor,
			},
		},

		applyBtn: {
			marginTop: spacing.xs,
			width: widths.full,
			background: pColor,

			'&:hover': {
				background: pColor[1],
			},
		},
		sortBtn: {
			display: 'flex',
			alignItems: 'center',
			color: colors.gray[6],
			padding: 0,
			fontSize: fontSizes.sm,
			fontWeight: fontWeights.normal,
			'&:hover': {
				color: sColor,
			},
		},
		sortBtnActive: {
			display: 'flex',
			alignItems: 'center',
			color: pColor,
			padding: 0,
			fontSize: fontSizes.sm,
			fontWeight: fontWeights.semibold,
			'&:hover': {
				color: sColor,
			},
		},
	};
});

export const useHeaderPaginationStyle = createStyles((theme) => {
	const { spacing, colors } = theme;
	const { sizing } = theme.other;
	return {
		controlBtn: {
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
		controlContainer: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'row',
			paddingTop: spacing.xs,
		},
		controlText: {
			marginRight: spacing.xs,
		},
	};
});

export const useCarouselSlideStyle = createStyles((theme) => {
	const { spacing, colors } = theme;
	const { sizing } = theme.other;

	return {
		controlBtn: {
			background: colors.white[0],
			padding: spacing.xs,
			marginRight: spacing.xs,
			color: theme.colors.gray[6],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			'&:hover': {
				background: colors.gray[1],
			},
		},
	};
});
