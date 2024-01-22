import { type FC } from 'react';
import { Select } from '@mantine/core';
import { useLogQueryStyles } from './styles';

type DropdownProps = {
	data: string[];
	placeholder?: string;
	searchable?: boolean;
	value?: string | null;
	onChange: (value: string) => void;
};

const Dropdown: FC<DropdownProps> = (props) => {
	const { data, onChange, placeholder = "Export", searchable = false, value = null } = props;
	const { classes } = useLogQueryStyles();

	return (
		<Select
			className={classes.dropdownBtn}
			placeholder={placeholder}
			data={data}
			w={140}
			searchable={searchable}
			onChange={onChange}
			allowDeselect={false}
			value={value}
		/>
	);
};

export default Dropdown;
