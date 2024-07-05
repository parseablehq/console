import { MantineProvider, Loader } from '@mantine/core';
import ParseableAnimate from './ParseableAnimate';

// This is a custom Parseable Icon with loading animation
function ParseableLoader() {
	return (
		<MantineProvider
			theme={{
				components: {
					Loader: Loader.extend({
						defaultProps: {
							loaders: { ...Loader.defaultLoaders, parseable: ParseableAnimate },
							type: 'parseable',
						},
					}),
				},
			}}>
			<Loader />
		</MantineProvider>
	);
}

export default ParseableLoader;
