import {
	IconChartCircles,
	IconClockHour5,
	IconLetterASmall,
	IconLetterLSmall,
	IconNumber123,
	IconX,
} from '@tabler/icons-react';
import { Text } from '@mantine/core';
import classes from '../styles/Correlation.module.css';

const dataTypeIcons = (iconColor: string): Record<string, JSX.Element> => ({
	text: <IconLetterASmall size={16} style={{ color: iconColor }} />,
	timestamp: <IconClockHour5 size={16} style={{ color: iconColor }} />,
	number: <IconNumber123 size={16} style={{ color: iconColor }} />,
	boolean: <IconChartCircles size={16} style={{ color: iconColor }} />,
	list: <IconLetterLSmall size={16} style={{ color: iconColor }} />,
});

export const CorrelationFieldItem = ({
	headerColor,
	fieldName,
	backgroundColor,
	iconColor,
	dataType,
	isSelected,
	onClick,
	onDelete,
}: {
	headerColor: string;
	fieldName: string;
	backgroundColor: string;
	iconColor: string;
	dataType?: string;
	isSelected?: boolean;
	onClick?: () => void;
	onDelete?: () => void;
}) => {
	return (
		<div
			style={{
				border: `1px solid ${headerColor}`,
				backgroundColor,
				color: headerColor,
				opacity: isSelected ? 0.5 : 1,
				...(dataType
					? { height: '24px', minHeight: '24px' }
					: { width: 'fit-content', borderRadius: '12px', height: '100%' }),
			}}
			className={classes.fieldItem}
			onClick={onClick}>
			<Text size="sm" className={classes.fieldItemText}>
				{fieldName}
			</Text>
			{!dataType && <IconX color={iconColor} size={12} onClick={onDelete} />}
			{dataType && dataTypeIcons(iconColor)[dataType]}
		</div>
	);
};
