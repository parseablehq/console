import { HEADER_HEIGHT, NAVBAR_WIDTH } from '@/constants/theme';

import { createStyles } from '@mantine/core';

export const useQueryStyles = createStyles((theme) => {
	const { colors ,shadows } = theme;
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
		innerContainer: {
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
		schemaContainer:{
			border: `${widths.px} ${colors.gray[1]} solid`,
			boxShadow: shadows.sm,
			maxWidth: "500px"	
		}
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
			width:"100%"
		},
		runQueryBtn: {
			color: pColor,
			borderColor: colors.gray[2],
			height: "34px",
			'&:hover': {
				color: sColor,
			},
			marginInlineEnd: spacing.xs,
			
		},
		textContext: {
			marginRight: spacing.md,
			fontSize: fontSizes.md,
			fontFamily: fontFamily,
			fontWeight: fontWeights.semibold,
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
			borderColor:colors.gray[2]
		},
		textContext: {
			marginRight: spacing.md,
			fontSize: fontSizes.md,
			fontFamily: fontFamily,
			fontWeight: fontWeights.semibold,
		}
	};
});


export const useQuerySchemaListStyles = createStyles((theme) => {
	const { colors  ,spacing ,fontFamily,fontSizes} = theme;
	const {fontWeights } = theme.other;
	const sColor = colors.brandSecondary[0];

	return {
		container: {
			maxWidth: "500px",
			height: "100%",
			overflow: "auto",
		},
		innercontainer: {
			display: "flex",
			alignItems: "center",
			borderBottom: `solid 1px ${colors.gray[2]}`,
			height: "55px",
			padding: `${spacing.xs} ${spacing.md}` ,
			justifyContent:"space-between"
			,paddingRight:0,
		},

		actionBtn: {
			color: colors.gray[3],
			border: "none ",
			height: "40px",
			'&:hover': {
				color: sColor,
			},
		},
		textContext: {
			marginRight: spacing.md,
			fontSize: fontSizes.md,
			fontFamily: fontFamily,
			fontWeight: fontWeights.semibold,
		},
		theadSt:{
			"& tr>th":{
				backgroundColor:colors.gray[0],
				fontSize: fontSizes.md,
				fontFamily: fontFamily,
				fontWeight: fontWeights.semibold,
				color:colors.gray[3],
				height: "34px"
			}
		},
		tbodySt:{
			"& tr>td":{
				fontSize: fontSizes.md,
				fontFamily: fontFamily,
				borderTop:`solid 1px ${colors.gray[2]} !important`,
				color:colors.gray[6],
				height: "34px"
			}
		}
	};
});
