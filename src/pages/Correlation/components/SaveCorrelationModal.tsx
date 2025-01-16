import { Box, Button, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import classes from '../styles/SaveCorrelationModal.module.css';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { Correlation } from '@/@types/parseable/api/correlation';
import { useCorrelationsQuery } from '@/hooks/useCorrelations';

const { defaultTimeRangeOption, makeTimeRangeOptions, getDefaultTimeRangeOption } = timeRangeUtils;

const { toggleSaveCorrelationModal } = correlationStoreReducers;

interface FormObjectType extends Omit<Correlation, 'correlation_id' | 'version'> {
	isNew: boolean;
	isError: boolean;
	correlation_id?: string;
	version?: string;
	timeRangeOptions: { value: string; label: string; time_filter: null | { from: string; to: string } }[];
	selectedTimeRangeOption: { value: string; label: string; time_filter: null | { from: string; to: string } };
}

const SaveCorrelationModal = () => {
	const [
		{ isSaveCorrelationModalOpen, selectedFields, fields, correlationCondition, activeCorrelation, savedCorrelationId },
		setCorrelationData,
	] = useCorrelationStore((store) => store);

	const [formObject, setFormObject] = useState<FormObjectType | null>(null);
	const [timeRange] = useAppStore((store) => store.timeRange);
	const [isDirty, setDirty] = useState<boolean>(false);

	const { saveCorrelationMutation, updateCorrelationMutation } = useCorrelationsQuery();

	const streamNames = Object.keys(fields);

	const joins = correlationCondition.split('=');

	useEffect(() => {
		const timeRangeOptions = makeTimeRangeOptions({ selected: null, current: timeRange });
		const selectedTimeRangeOption = getDefaultTimeRangeOption(timeRangeOptions);
		if (activeCorrelation !== null) {
			setFormObject({
				version: 'v1',
				title: activeCorrelation.title,
				isNew: false,
				isError: false,
				timeRangeOptions,
				selectedTimeRangeOption,
				tableConfigs: [],
				joinConfig: {
					joinConditions: [],
				},
				id: activeCorrelation.id,
				filter: null,
				startTime: '',
				endTime: '',
			});
		} else {
			setFormObject({
				version: 'v1',
				title: '',
				isNew: true,
				isError: false,
				timeRangeOptions,
				selectedTimeRangeOption,
				tableConfigs: [],
				joinConfig: {
					joinConditions: [],
				},
				id: '',
				filter: null,
				startTime: '',
				endTime: '',
			});
		}
	}, [timeRange, activeCorrelation]);

	const closeModal = useCallback(() => {
		setCorrelationData((store) => toggleSaveCorrelationModal(store, false));
	}, []);

	const updateCorrelation = useCallback(() => {
		updateCorrelationMutation({
			correlationData: {
				version: 'v1',
				id: savedCorrelationId,
				tableConfigs: [
					{
						selectedFields: selectedFields[streamNames[0]] || [],
						tableName: streamNames[0],
					},
					{
						selectedFields: selectedFields[streamNames[1]] || [],
						tableName: streamNames[1],
					},
				],
				joinConfig: {
					joinConditions: [
						{
							tableName: streamNames[0],
							field: joins[0].split('.')[1].trim(),
						},
						{
							tableName: streamNames[1],
							field: joins[1].split('.')[1].trim(),
						},
					],
				},
				filter: null,
				startTime: formObject?.selectedTimeRangeOption.time_filter?.from,
				endTime: formObject?.selectedTimeRangeOption.time_filter?.to,
				title: formObject?.title,
			},
			onSuccess: () => {
				closeModal();
			},
		});
	}, [formObject]);

	const saveCorrelation = useCallback(() => {
		saveCorrelationMutation({
			correlationData: {
				version: 'v1',
				tableConfigs: [
					{
						selectedFields: selectedFields[streamNames[0]] || [],
						tableName: streamNames[0],
					},
					{
						selectedFields: selectedFields[streamNames[1]] || [],
						tableName: streamNames[1],
					},
				],
				joinConfig: {
					joinConditions: [
						{
							tableName: streamNames[0],
							field: joins[0].split('.')[1].trim(),
						},
						{
							tableName: streamNames[1],
							field: joins[1].split('.')[1].trim(),
						},
					],
				},
				filter: null,
				startTime: formObject?.selectedTimeRangeOption.time_filter?.from,
				endTime: formObject?.selectedTimeRangeOption.time_filter?.to,
				title: formObject?.title,
			},
			onSuccess: () => {
				closeModal();
			},
		});
	}, [formObject]);

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

		if (_.isEmpty(formObject?.title)) {
			return setFormObject((prev) => {
				if (!prev) return null;

				return {
					...prev,
					isError: true,
				};
			});
		}

		if (!_.isEmpty(formObject.title) && !_.isEmpty(formObject.version) && !savedCorrelationId) {
			saveCorrelation();
		} else {
			updateCorrelation();
		}
	}, [formObject]);

	const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setDirty(true);
		setFormObject((prev) => {
			if (!prev) return null;

			return {
				...prev,
				title: e.target.value,
				isError: _.isEmpty(e.target.value),
			};
		});
	}, []);

	return (
		<Modal
			opened={isSaveCorrelationModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			styles={{ body: { padding: '0 1rem 1rem 1rem' }, header: { padding: '1rem', paddingBottom: '0.4rem' } }}
			title={
				<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>
					{formObject?.isNew ? 'Save Correlation' : 'Update Correlation'}
				</Text>
			}>
			<Stack w={600} gap={14}>
				<Stack>
					<TextInput
						onChange={onNameChange}
						withAsterisk
						label="Name"
						classNames={{ input: classes.inputField }}
						error={isDirty && formObject?.isError && 'Name cannot be empty'}
						value={formObject?.title}
					/>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Stack gap={4} style={{ width: '100%' }}>
						<Text style={{ fontSize: '0.7rem', fontWeight: 500 }}>Time Range</Text>
						<Select
							classNames={{ input: classes.selectInput, description: classes.selectDescription }}
							data={formObject?.timeRangeOptions}
							value={formObject?.selectedTimeRangeOption.value}
							onChange={onToggleIncludeTimeRange}
						/>
					</Stack>
				</Stack>
				<Stack style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 10 }}>
					<Box>
						<Button miw={100} variant="outline" onClick={closeModal}>
							Cancel
						</Button>
					</Box>
					<Box>
						<Button miw={100} onClick={onSubmit}>
							{savedCorrelationId ? 'Update' : 'Save'}
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default SaveCorrelationModal;
