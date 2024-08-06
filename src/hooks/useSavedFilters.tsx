import { useMutation, useQuery } from 'react-query';
import { getSavedFilters, deleteSavedFilter, putSavedFilters, postSavedFilters } from '@/api/logStream';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import { useAppStore, appStoreReducers } from '@/layouts/MainLayout/providers/AppProvider';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { CreateSavedFilterType, SavedFilterType } from '@/@types/parseable/api/savedFilters';
import { useLogsStore, logsStoreReducers } from '@/pages/Stream/providers/LogsProvider';
const { setSavedFilters } = appStoreReducers;
const { updateSavedFilterId } = logsStoreReducers;

const useSavedFiltersQuery = () => {
	const [, setAppStore] = useAppStore((_store) => null);
	const [, setLogsStore] = useLogsStore((_store) => null);
	const username = Cookies.get('username');
	const { isError, isSuccess, isLoading, refetch } = useQuery(
		['saved-filters'],
		() => getSavedFilters(username || ''),
		{
			retry: false,
			enabled: false, // not on mount
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setAppStore((store) => setSavedFilters(store, data));
			},
		},
	);

	const { mutate: updateSavedFilters, isLoading: isUpdating } = useMutation(
		(data: { filter: SavedFilterType; onSuccess?: () => void }) =>
			putSavedFilters(data.filter.filter_id, data.filter),
		{
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				refetch();
				notifySuccess({ message: 'Updated Successfully' });
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

	const { mutate: createSavedFilters, isLoading: isCreating } = useMutation(
		(data: { filter: CreateSavedFilterType; onSuccess?: () => void }) =>
			postSavedFilters(data.filter),
		{
			onSuccess: (data, variables) => {
				variables.onSuccess && variables.onSuccess();
				setLogsStore((store) => updateSavedFilterId(store, data.data.filter_id));
				refetch();
				notifySuccess({ message: 'Updated Successfully' });
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

	const { mutate: deleteSavedFilterMutation, isLoading: isDeleting } = useMutation(
		(data: { filter_id: string; onSuccess?: () => void; onError?: () => void }) =>
			deleteSavedFilter(data.filter_id),
		{
			onSuccess: (_data, variables) => {
				setLogsStore((store) => updateSavedFilterId(store, null));
				refetch();
				variables.onSuccess && variables.onSuccess();
				notifySuccess({ message: 'Updated Successfully' });
			},
			onError: (data: AxiosError, variables) => {
				variables.onError && variables.onError()
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
		isError,
		isSuccess,
		isLoading,
		refetch,
		updateSavedFilters,
		deleteSavedFilterMutation,
		createSavedFilters,
		isDeleting,
		isUpdating,
		isCreating
	};
};

export default useSavedFiltersQuery;
