import TimeRange from '@/components/Header/TimeRange';
import { Box, Button, Modal, px, Stack, Text, TextInput } from '@mantine/core';
import { IconCheck, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import classes from './styles/toolbar.module.css';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useState } from 'react';
import IconButton from '@/components/Button/IconButton';

const { toggleEditDashboardModal, toggleAllowDrag, toggleCreateTileModal, toggleDeleteDashboardModal } = dashboardsStoreReducers;

const EditLayoutButton = () => {
	const [allowDrag, setDashbaordsStore] = useDashboardsStore((store) => store.allowDrag);

	const onClick = useCallback(() => {
		setDashbaordsStore(toggleAllowDrag);
	}, []);

	return (
		<Stack style={{ width: '7rem' }}>
			<Button
				onClick={onClick}
				className={`${classes.editLayoutBtn} ${allowDrag ? classes.active : ''}`}
				variant={allowDrag ? 'filled' : 'outline'}
				leftSection={allowDrag ? <IconCheck stroke={1.4} size="1rem" /> : <IconPencil stroke={1.4} size="1rem" />}>
				{allowDrag ? 'Save Layout' : 'Edit Layout'}
			</Button>
		</Stack>
	);
};

const AddTileButton = () => {
	const [, setDashbaordsStore] = useDashboardsStore((_store) => null);

	const onClick = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateTileModal(store, true));
	}, []);

	return (
		<Stack>
			<Button
				onClick={onClick}
				variant="outline"
				className={classes.addTileBtn}
				leftSection={<IconPlus stroke={1.4} size="1rem" />}>
				Add Tile
			</Button>
		</Stack>
	);
};

const DeleteDashboardModal = () => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [deleteDashboardModalOpen] = useDashboardsStore((store) => store.deleteDashboardModalOpen);
	const [confirmText, setConfirmText] = useState<string>('');

	const closeModal = useCallback(() => {
		setDashbaordsStore((store) => toggleDeleteDashboardModal(store, false));
	}, []);

	const onChangeHandler = useCallback((e) => {
		setConfirmText(e.target.value);
	}, []);

	const onDelete = useCallback(() => {}, [activeDashboard?.dashboard_id]);

	if (!activeDashboard?.dashboard_id) return null;

	return (
		<Modal
			opened={deleteDashboardModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			styles={{
				body: { padding: '0 1rem 1rem 1rem', width: 400 },
				header: { padding: '1rem', paddingBottom: '0.4rem' },
			}}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Delete Dashboard</Text>}>
			<Stack>
				<Stack gap={8}>
					<Text className={classes.deleteWarningText}>
						Are you sure want to delete this dashboard and its contents ?
					</Text>
					<TextInput
						value={confirmText}
						onChange={onChangeHandler}
						placeholder={'Type the dashboard name to confirm. ie ' + activeDashboard.name}
					/>
				</Stack>
				<Stack style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
					<Box>
						<Button variant="outline">Cancel</Button>
					</Box>
					<Box>
						<Button disabled={confirmText !== activeDashboard.name}>Delete</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const renderDeleteIcon = () => <IconTrash size={px('1rem')} stroke={1.5} />;

const DeleteDashboardButton = () => {
	const [_store, setDashbaordsStore] = useDashboardsStore((_store) => null);
	const onClick = useCallback(() => setDashbaordsStore(store => toggleDeleteDashboardModal(store, true)), []);
	return <IconButton renderIcon={renderDeleteIcon} size={36} onClick={onClick} tooltipLabel="Delete Dashboard" />;
};

const Toolbar = () => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const openEditDashboardModal = useCallback(() => {
		setDashbaordsStore((store) => toggleEditDashboardModal(store, true));
	}, []);

	if (!activeDashboard) return null;

	const { name, description } = activeDashboard;
	return (
		<Stack
			className={classes.toolbarContainer}
			style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
			w="100%">
				<DeleteDashboardModal/>
			<Stack gap={0}>
				<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={0}>
					<Text className={classes.dashboardTitle} lineClamp={1}>
						{name}
					</Text>
					<Stack className={classes.editIcon} onClick={openEditDashboardModal}>
						<IconPencil stroke={1.2} size="1rem" />
					</Stack>
				</Stack>
				<Text className={classes.dashboardDescription} lineClamp={1}>
					{description}
				</Text>
			</Stack>
			<Stack style={{ flexDirection: 'row' }}>
				<TimeRange />
				<AddTileButton/>
				<EditLayoutButton />
				<DeleteDashboardButton/>
			</Stack>
		</Stack>
	);
};

export default Toolbar;
