import { Box, Button, Modal, Stack, Switch, Text, TextInput } from '@mantine/core';
import { filterStoreReducers, useFilterStore } from '../../providers/FilterProvider';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { makeTimeRangeLabel, useLogsStore } from '../../providers/LogsProvider';
import { CodeHighlight } from '@mantine/code-highlight';
import _ from 'lodash';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { SavedFilterType } from '@/@types/parseable/api/savedFilters';
import { generateRandomId } from '@/utils';
import useSavedFiltersQuery from '@/hooks/useSavedFilters';

const { toggleSaveFiltersModal } = filterStoreReducers;

interface FormObjectType extends SavedFilterType {
	includeTimeRange: boolean;
	isNew: boolean;
	isError: boolean;
}

const sanitizeFilterItem = (formObject: FormObjectType): SavedFilterType => {
	const { stream_name, filter_name, filter_id, query, time_filter, includeTimeRange } = formObject;
	return {
		version: 'v1',
		stream_name,
		filter_id,
		filter_name,
		time_filter: includeTimeRange ? time_filter : {},
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

	const { mutateSavedFilters } = useSavedFiltersQuery(currentStream || '');

	useEffect(() => {
		const selectedFilter = _.find(activeSavedFilters, (filter) => filter.filter_id === savedFilterId);
		if (!currentStream || !activeMode) return;

		if (selectedFilter) {
			const { time_filter } = selectedFilter;
			setFormObject({
				...selectedFilter,
				time_filter: {
					...time_filter,
					from: timeRange.startTime.toISOString(),
					to: timeRange.endTime.toISOString(),
				},
				includeTimeRange: !_.isEmpty(time_filter),
				isNew: false,
				isError: false,
			});
		} else {
			setFormObject({
				filter_id: generateRandomId(6),
				includeTimeRange: false,
				version: 'v1',
				stream_name: currentStream,
				filter_name: '',
				query: {
					filter_type: 'sql',
					filter_query: custSearchQuery,
				},
				time_filter: {
					from: timeRange.startTime.toISOString(),
					to: timeRange.endTime.toISOString(),
				},
				isNew: true,
				isError: false,
			});
		}
	}, [custSearchQuery, savedFilterId]);

	const closeModal = useCallback(() => {
		setFilterStore((store) => toggleSaveFiltersModal(store, false));
	}, []);

	const onToggleIncludeTimeRange = useCallback(() => {
		setDirty(true);
		setFormObject((prev) => {
			if (!prev) return null;

			return {
				...prev,
				includeTimeRange: !prev.includeTimeRange,
			};
		});
	}, []);

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

		mutateSavedFilters({ filter: sanitizeFilterItem(formObject), onSuccess: closeModal });
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
						<Text style={{ fontSize: '0.7rem', fontWeight: 500 }}>Include Time Range</Text>
						<Text style={{ fontSize: '0.7rem' }} c={formObject?.includeTimeRange ? 'black' : 'gray.5'}>
							{formObject?.includeTimeRange
								? makeTimeRangeLabel(timeRange.startTime, timeRange.endTime)
								: 'Time range is not included'}
						</Text>
					</Stack>
					<Stack>
						<Switch
							styles={{
								label: { fontSize: '0.7rem' },
							}}
							checked={formObject?.includeTimeRange}
							onChange={onToggleIncludeTimeRange}
							size="md"
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
				</Stack>
			</Stack>
		</Modal>
	);
};

export default SaveFilterModal;
