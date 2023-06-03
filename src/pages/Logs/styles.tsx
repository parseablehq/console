import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles, px } from '@mantine/core';

export const useLogsStyles = createStyles(() => {
	return {
		container: {
			flex: 1,
			width: '100%',
			display: 'flex',
			position: 'relative',
		},
	};
});

export const useLogStreamListStyles = createStyles((theme) => {
	const { colors, spacing, radius, primaryColor, fontSizes } = theme;
	const { widths, heights, fontWeights } = theme.other;

	const pColor = colors[primaryColor][1];
	const containerWidth = widths[64];

	return {
		container: {
			position: 'sticky',
			left: NAVBAR_WIDTH,
			height: '100%',
			display: 'flex',
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
			overflowY: 'scroll',
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
			borderTopRightRadius: radius.md,
			borderBottomRightRadius: radius.md,
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
			borderTopRightRadius: radius.md,
			borderBottomRightRadius: radius.md,
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

		retryBtn: {
			backgroundColor: pColor,
		},
	};
});

export const useLogTableStyles = createStyles((theme) => {
	const { spacing, other, radius, shadows, colors } = theme;
	const { heights, widths } = other;

	return {
		container: {
			position: 'relative',
			flex: 1,
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT}px)`,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			padding: px(spacing.sm),
		},

		tableContainer: {
			position: 'relative',
			boxShadow: shadows.xs,
			borderRadius: radius.md,
			overflow: 'scroll',
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
				boxShadow: shadows.xl,
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
			boxShadow: shadows.xl,

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
	};
});

export const useViewLogStyles = createStyles((theme) => {
	const { spacing, other, colors, primaryColor, fontSizes } = theme;
	const { fontWeights } = other;
	const pColor = colors[primaryColor][1];

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
