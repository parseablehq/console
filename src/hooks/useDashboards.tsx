import { useMutation, useQuery } from 'react-query';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import Cookies from 'js-cookie';
import _, { isError } from 'lodash';
import { useDashboardsStore, dashboardsStoreReducers } from '@/pages/Dashboards/providers/DashboardsProvider';
import { getDashboards, getQueryData, postDashboard, putDashboard } from '@/api/dashboard';
import { useCallback, useState } from 'react';
import { CreateDashboardType, TileQuery, TileQueryResponse, UpdateDashboardType } from '@/@types/parseable/api/dashboards';

const { setDashboards } = dashboardsStoreReducers;

export const useDashboardsQuery = () => {
	const [, setDashbaordsStore] = useDashboardsStore((_store) => null);

	const username = Cookies.get('username');
	const {
		isError: fetchDashaboardsError,
		isSuccess: fetchDashboardsSuccess,
		isLoading: fetchDashboardsLoading,
		refetch: fetchDashboards,
	} = useQuery(['dashboards'], () => getDashboards(username || ''), {
		retry: false,
		enabled: false, // not on mount
		refetchOnWindowFocus: false,
		onSuccess: (data) => {
			setDashbaordsStore((store) => setDashboards(store, data.data || []));
		},
		// remove debug
		onError: () => {
			setDashbaordsStore((store) => setDashboards(store, []));
		},
	});

	const { mutate: createDashboard, isLoading: isCreatingDashboard } = useMutation(
		(data: { dashboard: CreateDashboardType; onSuccess?: () => void }) => postDashboard(data.dashboard, username || ''),
		{
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				fetchDashboards();
				notifySuccess({ message: 'Created Successfully' });
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

	const { mutate: updateDashboard, isLoading: isUpdatingDashboard } = useMutation(
		(data: { dashboard: UpdateDashboardType; onSuccess?: () => void }) =>
			putDashboard(data.dashboard.dashboard_id, data.dashboard),
		{
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				fetchDashboards();
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

	return {
		fetchDashaboardsError,
		fetchDashboardsSuccess,
		fetchDashboardsLoading,
		fetchDashboards,

		createDashboard,
		isCreatingDashboard,
		updateDashboard,
		isUpdatingDashboard,
	};
};

export const useTileQuery = (opts: { onSuccess: (data: TileQueryResponse) => void }) => {
	const { onSuccess } = opts;
	const [fetchState, setFetchState] = useState<{
		isLoading: boolean;
		isError: null | boolean;
		isSuccess: null | boolean;
	}>({ isLoading: false, isError: null, isSuccess: null });

	const fetchTileData = useCallback(
		async (queryOpts: TileQuery) => {
			try {
				setFetchState({ isLoading: true, isError: null, isSuccess: null });
				const res = await getQueryData(queryOpts);
				onSuccess(res.data);
				setFetchState({ isLoading: false, isError: false, isSuccess: true });
			} catch (e) {
				console.log(e);
				setFetchState({ isLoading: false, isError: true, isSuccess: false });
			}
		},
		[onSuccess],
	);

	return {
		...fetchState,
		fetchTileData,
	};
};
