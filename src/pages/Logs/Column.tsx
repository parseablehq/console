import { Log, SortOrder } from '@/@types/parseable/api/query';
import { Box, Checkbox, Popover, TextInput, Tooltip, UnstyledButton, px } from '@mantine/core';
import { type ChangeEvent, type FC, Fragment, useTransition, useRef, useCallback, useMemo } from 'react';
import { IconDotsVertical, IconFilter, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import { useTableColumnStyle } from './styles';
import EmptyBox from '@/components/Empty';
import { Button } from '@mantine/core';
import Loading from '@/components/Loading';
import { FixedSizeList as List } from 'react-window';
import compare from 'just-compare';
import { parseLogData } from '@/utils';
import { useDisclosure } from '@mantine/hooks';

type SortWidgetProps = {
	setSortOrder: (order: SortOrder | null) => void;
	fieldSortOrder: SortOrder | null;
};

/**
 * Component that allows selecting sorting by a given field
 */
const SortWidget: FC<SortWidgetProps> = (props) => {
	const { setSortOrder, fieldSortOrder } = props;
	const toggleAscending = () => {
		setSortOrder(fieldSortOrder === SortOrder.ASCENDING ? null : SortOrder.ASCENDING);
	};
	const toggleDescending = () => {
		setSortOrder(fieldSortOrder === SortOrder.DESCENDING ? null : SortOrder.DESCENDING);
	};
	const { classes } = useTableColumnStyle();
	const { sortBtn ,sortBtnActive} = classes;

	return (
		<Box>
			<Button
				className={fieldSortOrder === SortOrder.ASCENDING ? sortBtnActive : sortBtn}
				onClick={toggleAscending}
				leftIcon={
					<IconSortAscending
					stroke={ fieldSortOrder === SortOrder.ASCENDING ? 2 : 1}
					/>
				}>
				Sort by Ascending order
			</Button>
			<Button
				className={fieldSortOrder === SortOrder.DESCENDING ? sortBtnActive : sortBtn}
				onClick={toggleDescending}
				leftIcon={
					<IconSortDescending
					
						stroke={fieldSortOrder === SortOrder.DESCENDING ? 2 : 1}
					/>
				}>
				Sort by Descending order
			</Button>
		</Box>
	);
};

type Column = {
	columnName: string;
	getColumnFilters: (columnName: string) => Log[number][] | null;
	appliedFilter: (columnName: string) => string[];
	applyFilter: (columnName: string, value: string[]) => void;
	setSorting: (order: SortOrder | null) => void;
	fieldSortOrder: SortOrder | null;
};

const Column: FC<Column> = (props) => {
	const { columnName, getColumnFilters, appliedFilter, applyFilter, setSorting, fieldSortOrder } = props;

	// columnValues ref will always have the unfiltered data.
	const _columnValuesRef = useRef<Log[number][] | null>(null);

	const [columnValues, setColumnValues] = useMountedState<Log[number][] | null>(null);
	const [selectedFilters, setSelectedFilters] = useMountedState<string[]>(appliedFilter(columnName));
	const [isPending, startTransition] = useTransition();

	const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
		const search = e.target.value.trim();

		setColumnValues(() => {
			const values = _columnValuesRef.current;

			if (values && search) {
				return values.filter((x) => {
					return parseLogData(x, columnName)?.toString().includes(search);
				});
			}

			return values;
		});
	};

	const setFilters = (filters: string[]) => {
		setSelectedFilters(filters);
	};

	const onOpen = useCallback(() => {
		if (!_columnValuesRef.current) {
			_columnValuesRef.current = getColumnFilters(columnName);
			startTransition(() => {
				setColumnValues(_columnValuesRef.current);
			});
		}
	}, []);

	const onApply = () => {
		applyFilter(columnName, selectedFilters);
	};

	const filterActive = useMemo(() => Boolean(appliedFilter(columnName)?.length), [selectedFilters]);
	const canApply = useMemo(() => !compare(selectedFilters, appliedFilter(columnName)), [selectedFilters]);
	function capitalizeFirstLetter(word: string) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}
	const { classes, cx } = useTableColumnStyle();
	const { labelBtn, applyBtn, labelIcon, labelIconActive, searchInputStyle,filterText } = classes;

	return (
		<th>
			<Popover position="bottom" withArrow withinPortal shadow="md" zIndex={1} onOpen={onOpen}>
				<Popover.Target>
					<UnstyledButton className={labelBtn}>
						<span className="label">{capitalizeFirstLetter(columnName)}</span>
						<IconDotsVertical
							stroke={filterActive ? 3 : 1.8}
							size={px('1rem')}
							className={cx(labelIcon, {
								[labelIconActive]: filterActive,
							})}
						/>
					</UnstyledButton>
				</Popover.Target>
				<Popover.Dropdown>
					<Box>
						<SortWidget setSortOrder={setSorting} fieldSortOrder={fieldSortOrder} />
						<Button className={filterText} leftIcon={<IconFilter stroke={1} />} >Filter by values:</Button>
						
						<TextInput
							className={searchInputStyle}
							placeholder="Search"
							icon={<IconSearch size={px('0.8rem')} />}
							onChange={onSearch}
						/>
						{isPending ? (
							<Loading visible position="relative" variant="oval" my="xl" />
						) : columnValues?.length ? (
							<Fragment>
								<CheckboxVirtualList
									columnName={columnName}
									list={columnValues}
									selectedFilters={selectedFilters}
									setFilters={setFilters}
								/>
								<Button className={applyBtn} onClick={onApply} disabled={!canApply}>
									Apply
								</Button>
							</Fragment>
						) : (
							<EmptyBox mb="lg" />
						)}
					</Box>
				</Popover.Dropdown>
			</Popover>
		</th>
	);
};

type CheckboxVirtualListProps = {
	columnName: string;
	list: Log[number][];
	selectedFilters: string[];
	setFilters: (value: string[]) => void;
};

const CheckboxVirtualList: FC<CheckboxVirtualListProps> = (props) => {
	const { list, selectedFilters, setFilters, columnName } = props;

	return (
		<Checkbox.Group value={selectedFilters} onChange={setFilters}>
			<List itemCount={list.length} itemSize={35} height={250} width={250} overscanCount={10}>
				{({ index }) => {
					const label = list[index]?.toString() || '';

					return <CheckboxRow key={index} value={label} label={label} columnName={columnName} />;
				}}
			</List>
		</Checkbox.Group>
	);
};

type CheckboxRowProps = {
	label: string;
	value: string;
	columnName: string;
};

const CheckboxRow: FC<CheckboxRowProps> = (props) => {
	const { value, label, columnName } = props;
	const [opened, { open, close }] = useDisclosure(false);
	const { classes } = useTableColumnStyle();
	const { checkBoxStyle } = classes;
	return (
		<Tooltip
			label={label}
			withinPortal
			opened={opened}
			style={{
				whiteSpace: 'pre-wrap',
				maxWidth: 250,
				color: 'black',
				backgroundColor: 'white',
			}}>
			<div onMouseOver={open} onMouseOut={close}>
				<Checkbox value={value} label={parseLogData(label, columnName)} className={checkBoxStyle} />
			</div>
		</Tooltip>
	);
};

export default Column;
