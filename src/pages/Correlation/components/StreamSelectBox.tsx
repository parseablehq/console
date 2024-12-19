import { Select, Text } from '@mantine/core';
import classes from '../styles/Correlation.module.css';

type StreamSelectBoxProps = {
	label: string;
	placeholder: string;
	disabled: boolean;
	onChange: (value: string | null) => void;
	data: { value: string; label: string }[];
	isFirst: boolean;
};

export const StreamSelectBox: React.FC<StreamSelectBoxProps> = ({
	label,
	placeholder,
	disabled,
	onChange,
	data,
	isFirst,
}) => {
	return (
		<div className={classes.noStreamsWrapper} style={{ border: isFirst ? '1px dashed #9F1239' : '1px dashed #7E22CE' }}>
			<Select
				searchable
				classNames={{
					input: disabled ? classes.streamInput_disabled : classes.streamInput,
					description: classes.streamSelectDescription,
				}}
				onChange={onChange}
				placeholder={placeholder}
				style={{ width: '100%', padding: '10px' }}
				data={data}
				disabled={disabled}
			/>
			<div>
				<Text fw={500} c={disabled ? '#CBCBCB' : '#000'}>
					{disabled ? 'Select Stream 1 first' : label}
				</Text>
			</div>
		</div>
	);
};
