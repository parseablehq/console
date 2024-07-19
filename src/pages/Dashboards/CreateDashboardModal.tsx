import { Box, Button, Modal, Stack, TextInput } from '@mantine/core';
import classes from './styles/CreateDashboardModal.module.css';
import { useDashboardsStore, dashboardsStoreReducers } from './providers/DashboardsProvider';
import { useCallback, useState } from 'react';
import _ from 'lodash';
import { useDashboardsQuery } from '@/hooks/useDashboards';

const { toggleCreateDashboardModal } = dashboardsStoreReducers;

type ModalProps = {};

const defaultDashboard = {
    
}

const CreateDashboardModal = () => {
	const [modalOpen, setDashbaordsStore] = useDashboardsStore((store) => store.createDashboardModalOpen);
	const [name, setName] = useState<string>('');
	const { createDashboard } = useDashboardsQuery();

	const closeModal = useCallback(() => {
		setDashbaordsStore((store) => toggleCreateDashboardModal(store, false));
	}, []);

	const onNameChange = useCallback((e) => {
		setName(e.target.value);
	}, []);

	const onCreateSuccess = useCallback(() => {
		closeModal();
		setName('');
	}, []);

	const onSubmit = useCallback(() => {
		createDashboard({ dashboard: { name }, onSuccess: onCreateSuccess });
	}, [name]);

	return (
		<Modal
			opened={modalOpen}
			onClose={closeModal}
			centered
			size="40rem"
			title="Create Dashboard"
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack style={{ padding: '0.5rem 0 1rem 0' }} gap={28}>
				<TextInput label="Name" required value={name} onChange={onNameChange} />
				<Stack style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
					<Box>
						<Button variant="outline" onClick={closeModal}>
							Cancel
						</Button>
					</Box>
					<Box>
						<Button disabled={_.isEmpty(name)} onClick={onSubmit}>
							Create
						</Button>
					</Box>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default CreateDashboardModal;
