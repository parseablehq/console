import { createStyles } from '@mantine/core';
export const useConfigStyles = createStyles((theme) => {
	const { spacing ,colors} = theme;
	const { widths, } = theme.other;
	return {
		container: {
			display: 'flex',
			margin: spacing.md,
			flex: 1,
		},
		submitBtn: {
			marginTop: spacing.md,
			backgroundColor: theme.colors.brandPrimary[0],
			color: theme.colors.white,
		},
		accordionSt: {
			borderRadius: '60px',
			border: 'none',
			'& .mantine-Accordion-item': {
				border:`${widths.px} ${colors.gray[1]} solid`,
			},
		},
		innerContainer: {
			width: '50%',
			justifyContent: 'center',
			display: 'flex',
		},
		
	};
});

