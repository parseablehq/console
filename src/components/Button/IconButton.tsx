import { Button, Tooltip } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import classes from './Button.module.css'
import React from 'react';

type IconButtonProps = {
	onClick?: () => void;
	renderIcon: () => ReactNode;
	icon?: ReactNode;
	active?: boolean;
	tooltipLabel?: string;
}

const IconButton: FC<IconButtonProps> = (props) => {
	const { renderIcon, tooltipLabel } = props;
	const Wrapper = tooltipLabel ? Tooltip : React.Fragment
	return (
		<Wrapper label={tooltipLabel}>
			<Button
				className={`${classes.iconBtn} ${props.active && classes.iconBtnActive}`}
				onClick={props.onClick && props.onClick}>
				{renderIcon()}
			</Button>
		</Wrapper>
	);
};

export default IconButton;
