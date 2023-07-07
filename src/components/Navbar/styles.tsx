import { createStyles } from '@mantine/core';

export const useNavbarStyles = createStyles((theme) => {
	const { colors} = theme;
	const white = colors.white[0];
	const sColor = colors.brandSecondary[0];
	const pColor = colors.brandPrimary[0];

	return {
		container: {
			display: 'flex',
			background: white,
			flexDirection: 'column',
			alignItems: 'center',
			margin:"10px"
		},
		linkBtnActive: {
			color: pColor,
			'&:hover *': {
				color: sColor,
			},
		},
		linkBtn:{
			'&:hover *': {
				color: sColor,
			},
		},
		selectStreambtn:{
			'.mantine-Select-item[data-selected="true"]':{
				background:pColor,
				["&:hover"]:{background:sColor,color:white}
			},
			'.mantine-Select-item':{
				["&:hover"]:{color:sColor}
				
			}

		}
	};
});
