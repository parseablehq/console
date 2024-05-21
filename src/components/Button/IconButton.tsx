import { Button, Tooltip } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import classes from './Button.module.css';
import React from 'react';

type IconButtonProps = {
	onClick?: () => void;
	renderIcon: () => ReactNode;
	icon?: ReactNode;
	active?: boolean;
	tooltipLabel?: string;
};

const IconButton: FC<IconButtonProps> = (props) => {
	const { renderIcon, tooltipLabel } = props;
	if (tooltipLabel) {
		return (
			<Tooltip label={tooltipLabel}>
				<Button
					className={`${classes.iconBtn} ${props.active && classes.iconBtnActive}`}
					onClick={props.onClick && props.onClick}>
					{renderIcon()}
				</Button>
			</Tooltip>
		);
	} else {
		return (
			<React.Fragment>
				<Button
					className={`${classes.iconBtn} ${props.active && classes.iconBtnActive}`}
					onClick={props.onClick && props.onClick}>
					{renderIcon()}
				</Button>
			</React.Fragment>
		);
	}
};

export default IconButton;
