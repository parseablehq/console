import { createStyles } from '@mantine/core';
export const useConfigStyles = createStyles((theme) => {
	const { spacing, colors } = theme;
	const { widths } = theme.other;
	return {
		container: {
			display: 'flex',
			flexDirection: 'column',
			flex: 1,
			margin: spacing.xl,
			gap: spacing.lg,
		},
		containerWrapper: {
			display: 'flex',
			gap: '20px',
		},
		primaryBtn: {
			marginTop: spacing.md,
			backgroundColor: theme.colors.brandPrimary[0],
			color: theme.colors.white,
			width: 'max-content',
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
				border: `${widths.px} ${colors.gray[1]} solid`,
			},
		},
		innerContainer: {
			width: '50%',
			justifyContent: 'center',
			display: 'flex',
		},
	};
});
