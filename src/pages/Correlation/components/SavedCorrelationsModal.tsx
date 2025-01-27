import { correlationStoreReducers, useCorrelationStore } from '../providers/CorrelationProvider';
import { useCallback, useEffect } from 'react';
import { Loader, Modal, Stack, Text } from '@mantine/core';
import { EmptySimple } from '@/components/Empty';
import { useCorrelationsQuery } from '@/hooks/useCorrelations';
import _ from 'lodash';
import SavedCorrelationItem from './SavedCorrelationItem';

const { toggleSavedCorrelationsModal } = correlationStoreReducers;

const SavedCorrelationsModal = () => {
	const [{ isSavedCorrelationsModalOpen, correlations }, setFilterStore] = useCorrelationStore((store) => store);
	const { fetchCorrelations, fetchCorrelationsError, fetchCorrelationsLoading } = useCorrelationsQuery();

	useEffect(() => {
		if (correlations === null) {
			fetchCorrelations();
		}
	}, [correlations]);

	const closeModal = useCallback(() => {
		setFilterStore((store) => toggleSavedCorrelationsModal(store, false));
	}, []);

	const hasNoSavedFilters = _.isEmpty(correlations) || _.isNil(correlations) || fetchCorrelationsError;
	useEffect(() => {
		const handleKeyPress = (event: { key: string }) => {
			if (event.key === 'Escape') {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	return (
		<Modal
			opened={isSavedCorrelationsModalOpen}
			onClose={closeModal}
			size="auto"
			centered
			styles={{ body: { padding: '0 1.2rem 1.2rem 1.2rem' }, header: { padding: '1rem', paddingBottom: '0.4rem' } }}
			title={<Text style={{ fontSize: '0.9rem', fontWeight: 600 }}>Saved Correlations</Text>}>
			<Stack w={700} mih={400} gap={14} style={{ paddingTop: hasNoSavedFilters ? 0 : '0.8rem' }}>
				{hasNoSavedFilters ? (
					<Stack style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
						{fetchCorrelationsLoading ? (
							<Loader />
						) : (
							<>
								<EmptySimple height={60} width={60} />
								<Text style={{ fontSize: '0.75rem' }} c="gray.5">
									No items to display
								</Text>
							</>
						)}
					</Stack>
				) : (
					<>
						{_.map(correlations, (correlatedItem) => {
							return (
								<SavedCorrelationItem
									item={correlatedItem}
									key={correlatedItem.id}
									// hardRefresh={hardRefresh}
									// changeTimerange={changeTimerange}
								/>
							);
						})}
					</>
				)}
			</Stack>
		</Modal>
	);
};

export default SavedCorrelationsModal;
