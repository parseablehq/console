import { Button, ButtonProps } from '@mantine/core';
import { FC, ReactNode } from 'react';
import classes from './Button.module.css'

type ToggleButtonProps = ButtonProps & {
	onClick: () => void;
	toggled: boolean;
	renderIcon?: () => ReactNode;
	label?: string;
};

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
	const { onClick, toggled, label = '', renderIcon } = props;
	const { toggleBtn, toggleBtnActive } = classes;

	return (
		<Button
			className={[toggleBtn, ...(toggled ? [toggleBtnActive] : [])].join(" ")}
			onClick={onClick}
			{...(renderIcon && { leftSection: renderIcon() })}>
			{label}
		</Button>
	);
};
