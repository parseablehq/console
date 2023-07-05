import { NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';

export const useQueryStyles = createStyles((theme) => {
	const { colors } = theme;
	const { widths } = theme.other;
	const sColor = colors.brandSecondary[0];
	const pColor =colors.brandPrimary[0];
	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			display: 'flex',
			position: 'relative',
		},
		runQueryBtn: {
			background: pColor, 
			color: "white", 
			height: "40px", 
			marginRight: "5px",
			'&:hover': {
				background: sColor,
			},
		},
		actionBtn:{
			'&:hover': {
				color: sColor,
			},
			height: "25px", marginRight: "5px"
		}
	};
});