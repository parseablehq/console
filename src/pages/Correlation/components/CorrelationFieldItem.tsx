import {
	IconChartCircles,
	IconClockHour5,
	IconLetterASmall,
	IconLetterLSmall,
	IconNumber123,
	IconX,
} from '@tabler/icons-react';
import { Text, Tooltip } from '@mantine/core';
import classes from '../styles/Correlation.module.css';
import { useRef, useState, useEffect } from 'react';

const dataTypeIcons = (iconColor: string): Record<string, JSX.Element> => ({
	text: <IconLetterASmall size={16} style={{ color: iconColor }} />,
	timestamp: <IconClockHour5 size={16} style={{ color: iconColor }} />,
	number: <IconNumber123 size={16} style={{ color: iconColor }} />,
	boolean: <IconChartCircles size={16} style={{ color: iconColor }} />,
	list: <IconLetterLSmall size={16} style={{ color: iconColor }} />,
});

interface CorrelationFieldItemProps {
	headerColor: string;
	fieldName: string;
	backgroundColor: string;
	iconColor: string;
	dataType?: string;
	isSelected?: boolean;
	onClick?: () => void;
	onDelete?: () => void;
}

export const CorrelationFieldItem = ({
	headerColor,
	fieldName,
	backgroundColor,
	iconColor,
	dataType,
	isSelected,
	onClick,
	onDelete,
}: CorrelationFieldItemProps) => {
	const textRef = useRef<HTMLDivElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);

	useEffect(() => {
		if (textRef.current) {
			setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
		}
	}, [fieldName]);

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
			{isOverflowing ? (
				<Tooltip label={fieldName} position="top">
					<Text size="sm" className={classes.fieldItemText} ref={textRef}>
						{fieldName}
					</Text>
				</Tooltip>
			) : (
				<Text size="sm" className={classes.fieldItemText} ref={textRef}>
					{fieldName}
				</Text>
			)}
			{!dataType && <IconX color={iconColor} size={12} onClick={onDelete} />}
			{dataType && dataTypeIcons(iconColor)[dataType]}
		</div>
	);
};
