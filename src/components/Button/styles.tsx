import { createStyles } from '@mantine/core';

export const useButtonStyles = createStyles((theme) => {
	const { colors, primaryColor } = theme;

	const pColor = colors[primaryColor][1];

	return {
		retryBtn: {
			backgroundColor: pColor,
		},
	};
});
