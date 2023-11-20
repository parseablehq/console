import {  NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useHomeStyles = createStyles(() => {
	const { spacing ,colors} = theme;
	return {
		container: {
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

