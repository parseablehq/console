import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';

export const useLogsStyles = createStyles(() => {
	return {
		container: {
			flex: 1,
			display: 'flex',
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
			background: colors.gray[0],
			width: containerWidth,
			position: 'sticky',
			left: NAVBAR_WIDTH,
			display: 'flex',
			flexDirection: 'column',
			transition: 'width 0.3s ease',
			borderRightWidth: widths.px,
			borderColor: colors.gray[1],
			borderRightStyle: 'solid',
		},

		containerClose: {
			width: 0,
			borderRightStyle: 'none',
		},

		streamContainer: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT}px)`,
			visibility: 'visible',
		},

		streamContainerClose: {
			visibility: 'hidden',
		},

		chevronBtn: {
			position: 'absolute',
			top: '50%',
			width: widths[6],
			height: heights[9],
			transform: 'translate(0, -50%)',
			background: colors.gray[0],
			display: 'flex',
			justifyItems: 'center',
			alignItems: 'center',
			borderTopRightRadius: radius.md,
			borderBottomRightRadius: radius.md,
			right: `calc(0px + -${widths[6]})`,
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
	};
});
