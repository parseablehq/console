import { type FC } from 'react';
import { Select } from '@mantine/core';

type DropdownProps = {
	data: string[];
	onChange: (value: string) => void;
};

const Dropdown: FC<DropdownProps> = (props) => {
	const { data, onChange } = props;

	return <Select placeholder="Column" data={data} w={140} searchable onChange={onChange} allowDeselect={false} />;
};

export default Dropdown;
