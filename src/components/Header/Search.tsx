import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Box, TextInput, px } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useEffect } from 'react';
import classes from './styles/LogQuery.module.css'

const Search: FC = () => {
	const {
		state: { subLogSearch },
	} = useHeaderContext();

	const [searchValue, setSearchValue] = useMountedState('');

	useEffect(() => {
		const listener = subLogSearch.subscribe((interval) => {
			setSearchValue(interval.search);
		});
		return () => {
			listener();
		};
	}, []);

	const { searchContainer, searchInput } = classes;

	const onSearchValueChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchValue(event.currentTarget.value);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			if (subLogSearch.get().search !== searchValue) {
				const trimmedValue = event.currentTarget.value.trim();
				subLogSearch.set((query) => {
					query.search = trimmedValue;
				});
				setSearchValue(trimmedValue);
			}
		}
	};

	return (
		<Box className={searchContainer}>
			<TextInput
				className={searchInput}
				value={searchValue}
				onKeyDown={handleKeyDown}
				onChange={onSearchValueChange}
				placeholder="Search"
				leftSection={<IconSearch size={px('1.2rem')} stroke={1.5} />}
			/>
		</Box>
	);
};

export default Search;
