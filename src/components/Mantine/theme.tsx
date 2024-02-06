import { createTheme } from '@mantine/core';

export const theme = createTheme({

	colors: {
		brandPrimary: [
			'#ececff',
			'#d4d6ff',
			'#a5aaf7',
			'#747af0',
			'#4b52ea',
			'#3039e7',
			'#212ce6',
			'#131fcd',
			'#0a1ab8',
			'#0016a3',
		],
		brandSecondary: [
			'#ffe7ee',
			'#ffceda',
			'#ff9cb1',
			'#fe6685',
			'#fc3960',
			'#fb1c49',
			'#fc073c',
			'#e1002f',
			'#c90029',
			'#b10021',
		],
		red: ['#ffe9e9', '#ffd1d1', '#fba0a1', '#f76d6d', '#f34141', '#f22625', '#f21616', '#d8070b', '#c10008', '#a90003'],
		green: [
			'#e5feee',
			'#d2f9e0',
			'#a8f1c0',
			'#7aea9f',
			'#53e383',
			'#3bdf70',
			'#2bdd66',
			'#1ac455',
			'#0caf49',
			'#00963c',
		],
		dimmed: [
			'#ecf6ff',
			'#e3e7ee',
			'#c8cdd4',
			'#abb2b8',
			'#939aa1',
			'#838b94',
			'#7a848e',
			'#67717c',
			'#5a6671',
			'#495866',
		],
		
	},
	spacing: {
		xxs: '0.2rem',
	},
	primaryColor: 'brandPrimary',
	primaryShade: 4,
	fontFamily:
		'Inter ,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
});

// const globalStyles = (): CSSObject => {
// 	return {
// 		'#root': {
// 			overflow: 'auto',
// 			display: 'block',
// 			width: widths.screen,
// 			height: heights.screen,
// 		},
// 	};
// };

// export const theme: MantineThemeOverride = {
// 	globalStyles,
// 	fontFamily:
// 		'Inter ,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
// 	colors: {
// 		black: ['#000000'],
// 		white: ['#FFFFFF'],
// 		brandPrimary: ['#545BEB', '#1F288E', '#1A237E', '#10143E'],
// 		brandSecondary: ['#FC466B', '#F29C38', '#C27D2D'],
// 		gray: ['#F1F1F1', '#E0E0E0', '#D4D4D4', '#828282', '#4F4F4F', '#777777', '#211F1F'],
// 		error: ['#8F0F27'],
// 		dimmed: ['#868e96'],
// 	},
// 	primaryColor: 'brandPrimary',
// 	spacing: {
// 		xxs: '0.2rem',
// 	},
// 	other: {
// 		sizing,
// 		heights,
// 		widths,
// 		fontWeights: {
// 			thin: 100,
// 			extraLight: 200,
// 			light: 300,
// 			normal: 400,
// 			medium: 500,
// 			semibold: 600,
// 			bold: 700,
// 			extrabold: 800,
// 			black: 900,
// 		},
// 	},
// 	defaultRadius: 'md',
// 	components: {
// 		Pagination: {
// 			styles: ({ colors, fontSizes }) => {
// 				return {
// 					control: {
// 						border: `solid 1px ${colors.gray[2]}`,
// 						fontSize: fontSizes.sm,

// 						'&[data-active=true]': {
// 							background: colors.brandPrimary[0],

// 							':hover': {
// 								backgroundColor: colors.brandSecondary[0],
// 								color: colors.white[0],
// 							},
// 						},
// 					},
// 				};
// 			},
// 		},
// 		Checkbox: {
// 			styles: ({ colors }) => {
// 				const pColor = colors.brandPrimary[0];
// 				const sColor = colors.brandSecondary[0];

// 				return {
// 					labelWrapper: {
// 						width: '100%',
// 					},
// 					label: {
// 						cursor: 'pointer',
// 						':hover': {
// 							color: sColor,
// 						},
// 					},
// 					input: {
// 						cursor: 'pointer',
// 						':hover': {
// 							borderColor: sColor,
// 						},

// 						'&:checked': {
// 							backgroundColor: pColor,
// 							borderColor: pColor,
// 						},
// 					},
// 				};
// 			},
// 		},
// 		ScrollArea: {
// 			styles: ({ colors }) => ({
// 				scrollbar: {
// 					[`&[data-orientation="vertical"] .mantine-ScrollArea-thumb,
// 					&[data-orientation="horizontal"] .mantine-ScrollArea-thumb`]: {
// 						backgroundColor: colors.brandPrimary[0],
// 					},
// 				},

// 				corner: {
// 					opacity: 1,
// 					background: colors.gray[0],
// 				},
// 			}),
// 		},
// 		Table: {
// 			styles: ({ defaultRadius: _defaultRadius, colors }) => {
// 				return {
// 					root: {
// 						background: colors.white,
// 						borderCollapse: 'separate',
// 						borderSpacing: 0,
// 						padding: 0,
// 						height: 20,
// 						'& tr th': {
// 							background: theme.colors?.white,
// 							border: 'none !important',
// 							overflow: 'hidden',
// 							whiteSpace: 'nowrap',
// 							textAlign: 'left',
// 							padding: 0,
// 						},
// 					},
// 				};
// 			},
// 		},
// 		Drawer: {
// 			defaultProps: ({ colors }) => {
// 				return {
// 					withinPortal: true,
// 					overlayProps: {
// 						color: colors.gray[3],
// 						opacity: 0.55,
// 						blur: 3,
// 					},
// 				};
// 			},
// 		},
// 		Modal: {
// 			defaultProps: ({ colors }) => ({
// 				withinPortal: true,
// 				overlayProps: {
// 					color: colors.gray[3],
// 					opacity: 0.55,
// 					blur: 3,
// 				},
// 			}),
// 		},
// 		Highlight: {
// 			defaultProps: ({ colors, other }) => ({
// 				highlightStyles: {
// 					color: colors.dark,
// 					background: colors.yellow[3],
// 					fontWeight: other.fontWeights.bold,
// 				},
// 			}),
// 		},
// 		DateTimePicker: {
// 			styles: ({ colors }) => {
// 				return {
// 					day: {
// 						'&:hover': {
// 							color: colors.brandSecondary[0],
// 						},
// 						'&[data-selected]': {
// 							background: colors.brandPrimary[0],
// 							'&:hover': {
// 								color: colors.white[0],
// 								background: colors.brandSecondary[0],
// 							},
// 						},
// 					},
// 				};
// 			},
// 		},
// 		Select: {
// 			styles: ({ colors }) => {
// 				return {
// 					rightSection: {
// 						'& svg': {
// 							stroke: colors.gray[2],
// 						},
// 					},
// 					input: {
// 						border: `${sizing.px} ${colors.gray[2]} solid`,
// 						borderRadius: 'md',
// 					},
// 					item: {
// 						'&[data-selected]': {
// 							background: colors.brandPrimary[0],

// 							' &:hover': {
// 								background: colors.brandSecondary[0],
// 								color: colors.white[0],
// 							},
// 						},
// 						'&:hover': { color: colors.brandSecondary[0] },
// 					},
// 				};
// 			},
// 		},
// 		TextInput: {
// 			styles: ({ colors }) => {
// 				return {
// 					input: {
// 						border: `${sizing.px} ${colors.gray[2]} solid`,
// 						borderRadius: 'md',
// 					},
// 				};
// 			},
// 		},
// 		Tooltip: {
// 			styles: ({ colors }) => {
// 				return {
// 					tooltip: {
// 						background: colors.brandPrimary[0],
// 						color: colors.white[0],
// 					},
// 				};
// 			}
// 		},

// 		PasswordInput: {
// 			styles: ({ colors }) => {
// 				return {
// 					input: {
// 						border: `${sizing.px} ${colors.gray[2]} solid`,
// 						borderRadius: 'md',

// 					},
// 				};
// 			}
// 		}
// 	},
// };
