import { heights } from '@/components/Mantine/sizing';
import { HEADER_HEIGHT } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useLiveTailStyles = createStyles(() => {
	return {
		container: {
			flex: 1,
			position: 'relative',
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT * 2}px)`,
		},
	};
});
