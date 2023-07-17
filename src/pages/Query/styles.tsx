import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';

import { createStyles } from '@mantine/core';

export const useQueryStyles = createStyles((theme) => {
	const { colors, spacing } = theme;
	const { heights, widths, } = theme.other;
	const sColor = colors.brandSecondary[0];
	const pColor = colors.brandPrimary[0];

	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			display: 'flex',
			position: 'relative',
		},
		innerContainer1: {
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
		actionBtn: {
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
	};
});

export const useQueryCodeEditorStyles = createStyles((theme) => {
	const { colors, spacing, fontFamily, fontSizes } = theme;
	const { fontWeights } = theme.other;
	const sColor = colors.brandSecondary[0];
	const pColor = colors.brandPrimary[0];

	return {
		container: {
			display: "flex",
			borderBottom: `solid 1px ${colors.gray[2]}`,
			alignItems: "center",
			height: "55px",
			padding: `${spacing.xs} ${spacing.md}` ,
		},
		runQueryBtn: {
			color: pColor,
			border: "none",
			height: "40px",
			marginLeft: "auto",
			'&:hover': {
				color: sColor,
			},
		},
		textContext: {
			marginRight: spacing.md,
			fontSize: fontSizes.md,
			fontFamily: fontFamily,
			fontWeight: fontWeights.bold,
		}

	};
});


export const useQueryResultEditorStyles = createStyles((theme) => {
	const { colors, spacing ,fontFamily,fontSizes} = theme;
	const { fontWeights } = theme.other;
	const sColor = colors.brandSecondary[0];


	return {
		container: {
			display: "flex",
			alignItems: "center",
			borderBottom: `solid 1px ${colors.gray[2]}`,
			height: "55px",
		padding: `${spacing.xs} ${spacing.md}` ,
		},
		actionBtn: {
	
			'&:hover': {
				color: sColor,
			},
			height: "34px",
			marginInlineEnd: spacing.xs,
			color: colors.gray[5],
			borderColor:colors.gray[5]
		},
		textContext: {
			marginRight: spacing.md,
			fontSize: fontSizes.md,
			fontFamily: fontFamily,
			fontWeight: fontWeights.bold,
		}
	};
});