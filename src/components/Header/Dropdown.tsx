import { type FC } from 'react';
import { Select } from '@mantine/core';

type DropdownProps = {
	data: string[];
	placeholder?: string;
	searchable?: boolean;
	value?: string | null;
	onChange: (value: string) => void;
};

const Dropdown: FC<DropdownProps> = (props) => {
	const { data, onChange, placeholder = "Export", searchable = false, value = null } = props;

	return (
		<Select
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
