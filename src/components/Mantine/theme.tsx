import type { CSSObject, MantineThemeOverride } from '@mantine/core';
import { heights, widths, sizing } from './sizing';

const globalStyles = (): CSSObject => {
	return {
		'#root': {
			overflow: 'auto',
			display: 'block',
			width: widths.full,
			height: heights.screen,
		},
	};
};

export const theme: MantineThemeOverride = {
	globalStyles,
	fontFamily:
		'Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
	colors: {
		white: ['#FFFFFF'],
		brandPrimary: ['#4192DF', '#1F288E', '#1A237E', '#10143E'],
		brandSecondary: ['#F6BA74', '#F29C38', '#C27D2D'],
		error: ['#8F0F27'],
	},
	primaryColor: 'brandPrimary',
	other: {
		sizing,
		heights,
		widths,
		fontWeights: {
			thin: 100,
			extraLight: 200,
			light: 300,
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
			extrabold: 800,
			black: 900,
		},
	},
};
