import type { Tuple, DefaultMantineColor } from '@mantine/core';
import type { widths, heights, sizing } from '../components/Mantine/sizing';

export const CustomColorsName = ['black', 'white', 'brandPrimary', 'brandSecondary', 'error', 'dimmed'] as const;

const CustomFontWeights = [
	'thin',
	'extraLight',
	'light',
	'normal',
	'medium',
	'semibold',
	'bold',
	'extrabold',
	'black',
] as const;

type CustomFontWeights = (typeof CustomFontWeights)[number];

type CustomColorsName = (typeof CustomColorsName)[number];

type ExtendedCustomColors = CustomColorsName | DefaultMantineColor;

declare module '@mantine/core' {
	export interface MantineThemeColorsOverride {
		colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
	}

	export interface MantineThemeOther {
		sizing: typeof sizing;
		heights: typeof heights;
		widths: typeof widths;
		fontWeights: Record<CustomFontWeights, number>;
	}
}
