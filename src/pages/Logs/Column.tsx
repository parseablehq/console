import { Log, SortOrder } from '@/@types/parseable/api/query';
import { Box, Checkbox, Popover, ScrollArea, Stack, TextInput, Tooltip, UnstyledButton, px } from '@mantine/core';
import { type ChangeEvent, type FC, Fragment, useTransition, useRef, useCallback, useMemo } from 'react';
import { IconDotsVertical, IconFilter, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import EmptyBox from '@/components/Empty';
import { Button } from '@mantine/core';
import Loading from '@/components/Loading';
import compare from 'just-compare';
import { parseLogData } from '@/utils';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import columnStyles from './styles/Column.module.css';
import { Text } from '@mantine/core';

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
	const classes = columnStyles;
	const { sortBtn, sortBtnActive } = classes;

	return (
		<Box>
			<Button
				className={fieldSortOrder === SortOrder.ASCENDING ? sortBtnActive : sortBtn}
				onClick={toggleAscending}
				leftSection={<IconSortAscending stroke={fieldSortOrder === SortOrder.ASCENDING ? 2 : 1} />}>
				Sort by Ascending order
			</Button>
			<Button
				className={fieldSortOrder === SortOrder.DESCENDING ? sortBtnActive : sortBtn}
				onClick={toggleDescending}
				leftSection={<IconSortDescending stroke={fieldSortOrder === SortOrder.DESCENDING ? 2 : 1} />}>
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
					return x?.toString().toLowerCase().includes(search.toLowerCase());
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
			const uniqueValues = getColumnFilters(columnName);
			_columnValuesRef.current = Array.isArray(uniqueValues)
				? uniqueValues?.map((val) => parseLogData(val, columnName))
				: null;
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

	const classes = columnStyles;
	const { labelBtn, applyBtn, labelIcon, labelIconActive, searchInputStyle, filterText } = classes;

	return (
		<th
			style={{
				height: '42px',
				padding: 0,
				textAlign: 'left',
			}}>
			<Popover position="bottom" withArrow withinPortal shadow="md" zIndex={2} onOpen={onOpen}>
				<Popover.Target>
					<UnstyledButton className={labelBtn}>
						<span>{capitalizeFirstLetter(columnName)}</span>
						<IconDotsVertical
							stroke={filterActive ? 3 : 1.8}
							size={px('1rem')}
							className={[labelIcon, filterActive && labelIconActive].filter(Boolean).join(' ')}
						/>
					</UnstyledButton>
				</Popover.Target>
				<Popover.Dropdown>
					<Box>
						<SortWidget setSortOrder={setSorting} fieldSortOrder={fieldSortOrder} />
						<Button className={filterText} leftSection={<IconFilter stroke={1} />}>
							Filter by values:
						</Button>

						<TextInput
							className={searchInputStyle}
							placeholder="Search"
							leftSection={<IconSearch size={px('0.8rem')} />}
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

const SLICE_OFFSET = 50;

const CheckboxVirtualList: FC<CheckboxVirtualListProps> = (props) => {
	const { list, selectedFilters, setFilters } = props;
	const classes = columnStyles;
	const totalValues = list.length;
	const shortList = list.slice(0, SLICE_OFFSET);
	const { checkBoxStyle } = classes;

	const remainingLength = totalValues > SLICE_OFFSET ? totalValues - SLICE_OFFSET : 0;

	return (
		<Checkbox.Group value={selectedFilters} onChange={setFilters}>
			<ScrollArea style={{ height: 250 }}>
				{shortList.map((item, index) => {
					const label = item?.toString() || '';
					return (
						<div key={`${label}${index}`}>
							<Tooltip label={label} key={index} openDelay={500} maw={300} multiline>
								<Stack style={{ width: '100%', justifyContent: 'center' }}>
									<Checkbox
										value={label}
										label={label}
										className={checkBoxStyle}
										styles={{
											label: { textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap', overflow: 'hidden' },
											body: {
												textOverflow: 'ellipsis',
											},
										}}
									/>
								</Stack>
							</Tooltip>
							{index + 1 === shortList.length && remainingLength > 0 && (
								<Text ta="center" c="gray.5" style={{ margin: '8px 0' }}>{`+${remainingLength} more`}</Text>
							)}
						</div>
					);
				})}
			</ScrollArea>
		</Checkbox.Group>
	);
};

export default Column;
