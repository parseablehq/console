import { createTheme, rem, Loader } from '@mantine/core';
import ParseableAnimate from '@/assets/customLoader/ParseableAnimate';
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
	scale: 0.7,
	fontSizes: {
		xs: rem(12),
		sm: rem(16),
		md: rem(18),
		lg: rem(22),
		xl: rem(24),
	},
	fontFamily:
		'Inter ,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
	components: {
		Loader: Loader.extend({
			defaultProps: {
				loaders: { ...Loader.defaultLoaders, parseable: ParseableAnimate },
			},
		}),
	},
});
