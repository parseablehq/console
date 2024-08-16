import { Button, ButtonProps, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { FC } from 'react';
import classes from './Button.module.css';

type RetryProps = ButtonProps & {
	onClick: () => void;
};

export const RetryBtn: FC<RetryProps> = (props) => {
	const { className, ...restProps } = props;

	const { retryBtn } = classes;

	return (
		<Button
			className={[className, retryBtn].join(' ')}
			rightSection={<IconReload size={px('0.8rem')} />}
			{...restProps}>
			Reload
		</Button>
	);
};
