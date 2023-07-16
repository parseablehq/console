import { createStyles } from '@mantine/core';

export const useNavbarStyles = createStyles((theme) => {
	const { colors, radius, fontSizes, } = theme;
	const { fontWeights, sizing } = theme.other;
	const white = colors.white[0];
	const sColor = colors.brandSecondary[0];
	const defaultRadius = radius[theme.defaultRadius as string];

	const pColor = colors.brandPrimary[0];

	return {
		container: {
			display: 'flex',
			background: white,
			flexDirection: 'column',
			alignItems: 'center',
			color: theme.colors.gray[7],
			fontFamily: theme.fontFamily,
			fontSize: fontSizes.md,
			fontWeight: fontWeights.normal,
			lineHeight: "normal",
		},
		streamsBtn: {
			padding:"24px 24px 14px 24px", ":hover": { background: "white" }

		},
		linkBtnActive: {
			color: pColor,
			'&:hover *': {
				color: sColor,
			},
			fontWeight: fontWeights.bold,
		},
		linkBtn: {
			color: theme.colors.gray[5],
			'&:hover *': {
				color: sColor,
			},
		},
		selectStreambtn: {
			'.mantine-Input-rightSection ': {
				"& svg": {
					stroke: colors.gray[2],
				}
			},
			'& input': {
				border: `${sizing.px} ${colors.gray[2]} solid`,
				borderRadius: defaultRadius,
				padding: 24,
				width: "230px",
			},
			'.mantine-Select-item[data-selected="true"]': {
				background: pColor,
				"&:hover": { background: sColor, color: white }
			},
			'.mantine-Select-item': {
				"&:hover": { color: sColor }
			},
			margin: "0 24px 0 24px"

		}
		,lowerContainer: {
			marginBottom:"84px"
		},
	};
});
