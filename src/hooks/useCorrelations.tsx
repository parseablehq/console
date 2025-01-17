import { useMutation, useQuery } from 'react-query';
import _ from 'lodash';

import {
	deleteSavedCorrelation,
	getCorrelationById,
	getCorrelations,
	saveCorrelation,
	updateCorrelation,
} from '@/api/correlations';
import { correlationStoreReducers, useCorrelationStore } from '@/pages/Correlation/providers/CorrelationProvider';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import { appStoreReducers, useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import dayjs from 'dayjs';

const {
	setCorrelations,
	setActiveCorrelation,
	setCorrelationId,
	setSavedCorrelationId,
	cleanCorrelationStore,
	toggleSavedCorrelationsModal,
} = correlationStoreReducers;
const { setTimeRange, syncTimeRange } = appStoreReducers;
export const useCorrelationsQuery = () => {
	const [{ correlationId }, setCorrelatedStore] = useCorrelationStore((store) => store);
	const [, setAppStore] = useAppStore((store) => store);
	const {
		isError: fetchCorrelationsError,
		isSuccess: fetchCorrelationsSuccess,
		isLoading: fetchCorrelationsLoading,
		refetch: fetchCorrelations,
	} = useQuery(['correlations'], () => getCorrelations(), {
		retry: false,
		enabled: false,
		refetchOnWindowFocus: false,
		onSuccess: (data) => {
			setCorrelatedStore((store) => setCorrelations(store, data.data || []));
		},
		onError: () => {
			setCorrelatedStore((store) => setCorrelations(store, []));
			notifyError({ message: 'Failed to fetch correlations' });
		},
	});

	const {
		mutate: getCorrelationByIdMutation,
		isError: fetchCorrelationIdError,
		isSuccess: fetchCorrelationIdSuccess,
		isLoading: fetchCorrelationIdLoading,
	} = useMutation((correlationId: string) => getCorrelationById(correlationId), {
		onSuccess: (data: any) => {
			data.data.startTime &&
				data.data.endTime &&
				setAppStore((store) =>
					setTimeRange(store, {
						startTime: dayjs(data.data.startTime),
						endTime: dayjs(data.data.endTime),
						type: 'custom',
					}),
				);
			setCorrelatedStore((store) => setCorrelationId(store, data.data.id));
			setCorrelatedStore((store) => setActiveCorrelation(store, data.data));
		},
		onError: () => {
			notifyError({ message: 'Failed to fetch correlation' });
		},
	});

	const { mutate: deleteSavedCorrelationMutation, isLoading: isDeleting } = useMutation(
		(data: { correlationId: string; onSuccess?: () => void }) => deleteSavedCorrelation(data.correlationId),
		{
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				if (variables.correlationId === correlationId) {
					setCorrelatedStore(cleanCorrelationStore);
					setAppStore(syncTimeRange);
				}
				fetchCorrelations();
				setCorrelatedStore((store) => toggleSavedCorrelationsModal(store, false));
				notifySuccess({ message: 'Deleted Successfully' });
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && notifyError({ message: error });
				} else if (data.message && typeof data.message === 'string') {
					notifyError({ message: data.message });
				}
			},
		},
	);

	const { mutate: saveCorrelationMutation, isLoading: isCorrelationSaving } = useMutation(
		(data: { correlationData: any; onSuccess?: () => void }) => saveCorrelation(data.correlationData),
		{
			onSuccess: (data, variables) => {
				variables.onSuccess && variables.onSuccess();
				setCorrelatedStore((store) => setCorrelationId(store, data.data.id));
				setCorrelatedStore((store) => setSavedCorrelationId(store, data.data.id));
				fetchCorrelations();
				notifySuccess({ message: 'Correlation saved successfully' });
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && notifyError({ message: error });
				} else if (data.message && typeof data.message === 'string') {
					notifyError({ message: data.message });
				}
			},
		},
	);

	const { mutate: updateCorrelationMutation, isLoading: isCorrelationUpdating } = useMutation(
		(data: { correlationData: any; onSuccess?: () => void }) => updateCorrelation(data.correlationData),
		{
			onSuccess: (data, variables) => {
				variables.onSuccess && variables.onSuccess();
				setCorrelatedStore((store) => setCorrelationId(store, data.data.id));
				setCorrelatedStore((store) => setActiveCorrelation(store, data.data));
				fetchCorrelations();
				notifySuccess({ message: 'Correlation updated successfully' });
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && data.response) {
					const error = data.response?.data as string;
					typeof error === 'string' && notifyError({ message: error });
				} else if (data.message && typeof data.message === 'string') {
					notifyError({ message: data.message });
				}
			},
		},
	);

	return {
		fetchCorrelationsError,
		fetchCorrelationsSuccess,
		fetchCorrelationsLoading,
		fetchCorrelations,

		deleteSavedCorrelationMutation,
		isDeleting,

		fetchCorrelationIdError,
		fetchCorrelationIdSuccess,
		fetchCorrelationIdLoading,
		getCorrelationByIdMutation,

		saveCorrelationMutation,
		isCorrelationSaving,

		updateCorrelationMutation,
		isCorrelationUpdating,
	};
};
