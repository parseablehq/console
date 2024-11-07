import { Box, Button, Loader, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { filterStoreReducers, useFilterStore } from '../../providers/FilterProvider';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useLogsStore } from '../../providers/LogsProvider';
import { CodeHighlight } from '@mantine/code-highlight';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { CreateSavedFilterType, SavedFilterType } from '@/@types/parseable/api/savedFilters';
import useSavedFiltersQuery from '@/hooks/useSavedFilters';
import timeRangeUtils from '@/utils/timeRangeUtils';

const { defaultTimeRangeOption, makeTimeRangeOptions, getDefaultTimeRangeOption } = timeRangeUtils;
const { toggleSaveFiltersModal } = filterStoreReducers;

interface FormObjectType extends Omit<SavedFilterType, 'filter_id' | 'version'> {
	isNew: boolean;
	isError: boolean;
	filter_id?: string;
	version?: string;
	timeRangeOptions: { value: string; label: string; time_filter: null | { from: string; to: string } }[];
	selectedTimeRangeOption: { value: string; label: string; time_filter: null | { from: string; to: string } };
}

const sanitizeFilterItem = (formObject: FormObjectType): SavedFilterType => {
	const { stream_name, filter_name, filter_id = '', query, selectedTimeRangeOption, version = '' } = formObject;
	return {
		filter_id,
		version,
		stream_name,
		filter_name,
		time_filter: selectedTimeRangeOption.time_filter,
		query,
	};
};

const SaveFilterModal = () => {
	const [isSaveFiltersModalOpen, setFilterStore] = useFilterStore((store) => store.isSaveFiltersModalOpen);
	const [activeSavedFilters] = useAppStore((store) => store.activeSavedFilters);
	const [formObject, setFormObject] = useState<FormObjectType | null>(null);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const [{ custSearchQuery, savedFilterId, activeMode }] = useLogsStore((store) => store.custQuerySearchState);
	const [isDirty, setDirty] = useState<boolean>(false);
	const { updateSavedFilters, createSavedFilters, isCreating, isUpdating } = useSavedFiltersQuery();
	const showLoader = isCreating || isUpdating;

	useEffect(() => {
		const selectedFilter = _.find(activeSavedFilters, (filter) => filter.filter_id === savedFilterId);
		if (!currentStream || !activeMode) return;

		if (selectedFilter) {
			const { time_filter } = selectedFilter;
			const timeRangeOptions = makeTimeRangeOptions({ selected: time_filter, current: timeRange });
			const selectedTimeRangeOption = getDefaultTimeRangeOption(timeRangeOptions);
			setFormObject({
				...selectedFilter,
				isNew: false,
				isError: false,
				timeRangeOptions,
				selectedTimeRangeOption,
			});
		} else {
			const isSqlMode = activeMode === 'sql';
			const timeRangeOptions = makeTimeRangeOptions({ selected: null, current: timeRange });
			const selectedTimeRangeOption = getDefaultTimeRangeOption(timeRangeOptions);
			setFormObject({
				stream_name: currentStream,
				filter_name: '',
				query: {
					filter_type: isSqlMode ? 'sql' : 'builder',
					filter_query: custSearchQuery,
				},
				time_filter: {
					from: timeRange.startTime.toISOString(),
					to: timeRange.endTime.toISOString(),
				},
				isNew: true,
				isError: false,
				timeRangeOptions,
				selectedTimeRangeOption,
			});
		}
	}, [custSearchQuery, savedFilterId, activeMode, timeRange, activeSavedFilters]);

	const closeModal = useCallback(() => {
		setFilterStore((store) => toggleSaveFiltersModal(store, false));
	}, []);

	const onToggleIncludeTimeRange = useCallback(
		(value: string | null) => {
			setDirty(true);
			setFormObject((prev) => {
				if (!prev) return null;

				return {
					...prev,
					selectedTimeRangeOption:
						_.find(prev.timeRangeOptions, (option) => option.value === value) || defaultTimeRangeOption,
				};
			});
		},
		[timeRange],
	);

	const onSubmit = useCallback(() => {
		if (!formObject) return;

		if (_.isEmpty(formObject?.filter_name)) {
			return setFormObject((prev) => {
				if (!prev) return null;

				return {
					...prev,
					isError: true,
				};
			});
		}

		if (!_.isEmpty(formObject.filter_id) && !_.isEmpty(formObject.version)) {
			updateSavedFilters({ filter: sanitizeFilterItem(formObject), onSuccess: closeModal });
		} else {
			const keysToRemove = ['filter_id', 'version'];
			const sanitizedFilterItem = sanitizeFilterItem(formObject);
			const filteredEntries = Object.entries(sanitizedFilterItem).filter(([key]) => !keysToRemove.includes(key));
			const newObj: CreateSavedFilterType = Object.fromEntries(filteredEntries) as CreateSavedFilterType;
			createSavedFilters({ filter: newObj, onSuccess: closeModal });
		}
	}, [formObject]);

	const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setDirty(true);
		setFormObject((prev) => {
			if (!prev) return null;

			return {
				...prev,
				filter_name: e.target.value,
				isError: _.isEmpty(e.target.value),
			};
		});
	}, []);

	return (
		<Modal
			opened={isSaveFiltersModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			styles={{ body: { padding: '0 1rem 1rem 1rem' }, header: { padding: '1rem', paddingBottom: '0.4rem' } }}
			title={
				<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>
					{formObject?.isNew ? 'Save Filters' : 'Update Filters'}
				</Text>
			}>
			<Stack w={600} gap={14}>
				<Stack>
					<TextInput
						onChange={onNameChange}
						withAsterisk
						label="Name"
						error={isDirty && formObject?.isError && 'Name cannot be empty'}
						value={formObject?.filter_name}
					/>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Stack gap={4} style={{ width: '100%' }}>
						<Text style={{ fontSize: '0.7rem', fontWeight: 500 }}>Time Range</Text>
						<Select
							data={formObject?.timeRangeOptions}
							value={formObject?.selectedTimeRangeOption.value}
							onChange={onToggleIncludeTimeRange}
						/>
					</Stack>
				</Stack>
				<Stack gap={4}>
					<Text style={{ fontSize: '0.7rem', fontWeight: 500 }}>Query</Text>
					<CodeHighlight
						code={custSearchQuery}
						language="sql"
						withCopyButton={false}
						styles={{
							code: {
								fontSize: '0.72rem',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
							},
						}}
					/>
				</Stack>
				<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 10 }}>
					{showLoader ? (
						<Stack style={{ marginRight: 10 }}>
							<Loader size="md" />
						</Stack>
					) : (
						<>
							<Box>
								<Button miw={100} variant="outline" onClick={closeModal}>
									Cancel
								</Button>
							</Box>
							<Box>
								<Button miw={100} onClick={onSubmit}>
									Save
								</Button>
							</Box>
						</>
					)}
				</Stack>
			</Stack>
		</Modal>
	);
};

export default SaveFilterModal;
