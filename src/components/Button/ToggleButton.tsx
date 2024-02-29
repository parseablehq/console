import { Button, ButtonProps } from '@mantine/core';
import { FC, ReactNode } from 'react';
import classes from './Button.module.css'

type ToggleButtonProps = ButtonProps & {
	onClick: () => void;
	toggled: boolean;
	renderIcon?: () => ReactNode;
	label?: string;
	iconPosition?: 'left' | 'right';
	customClassName?: string | null; 
};

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
	const { onClick, toggled, label = '', renderIcon, customClassName = '' } = props;
	const { toggleBtn, toggleBtnActive } = classes;
	const iconPosition = props.iconPosition === 'right' ? 'rightSection' : 'leftSection'
	return (
		<Button
			className={[customClassName, toggleBtn, ...(toggled ? [toggleBtnActive] : [])].join(" ")}
			onClick={onClick}
			{...(renderIcon && { [iconPosition]: renderIcon() })}>
			{label}
		</Button>
	);
};
