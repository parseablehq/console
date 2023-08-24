import {  NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useUsersStyles = createStyles((theme) => {
	const { spacing,colors } = theme;
	const { widths } = theme.other;
	const sColor = colors.brandSecondary[0];
	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			position: 'relative',
		},
		actionBtn: {
			'&:hover': {
				color: sColor,
			},
			height: '34px',
			width: '34px',
			padding: '0px',
			marginInlineEnd: spacing.xs,
			color: colors.gray[5],
			borderColor: colors.gray[2],
		},
		tableContainer: {
			height: '100%',
		},
		tableStyle: {
			overflow: 'scroll',
			width: '100%',
			height: '100%',
			padding: 0,
		},
		theadStyle: {
			position: 'sticky',
			zIndex: 1,
			top: 0,
			height: '50px',
			'& tr>th': {
				height: "100%",
				textAlign: 'left',
				padding: '30px',
				verticalAlign: 'middle',
				border: 'none !important',
			},
		},
		trStyle: {
			'& tr:nth-of-type(odd)': {
				backgroundColor: "#ececec !important",
			},
			'& td': {
				height: "100%",
				textAlign: 'left',
				verticalAlign: 'middle',
				border: 'none !important',
			},
		
		},
		passwordPrims: {
			
			"& .mantine-Tooltip-tooltip ":{
					backgroundColor:colors.gray[5],
					color:colors.gray[0],
				},
			"& .mantine-Prism-code ":{
				backgroundColor:"white !important",
				border: `1px solid ${colors.gray[2]} !important`,	
			}
			
		},
		modalStyle: {
			'& .mantine-Paper-root ': {
				overflowY: 'inherit',
			},
			'& .mantine-Modal-header	':{
				borderRadius: "8px 8px 0px 0px",
				backgroundColor: colors.gray[1],
			},
			'& .mantine-Modal-title	':{
				fontWeight: 'bold',
			},
			"& .mantine-Modal-body ":{	
				padding: "1rem",
			}
		},
		passwordText:{
			fontWeight:500 ,
			fontSize: "0.875rem",
		}
	};
});

