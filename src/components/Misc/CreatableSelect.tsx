import { useEffect, useState } from 'react';
import { Combobox, InputBase, useCombobox } from '@mantine/core';

type Props = {
	data: string[];
	setData: React.Dispatch<React.SetStateAction<string[]>>;
	value: string;
	setValue: (val: string) => void;
	placeholder: string;
	error: string;
};

export function CreatableSelect(props: Props) {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const { data, setData, value, setValue } = props;
	const [search, setSearch] = useState('');

	const exactOptionMatch = data.some((item) => item === search);
	const filteredOptions = exactOptionMatch
		? data
		: data.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()));
    const canAddValueAsOption = !exactOptionMatch && search.trim().length > 0 
	
	const handleEnterKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && canAddValueAsOption) {
			setData((prev) => [...prev, search])
			setValue(search);
			combobox.closeDropdown();
		}
	};

	useEffect(() => {
		setSearch(value || '');
	}, [value]);

	useEffect(() => {
		if (combobox.dropdownOpened) {
			setSearch('');
		}
	}, [combobox.dropdownOpened]);

	useEffect(() => {
		if (combobox.dropdownOpened) {
			window.addEventListener('keydown', handleEnterKeyPress);
		}
		return () => {
			window.removeEventListener('keydown', handleEnterKeyPress);
		};
	}, [canAddValueAsOption, search]);
	
	const options = filteredOptions.map((item) => (
		<Combobox.Option value={item} key={item}>
			{item}
		</Combobox.Option>
	));

	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			onOptionSubmit={(val) => {
				if (val === '$create') {
					setData((current: string[]) => [...current, search]);
					setValue(search);
				} else {
					setValue(val);
					setSearch(val);
				}

				combobox.closeDropdown();
			}}>
			<Combobox.Target>
				<InputBase
					rightSection={<Combobox.Chevron />}
					value={search}
					onChange={(event) => {
						combobox.openDropdown();
						combobox.updateSelectedOptionIndex();
						setSearch(event.currentTarget.value);
					}}
					onClick={() => combobox.openDropdown()}
					onFocus={() => combobox.openDropdown()}
					onBlur={() => {
						combobox.closeDropdown();
						setSearch(value || '');
					}}
					placeholder={props.placeholder || 'Search or Type'}
					rightSectionPointerEvents="none"
					error={props.error}
				/>
			</Combobox.Target>
			<Combobox.Dropdown>
				<Combobox.Options>
					{options}
					{ canAddValueAsOption ? (
						<Combobox.Option value="$create">+ Create {search}</Combobox.Option>
					) : (
						<Combobox.Option disabled value="$create">
							+ Type to add more
						</Combobox.Option>
					)}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
}
