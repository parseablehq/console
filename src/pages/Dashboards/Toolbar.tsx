import TimeRange from '@/components/Header/TimeRange';
import { Box, Button, Modal, px, Stack, Text, TextInput } from '@mantine/core';
import { IconCheck, IconPencil, IconPlus, IconShare, IconTrash } from '@tabler/icons-react';
import classes from './styles/toolbar.module.css';
import { useDashboardsStore, dashboardsStoreReducers, sortTilesByOrder } from './providers/DashboardsProvider';
import { ChangeEvent, useCallback, useState } from 'react';
import IconButton from '@/components/Button/IconButton';
import { useDashboardsQuery } from '@/hooks/useDashboards';
import _ from 'lodash';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { Dashboard } from '@/@types/parseable/api/dashboards';
import { copyTextToClipboard } from '@/utils';
import { notifySuccess } from '@/utils/notification';

const { toggleEditDashboardModal, toggleAllowDrag, toggleCreateTileModal, toggleDeleteDashboardModal } =
	dashboardsStoreReducers;

const tileIdsbyOrder = (layout: Layout[]) => {
	return layout
		.slice()
		.sort((a, b) => {
			if (a.y === b.y) {
				return a.x - b.x;
			}
			return a.y - b.y;
		})
		.map((item) => item.i);
};

const EditLayoutButton = (props: { layoutRef: React.MutableRefObject<ReactGridLayout.Layout[]> }) => {
	const [allowDrag, setDashbaordsStore] = useDashboardsStore((store) => store.allowDrag);
	const [activeDashboard] = useDashboardsStore((store) => store.activeDashboard);

	const onToggle = useCallback(() => {
		setDashbaordsStore(toggleAllowDrag);
	}, []);

	const { updateDashboard, isUpdatingDashboard } = useDashboardsQuery({});
	const onClick = useCallback(() => {
		if (allowDrag && activeDashboard) {
			const allTiles = activeDashboard.tiles;
			const updatedTiles = sortTilesByOrder(allTiles, tileIdsbyOrder(props.layoutRef.current));
			updateDashboard({ dashboard: { ...activeDashboard, tiles: updatedTiles }, onSuccess: onToggle });
		} else {
			onToggle();
		}
	}, [allowDrag, activeDashboard]);

	return (
		<Stack style={{ width: '7rem' }}>
			<Button
				onClick={onClick}
				loading={isUpdatingDashboard}
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
	const { isDeleting, deleteDashboard } = useDashboardsQuery({});
	const closeModal = useCallback(() => {
		setDashbaordsStore((store) => toggleDeleteDashboardModal(store, false));
	}, []);

	const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setConfirmText(e.target.value);
	}, []);

	const onDelete = useCallback(() => {
		if (activeDashboard?.dashboard_id) {
			deleteDashboard({
				dashboardId: activeDashboard?.dashboard_id,
				onSuccess: () => {
					closeModal();
					setConfirmText('');
				},
			});
		}
	}, [activeDashboard?.dashboard_id]);

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
						<Button
							disabled={confirmText !== activeDashboard.name || isDeleting}
							onClick={onDelete}
							loading={isDeleting}>
							Delete
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

const renderDeleteIcon = () => <IconTrash size={px('1rem')} stroke={1.5} />;
const renderShareIcon = () => <IconShare size={px('1rem')} stroke={1.5} />;

const DeleteDashboardButton = () => {
	const [_store, setDashbaordsStore] = useDashboardsStore((_store) => null);
	const onClick = useCallback(() => setDashbaordsStore((store) => toggleDeleteDashboardModal(store, true)), []);
	return <IconButton renderIcon={renderDeleteIcon} size={36} onClick={onClick} tooltipLabel="Delete Dashboard" />;
};

const ShareDashbboardButton = (props: { dashboard: Dashboard }) => {
	const { dashboard } = props;
	const onClick = useCallback(async () => {
		const sanitizedConfig = _.omit(dashboard, ['dashboard_id', 'user_id', 'version']);
		const { tiles } = dashboard;
		const sanitizedTiles = _.map(tiles, (tile) => {
			return _.omit(tile, 'tile_id');
		});
		await copyTextToClipboard({ ...sanitizedConfig, tiles: sanitizedTiles });
		notifySuccess({ message: 'Dashboard config copied to clipboard' });
	}, [dashboard]);
	return <IconButton renderIcon={renderShareIcon} size={36} onClick={onClick} tooltipLabel="Share Dashboard" />;
};

const Toolbar = (props: { layoutRef: React.MutableRefObject<ReactGridLayout.Layout[]> }) => {
	const [activeDashboard, setDashbaordsStore] = useDashboardsStore((store) => store.activeDashboard);
	const openEditDashboardModal = useCallback(() => {
		setDashbaordsStore((store) => toggleEditDashboardModal(store, true));
	}, []);

	if (!activeDashboard) return null;

	const { name, description } = activeDashboard;

	return (
		<Stack
			className={classes.toolbarContainer}
			style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '3.2rem' }}
			w="100%">
			<DeleteDashboardModal />
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
				<AddTileButton />
				<EditLayoutButton layoutRef={props.layoutRef} />
				<ShareDashbboardButton dashboard={activeDashboard} />
				<DeleteDashboardButton />
			</Stack>
		</Stack>
	);
};

export default Toolbar;
