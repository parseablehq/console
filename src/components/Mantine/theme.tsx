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
		'Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
	colors: {
		black: ['#000000'],
		white: ['#FFFFFF'],
		brandPrimary: ['#4192DF', '#1F288E', '#1A237E', '#10143E'],
		brandSecondary: ['#F6BA74', '#F29C38', '#C27D2D'],
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
							background: colors.brandSecondary[1],

							':hover': {
								background: colors.brandSecondary[1],
							},
						},
					},
				};
			},
		},
		Checkbox: {
			styles: ({ colors }) => {
				const pColor = colors.brandSecondary[1];

				return {
					labelWrapper: {
						width: '100%',
					},
					label: {
						cursor: 'pointer',
					},
					input: {
						cursor: 'pointer',
						':hover': {
							borderColor: pColor,
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
						backgroundColor: colors.brandPrimary[2],
					},
				},

				corner: {
					opacity: 1,
					background: colors.gray[0],
				},
			}),
		},
		Table: {
			styles: ({ spacing, radius, defaultRadius: _defaultRadius, colors, fontSizes, other: { fontWeights } }) => {
				const defaultRadius = radius[_defaultRadius as string];

				return {
					root: {
						borderRadius: defaultRadius,
						background: colors.white,
						borderCollapse: 'separate',
						borderSpacing: 0,
						padding: `${spacing.md} ${spacing.sm}`,
						height: 20,

						'& tr th': {
							background: colors.gray[2],
							borderBottom: 'none !important',
							padding: '0 !important',
							overflow: 'hidden',
							whiteSpace: 'nowrap',
						},

						'& tr th span': {
							display: 'inline-block',
							fontSize: fontSizes.sm,
							fontWeight: fontWeights.semibold,
							padding: spacing.sm,
							textAlign: 'left',
							width: '100%',
						},

						'& tr th:first-of-type': {
							borderTopLeftRadius: defaultRadius,
							borderBottomLeftRadius: defaultRadius,
						},

						'& tr th:last-of-type': {
							borderTopRightRadius: defaultRadius,
							borderBottomRightRadius: defaultRadius,
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
						'&[data-selected]': {
							background: colors.brandSecondary[1],
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
								background: colors.brandSecondary[1],
								color: colors.white[0],
							},
						},
					},
				};
			},
		},
	},
};
