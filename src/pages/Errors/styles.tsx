import { createStyles } from '@mantine/core';

const useErrorPageStyles = createStyles((theme) => {
	const { colors, primaryColor, spacing } = theme;

	const pColor = colors[primaryColor][2];
	const sColor = colors.brandSecondary[2];

	return {
		container: {
			flex: 1,
			padding: spacing.xl,
		},

		illustration: {
			fill: pColor,
			maxHeight: 250,
		},

		titleStyle: {
			textAlign: 'center',
			fontWeight: 900,
			fontSize: 38,
			marginTop: 20,
			color: pColor,
		},

		descriptionStyle: {
			maxWidth: 540,
			margin: 'auto',
			marginTop: spacing.xl,
			marginBottom: spacing.xl,
		},

		btnStyle: {
			background: sColor,
		},
	};
});

export default useErrorPageStyles;
