import { HEADER_HEIGHT } from '@/constants/theme';
import { createStyles } from '@mantine/core';

export const useMainLayoutStyles = createStyles((theme) => {
	const { heights } = theme.other;

	return {
		container: {
			width: '100vw',
			minWidth: 1000,
		},

		contentContainer: {
			display: 'flex',
			height: `calc(${heights.full} - ${HEADER_HEIGHT}px)`,
		},
	};
});
