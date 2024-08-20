import { Box, Button, Loader, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/CreateDashboardModal.module.css';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useEffect } from 'react';
import _ from 'lodash';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import { useForm } from '@mantine/form';
import { useLogsStore } from '../Stream/providers/LogsProvider';
import timeRangeUtils from '@/utils/timeRangeUtils';
import { Tile } from '@/@types/parseable/api/dashboards';

const { toggleCreateDashboardModal, toggleEditDashboardModal } = dashboardsStoreReducers;
const { makeTimeRangeOptions, getDefaultTimeRangeOption } = timeRangeUtils;

const DEFAULT_REFRESH_INTERVAL = 60;

type FormOpts = {
	name: string;
	description: string;
	refresh_interval: number;
	tiles: Tile[];
	dashboard_id?: string;
	time_filter: null | string;
};

const useDashboardForm = (opts: FormOpts) => {
	const form = useForm<FormOpts>({
		mode: 'controlled',
		initialValues: opts,
		validate: {
			name: (val) => (_.isEmpty(val) ? 'Name cannot be empty' : null),
			description: (val) => (_.isEmpty(val) ? 'Description cannot be empty' : null),
		},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	return { form, onChangeValue };
};

const defaultOpts = {
	name: '',
	description: '',
	refresh_interval: DEFAULT_REFRESH_INTERVAL,
	tiles: [],
	time_filter: null,
};

const CreateDashboardModal = () => {
	const [createMode, setDashbaordsStore] = useDashboardsStore((store) => store.createDashboardModalOpen);
	const [editMode] = useDashboardsStore((store) => store.editDashboardModalOpen);
	const [timeRange] = useLogsStore((store) => store.timeRange);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);
	const timeRangeOptions = makeTimeRangeOptions({
		selected: editMode && activeDashboard ? activeDashboard.time_filter : null,
		current: timeRange,
	});
	const selectedTimeRangeOption = getDefaultTimeRangeOption(timeRangeOptions);
	const { form } = useDashboardForm(defaultOpts);
	const { createDashboard, updateDashboard, isCreatingDashboard, isUpdatingDashboard } = useDashboardsQuery({});
	const showLoader = isCreatingDashboard || isUpdatingDashboard;

	useEffect(() => {
		if (editMode) {
			const formValues = {
				...defaultOpts,
				...(activeDashboard ? { ...activeDashboard, time_filter: selectedTimeRangeOption.value } : {}),
			};
			form.setValues(formValues);
		} else {
			form.setValues(defaultOpts);
		}
	}, [editMode, createMode]);

	const closeModal = useCallback(() => {
		if (createMode) {
			setDashbaordsStore((store) => toggleCreateDashboardModal(store, false));
		} else {
			setDashbaordsStore((store) => toggleEditDashboardModal(store, false));
		}
	}, [createMode, editMode]);

	const onSubmit = useCallback(() => {
		const dashboard = form.values;
		const timeFilter =
			_.find(timeRangeOptions, (option) => option.value === dashboard.time_filter)?.time_filter || null;
		if (editMode) {
			const dashboardId = dashboard.dashboard_id;
			if (dashboardId) {
				updateDashboard({
					dashboard: { ...dashboard, dashboard_id: dashboardId, time_filter: timeFilter },
					onSuccess: closeModal,
				});
			}
		} else {
			createDashboard({ dashboard: { ...dashboard, time_filter: timeFilter }, onSuccess: closeModal });
		}
	}, [form.values, editMode, createMode, timeRangeOptions]);

	return (
		<Modal
			opened={createMode || editMode}
			onClose={closeModal}
			centered
			size="40rem"
			title={editMode ? 'Edit Dashboard' : createMode ? 'Create Dashboard' : null}
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack style={{ padding: '0.5rem 0 1rem 0' }} gap={28}>
				<Stack gap={10}>
					<TextInput
						classNames={{ label: classes.fieldTitle }}
						label="Name"
						key="name"
						{...form.getInputProps('name')}
					/>
					<TextInput
						classNames={{ label: classes.fieldTitle }}
						label="Description"
						key="description"
						{...form.getInputProps('description')}
					/>
					<Stack style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Stack gap={4} style={{ width: '100%' }}>
							<Text style={{ fontSize: '0.7rem', fontWeight: 500 }}>Time Range</Text>
							<Select
								data={timeRangeOptions}
								{...form.getInputProps('time_filter')}
								{...(form.values.time_filter === null ? { value: 'none' } : {})}
								disabled={!editMode}
							/>
						</Stack>
					</Stack>
				</Stack>
				<Stack style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
					{showLoader ? (
						<Stack style={{ marginRight: 10 }}>
							<Loader size="md" />
						</Stack>
					) : (
						<>
							<Box>
								<Button variant="outline" onClick={closeModal}>
									Cancel
								</Button>
							</Box>
							<Box>
								<Button disabled={!form.isValid()} onClick={onSubmit}>
									{!editMode ? 'Create' : 'Save'}
								</Button>
							</Box>
						</>
					)}
				</Stack>
			</Stack>
		</Modal>
	);
};

export default CreateDashboardModal;
