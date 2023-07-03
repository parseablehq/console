import { NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';

export const useQueryStyles = createStyles((theme) => {
	const { widths } = theme.other;
	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			display: 'flex',
			position: 'relative',
		},
	};
});