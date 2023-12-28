import { Box, Button, Checkbox, Input, Popover, ScrollArea } from '@mantine/core';
import { FC } from 'react';
import classes from './SearchSection.module.css';
import useMountedState from '@/hooks/useMountedState';
import { Field } from 'react-querybuilder';

const SearchSection: FC = () => {
	const [selectedFields, setSelectedFields] = useMountedState<Field[]>([]);
	const [checkBoxFields] = useMountedState<Field[]>([]);


	return (
		<Box className={classes.header}>
			<SearchBar />
			<Box className={classes.header}>
				<TableManagement
					selectedFields={selectedFields}
					setSelectedFields={setSelectedFields}
					fields={checkBoxFields}
				/>
				<SaveSearch />
			</Box>
		</Box>
	);
};

const SearchBar: FC = () => {
	return (
		<Box>
			<Input placeholder="Search" />
		</Box>
	);
};

type TableManagementProps = {
	selectedFields: Field[];
	setSelectedFields: (fields: Field[]) => void;
	fields: Field[];
};

const TableManagement = ({ selectedFields, setSelectedFields, fields }: TableManagementProps) => {
	const [opened, setOpened] = useMountedState(false);
	return (
		<Popover opened={opened} onChange={setOpened}>
			<Popover.Target>
				<Button variant="default" radius={'md'} onClick={() => setOpened((o) => !o)}>
					Table Management
				</Button>
			</Popover.Target>

			<Popover.Dropdown>
				<FieldSelection selectedFields={selectedFields} setSelectedFields={setSelectedFields} fields={fields} />
			</Popover.Dropdown>
		</Popover>
	);
};
const FieldSelection = ({ selectedFields, setSelectedFields, fields }: TableManagementProps) => {
	return (
		<ScrollArea mah={'400px'}>
			{fields.map((field) => (
				<Checkbox
					mb={'md'}
					key={field.name}
					label={field.name}
					checked={selectedFields.includes(field)}
					onChange={(e) => {
						if (e.target.checked) {
							setSelectedFields([...selectedFields, field]);
						} else {
							setSelectedFields(selectedFields.filter((ele) => ele !== field));
						}
					}}
				/>
			))}
		</ScrollArea>
	);
};

const SaveSearch: FC = () => {
	return (
		<Box>
			<Button variant="default" radius={'md'} onClick={() => {}}>
				Save Search
			</Button>
		</Box>
	);
};

export default SearchSection;
