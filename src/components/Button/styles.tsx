import { createStyles } from '@mantine/core';

export const useButtonStyles = createStyles((theme) => {
	const { colors, primaryColor, spacing,  } = theme;
	const { sizing } = theme.other;

	return {
		retryBtn: {
			backgroundColor: colors[primaryColor][1],
		},
		toggleBtn: {
			background: colors.white[0],
			padding: '6px 12px',
			marginRight: spacing.xs,
			color: theme.colors.gray[6],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			'&:hover': {
				background: colors.gray[1],
			},
		},
		toggleBtnActive: {
			background: colors.brandPrimary[0],
			color: colors.white[0],
		}
	};
});
