import { MantineProvider, Loader } from '@mantine/core';
import ParseableAnimate from './ParseableAnimate';

function ParseableLoader() {
	return (
		<MantineProvider
			theme={{
				components: {
					Loader: Loader.extend({
						defaultProps: {
							loaders: { ...Loader.defaultLoaders, ring: ParseableAnimate },
							type: 'ring',
						},
					}),
				},
			}}>
			<Loader />
		</MantineProvider>
	);
}

export default ParseableLoader;