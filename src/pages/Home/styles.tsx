import { NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useHomeStyles = createStyles((theme) => {
	const { spacing, colors } = theme;
	return {
		container: {
			flex: 1,
			display: 'flex',
			position: 'relative',
			flexDirection: 'column',
		},
		noDataViewContainer: {
			height: '100%',
			width: `calc(100% - ${NAVBAR_WIDTH}px)`,
			paddingTop: spacing.xl,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
		messageStyle: {
			marginTop: spacing.md,
			color: colors.dimmed[0],
		},
		btnStyle: {
			marginTop: spacing.md,
			color: colors.white,
			backgroundColor: colors.brandPrimary[0],
		},
	};
});

export const cardStyles = createStyles((theme) => {
	const { colors, primaryColor } = theme;
	return {
		container: {
			height: '100%',
			width: '100%',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
		messageStyle: {
			marginTop: theme.spacing.md,
			color: theme.colors.gray[6],
		},
		streamBox: {
			borderRadius: theme.radius.md,
			boxShadow: `0px 2px 8px 0px rgba(0, 0, 0, 0.2)`,
			height: 95,
			padding: theme.spacing.md,
			cursor: 'pointer',
			marginLeft: theme.spacing.md,
			marginRight: theme.spacing.md,
		},
		streamBoxCol: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			paddingRight: 40,
			borderRight: `1px solid ${theme.colors.gray[2]}`,
			color: colors[primaryColor][0]
		},
	};
});
