import type { CSSObject, MantineThemeOverride } from '@mantine/core';
import { heights, widths, sizing } from './sizing';

const globalStyles = (): CSSObject => {
	return {
		'#root': {
			overflow: 'auto',
			display: 'block',
			width: widths.screen,
			height: heights.screen,
		},
	};
};

export const theme: MantineThemeOverride = {
	globalStyles,
	fontFamily:
		'Inter ,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
	colors: {
		black: ['#000000'],
		white: ['#FFFFFF'],
		brandPrimary: ['#545BEB', '#1F288E', '#1A237E', '#10143E'],
		brandSecondary: ['#FC466B', '#F29C38', '#C27D2D'],
		gray: ['#F1F1F1', '#E0E0E0', '#D4D4D4', '#828282', '#4F4F4F', '#777777' , '#211F1F'],
		error: ['#8F0F27'],
		dimmed: ['#868e96'],
	},
	primaryColor: 'brandPrimary',
	spacing: {
		xxs: '0.2rem',
	},
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
	defaultRadius: 'md',
	components: {
		Pagination: {
			styles: ({ colors }) => {
				return {
					control: {
						'&[data-active=true]': {
							background: colors.brandPrimary[0],

							':hover': {
								color: colors.brandSecondary[0],
							},
						},
					},
				};
			},
		},
		Checkbox: {
			styles: ({ colors }) => {
				const pColor = colors.brandPrimary[0];
				const sColor = colors.brandSecondary[0];

				return {
					labelWrapper: {
						width: '100%',
					},
					label: {
						cursor: 'pointer',
						':hover': {
							color: sColor,
						},
					},
					input: {
						cursor: 'pointer',
						':hover': {
							borderColor: sColor,
						},

						'&:checked': {
							backgroundColor: pColor,
							borderColor: pColor,
						},
					},
				};
			},
		},
		ScrollArea: {
			styles: ({ colors }) => ({
				scrollbar: {
					[`&[data-orientation="vertical"] .mantine-ScrollArea-thumb, 
					&[data-orientation="horizontal"] .mantine-ScrollArea-thumb`]: {
						backgroundColor: colors.brandPrimary[0],
					},
				},

				corner: {
					opacity: 1,
					background: colors.gray[0],
				},
			}),
		},
		Table: {
			styles: ({ defaultRadius: _defaultRadius, colors, fontSizes, other: { fontWeights } }) => {

				return {
					root: {
						background: colors.white,
						borderCollapse: 'separate',
						borderSpacing: 0,
						padding:0,
						height: 20,	
						'& tr th': {
							background: theme.colors?.white,
							border:"none !important",
							overflow: 'hidden',
							whiteSpace: 'nowrap',
							textAlign: 'left',
							padding: 0,
						
						},

						'& tr th .label': {
							display: 'flex',
							alignItems: 'center',
							fontSize: fontSizes.md,
							fontWeight: fontWeights.semibold,
							height: '100%',
							textAlign: 'left',
						},

					},
				};
			},
		},
		Drawer: {
			defaultProps: ({ colors }) => {
				return {
					withinPortal: true,
					overlayProps: {
						color: colors.gray[3],
						opacity: 0.55,
						blur: 3,
					},
				};
			},
		},
		Modal: {
			defaultProps: ({ colors }) => ({
				withinPortal: true,
				overlayProps: {
					color: colors.gray[3],
					opacity: 0.55,
					blur: 3,
				},
			}),
		},
		Highlight: {
			defaultProps: ({ colors, other }) => ({
				highlightStyles: {
					color: colors.dark,
					background: colors.yellow[3],
					fontWeight: other.fontWeights.bold,
				},
			}),
		},
		DateTimePicker: {
			styles: ({ colors }) => {
				return {
					day: {
						'&:hover': {
							color: colors.brandSecondary[0],
						},
						'&[data-selected]': {
							background: colors.brandPrimary[0],
							'&:hover': {
								color: colors.white[0],
								background: colors.brandSecondary[0],
							},
						},
					},
				};
			},
		},
		Select: {
			styles: ({ colors }) => {
				return {
					item: {
						'&[data-selected]': {
							'&, &:hover': {
								background: colors.brandSecondary[0],
								color: colors.white[0],
							},
						},
					},
				};
			},
		},
	},
};
