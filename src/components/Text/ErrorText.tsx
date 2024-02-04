import type { TextProps } from '@mantine/core';
import { Text } from '@mantine/core';
import type { FC } from 'react';

const ErrorText: FC<TextProps> = (props) => {
	return (
		<Text
			{...props}
			style={({ colors }) => ({
				color: colors.error[0],
			})}
		/>
	);
};

export default ErrorText;
