import { createStyles } from '@mantine/core';

export const useNavbarStyles = createStyles((theme) => {
	const { colors, primaryColor, spacing } = theme;
	const { widths, heights } = theme.other;
	const pColor = colors[primaryColor][2];
	const sColor = colors.brandSecondary[2];

	return {
		container: {
			display: 'flex',
			background: pColor,
			paddingTop: spacing.lg,
			flexDirection: 'column',
			border: 'none',
			alignItems: 'center',
		},

		linkBtnStyle: {
			width: widths[10],
			height: heights[10],
			borderRadius: theme.radius.md,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			marginTop: spacing.lg,
			backgroundColor: colors.brandPrimary[1],
			border: `${widths[0.5]} solid ${colors.gray[0]}`,

			'& *': {
				color: colors.white,
			},

			'&:hover, &:hover *': {
				backgroundColor: theme.colors.gray[0],
				color: pColor,
			},
		},

		linkBtnActiveStyle: {
			background: colors.white,
			border: `${widths['0.5']} solid ${sColor}`,

			'& *': {
				color: pColor,
			},

			'&:hover, &:hover *': {
				background: colors.white,
				color: pColor,
			},
		},

		linkBtnIcon: {
			color: colors.dark,
		},

		linkBtnActiveIcon: {
			color: pColor,
		},
	};
});