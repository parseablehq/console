import { Tooltip, ActionIcon } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import classes from './Button.module.css';

type IconButtonProps = {
	onClick?: () => void;
	renderIcon: () => ReactNode;
	data_id?: string;
	icon?: ReactNode;
	active?: boolean;
	tooltipLabel?: string;
	size?: string | number;
};

const IconButton: FC<IconButtonProps> = (props) => {
	const { renderIcon, tooltipLabel } = props;
	if (tooltipLabel) {
		return (
			<Tooltip label={tooltipLabel}>
				<ActionIcon
					itemID={props.data_id}
					size={props.size ? props.size : 'xl'}
					className={`${classes.iconBtn} ${props.active && classes.iconBtnActive}`}
					onClick={props.onClick && props.onClick}>
					{renderIcon()}
				</ActionIcon>
			</Tooltip>
		);
	} else {
		return (
			<ActionIcon
				itemID={props.data_id}
				size={props.size ? props.size : 'xl'}
				className={`${classes.iconBtn} ${props.active && classes.iconBtnActive}`}
				onClick={props.onClick && props.onClick}>
				{renderIcon()}
			</ActionIcon>
		);
	}
};

export default IconButton;
