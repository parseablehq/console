import { Button, ButtonProps, px } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { FC } from 'react';
import { useButtonStyles } from './styles';

type RetryProps = ButtonProps & {
	onClick: () => void;
};

export const RetryBtn: FC<RetryProps> = (props) => {
	const { className, ...restProps } = props;

	const { classes, cx } = useButtonStyles();
	const { retryBtn } = classes;

	return (
		<Button className={cx([retryBtn, className])} rightIcon={<IconReload size={px('0.8rem')} />} {...restProps}>
			Reload
		</Button>
	);
};
