import { Button, ButtonProps } from '@mantine/core';
import { FC, ReactNode } from 'react';
import { useButtonStyles } from './styles';

type ToggleButtonProps = ButtonProps & {
	onClick: () => void;
	toggled: boolean;
	renderIcon?: () => ReactNode;
	label?: string;
};

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
	const { onClick, toggled, label = '', renderIcon } = props;
	const { classes, cx } = useButtonStyles();
	const { toggleBtn, toggleBtnActive } = classes;

	return (
		<Button
			className={cx([toggleBtn, ...(toggled ? [toggleBtnActive] : [])])}
			onClick={onClick}
			{...(renderIcon && { leftIcon: renderIcon() })}>
			{label}
		</Button>
	);
};
