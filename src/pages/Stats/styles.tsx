import {  NAVBAR_WIDTH } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useStatsStyles = createStyles((theme) => {
	const { widths } = theme.other;
	return {
		container: {
			flex: 1,
			width: `calc(${widths.full} - ${NAVBAR_WIDTH}px)`,
			// display: 'flex',
			position: 'relative',
		},
	};
});

export const useStatusStyles = createStyles((theme) => {
	const { colors, other, spacing,fontSizes } = theme;

	const { fontWeights, widths } = other;

	return {
		container: {
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
		statusTextFailed:{
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
		StatsContainer: {
			display: 'flex',
			flexDirection: 'row',
			padding: spacing.md,
			paddingBottom: 0,
			justifyContent: 'space-between',
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
			width: '18%',
			borderRadius: defaultRadius,
			textAlign: 'center',
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
			margin: `${spacing.xs} ${spacing.xs} 0 0`,
		},
		statCardIcon: {
			backgroundColor: '#e7eeff',
			color: pColor,
			marginTop: '-25px',
		},
		statCardTitleValue: {
			fontSize: '30px',
			fontWeight: fontWeights.bold,
			color: pColor,
		},
		statCardTitle: {
			fontSize: fontSizes.lg,
			fontWeight: fontWeights.semibold,
			color: colors.gray[6],
			paddingBottom: spacing.md,
		},
	};
});

export const useAlertsStyles = createStyles((theme) => {
	const { colors, other, spacing, fontSizes,radius } = theme;

	const { fontWeights, widths ,sizing} = other;
	const defaultRadius = radius[theme.defaultRadius as string];


	return {
		container: {
			overflow: 'auto',
			borderRadius: defaultRadius,
			margin: spacing.md,
			border: `${widths.px} ${colors.gray[1]} solid`,
		
		},
		headContainer: {
			padding: spacing.md,
			width: '100%',
			height: '55px',
			top: 0,
			position: "sticky",
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