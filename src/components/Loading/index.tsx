import type { LoaderProps, LoadingOverlayProps } from '@mantine/core';
import { LoadingOverlay, useMantineTheme } from '@mantine/core';
import type { FC } from 'react';

interface LoadingProps {
	variant?: LoaderProps['variant'];
	position?: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky';
}

const Loading: FC<LoadingProps & LoadingOverlayProps> = (props) => {
	const { visible, variant, position, ...restProps } = props;
	const { colors, primaryColor, defaultRadius, radius, spacing } = useMantineTheme();

	return (
		<LoadingOverlay
			style={{
				position,
				height: '100%',
				borderRadius: radius[defaultRadius as string],
				padding: spacing.lg,
			}}
			loaderProps={{
				size: 'md',
				color: colors[primaryColor][1],
				variant,
			}}
			overlayOpacity={0.6}
			overlayColor="#fff"
			visible={visible}
			{...restProps}
		/>
	);
};

Loading.defaultProps = {
	variant: 'bars',
	position: 'relative',
};

export default Loading;
