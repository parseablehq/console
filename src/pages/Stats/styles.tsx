import { heights } from '@/components/Mantine/sizing';
import { HEADER_HEIGHT } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useStatsStyles = createStyles(() => {
	return {
		container: {
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT * 2}px)`,
			display: 'flex',
			flexDirection: 'column',
		},
	};
});

export const useStatusStyles = createStyles((theme) => {
	const { colors, other, spacing, fontSizes } = theme;

	const { fontWeights, widths } = other;

	return {
		container: {
			flex: '0 0 auto',
		},
		headContainer: {
			display: 'flex',
			justifyContent: 'space-between',
			padding: spacing.md,
			height: '55px',
			alignItems: 'center',
			borderBottom: `${widths.px} ${colors.gray[1]} solid`,
		},

		statusText: {
			fontSize: fontSizes.md,
			fontWeight: fontWeights.semibold,
			color: colors.gray[6],
		},
		statusTextResult: {
			color: '#00CC14',
		},
		statusTextFailed: {
			color: '#FF0000',
		},
		genterateContiner: {
			marginRight: spacing.sm,
		},
		genterateText: {
			fontSize: fontSizes.md,
			fontWeight: fontWeights.semibold,
			color: colors.gray[6],
		},
		genterateTextResult: {
			fontSize: fontSizes.md,
			fontWeight: fontWeights.normal,
			color: colors.gray[6],
		},
	};
});
export const useStatCardStyles = createStyles((theme) => {
	const { colors, other, spacing, radius, primaryColor, fontSizes } = theme;

	const { fontWeights, widths } = other;

	const pColor = colors[primaryColor][0];

	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		statCard: {
			border: `${widths.px} ${colors.gray[1]} solid`,
			width: '100%',
			borderRadius: defaultRadius,
			textAlign: 'center',
			display: 'flex',
			justifyContent: 'space-between',
			padding: spacing.xs,
		},
		statCardDescription: {
			'&	.mantine-Tooltip-tooltip': {
				color: colors.white,
				background: colors.black[0],
			},
			textAlign: 'right',
		},
		statCardDescriptionIcon: {
			color: colors.gray[6],
		},
		statCardIcon: {
			backgroundColor: '#e7eeff',
			color: pColor,
		},
		statCardText: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-around',
			alignItems: 'center',
		},
		statCardTitleValue: {
			fontSize: '25px',
			fontWeight: fontWeights.bold,
			color: pColor,
		},
		statCardTitle: {
			fontSize: fontSizes.md,
			fontWeight: fontWeights.semibold,
			color: colors.gray[6],
		},
	};
});

export const useAlertsStyles = createStyles((theme) => {
	const { colors, other, spacing, fontSizes, radius } = theme;

	const { fontWeights, widths, sizing } = other;
	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			flex: ' 1 1 auto',
			overflowY: 'auto',
			borderRadius: defaultRadius,
			margin: spacing.md,
			border: `${widths.px} ${colors.gray[1]} solid`,
		},
		headContainer: {
			padding: spacing.md,
			width: '100%',
			height: '55px',
			top: 0,
			position: 'sticky',
			backgroundColor: colors.white,
			zIndex: 1,
			borderBottom: `${widths.px} ${colors.gray[1]} solid`,
		},
		alertsText: {
			fontSize: fontSizes.md,
			fontWeight: fontWeights.semibold,
			color: colors.gray[6],
		},
		alertsContainer: {
			overflow: 'auto',
			color: colors.gray[6],
		},
		alertContainer: {
			borderBottom: `${widths.px} ${colors.gray[1]} solid`,
			padding: `${spacing.xs} ${spacing.lg}`,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		expandButton: {
			background: colors.white[0],
			padding: 0,
			marginRight: spacing.xs,
			width: '36px',
			color: theme.colors.gray[6],
			border: `${sizing.px} ${colors.gray[2]} solid`,
			'&:hover': {
				background: colors.gray[1],
			},
		},
	};
});

export const useRetentionStyles = createStyles((theme) => {
	const { colors, other, spacing, fontSizes, radius } = theme;

	const { fontWeights, widths } = other;
	const defaultRadius = radius[theme.defaultRadius as string];
	return {
		container: {
			flex: '0 0 auto',
			borderRadius: defaultRadius,
			margin: spacing.md,
			border: `${widths.px} ${colors.gray[1]} solid`,
		},
		headContainer: {
			height: '55px',
			display: 'flex',
			alignItems: 'center',
			padding: spacing.md,
			justifyContent: 'space-between',
		},
		IconStyle: {
			backgroundColor: '#e7eeff',
			color: colors.brandPrimary[0],
		},
		contentContainer: {
			display: 'flex',
			alignItems: 'center',
			borderTop: `${widths.px} ${colors.gray[1]} solid`,
		},
		iconBox: {
			padding: spacing.md,
			borderRight: `${widths.px} ${colors.gray[1]} solid`,
		},
		heading: {
			fontSize: fontSizes.md,
			fontWeight: fontWeights.semibold,
			color: colors.gray[6],
		},
		updateBtn: {
			background: colors.brandPrimary[0],
			color: colors.white,
		},
		modalStyle: {
			'& .mantine-Paper-root ': {
				overflowY: 'inherit',
			},
			'& .mantine-Modal-header	': {
				borderRadius: '8px 8px 0px 0px',
				backgroundColor: colors.gray[1],
			},
			'& .mantine-Modal-title	': {
				fontWeight: 'bold',
			},
			'& .mantine-Modal-body ': {
				paddingTop: '1rem !important',
			},
		},
	};
});
