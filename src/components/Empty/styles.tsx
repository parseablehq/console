import { createStyles } from '@mantine/core';

export const useEmptyStyles = createStyles((theme) => {
	const { colors, spacing } = theme;

	return {
		container: {
			height: '100%',
			width: '100%',
			paddingTop: spacing.xl,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},

		messageStyle: {
			marginTop: spacing.md,
			color: colors.dimmed[0],
		},
	};
});
