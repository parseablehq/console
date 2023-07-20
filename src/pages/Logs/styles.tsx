import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';

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

export const useLogTableStyles = createStyles((theme) => {
	const { spacing, other, radius, shadows, colors ,fontSizes} = theme;
	const { heights, widths, fontWeights ,} = other;
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
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT}px)`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
		},

		paginationRow: {
			'.mantine-Pagination-control': {
			border: `solid 1px ${colors.gray[2]}`,
			fontSize: fontSizes.sm,
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
			position: 'relative'
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
				border:"none !important",

			},
		},
		trEvenStyle:{
			cursor: 'pointer',
			background: colors.gray[0],

			'&:hover': {
				background: colors.gray[1],
			},

			'& td': {
				height: heights[10],
				textAlign: 'left',
				verticalAlign: 'middle',
				border:"none !important",

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
			background:"inherit",
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

		limitContainer: {
			
		},

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

		limitBtnText: {
		
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
			background: pColor,
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
	const { spacing, colors, fontSizes, other, primaryColor } = theme;
	const { fontWeights, widths } = other;

	const pColor = colors[primaryColor];

	return {
		labelBtn: {
			width: widths.full,
			display: 'flex',
			alignItems: 'center',
			textAlign: 'left',
			height: "100%",
			'&:hover': {
				background: colors.gray[1],
			},
		},

		labelIcon: {
			color: colors.gray[5],
			marginLeft:spacing.xs
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
