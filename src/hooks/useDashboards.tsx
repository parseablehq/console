import { useMutation, useQuery } from 'react-query';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import _ from 'lodash';
import { useDashboardsStore, dashboardsStoreReducers } from '@/pages/Dashboards/providers/DashboardsProvider';
import { getDashboards, getQueryData, postDashboard, putDashboard, removeDashboard } from '@/api/dashboard';
import { useCallback, useState } from 'react';
import {
	CreateDashboardType,
	Dashboard,
	ImportDashboardType,
	TileQuery,
	TileQueryResponse,
	UpdateDashboardType,
} from '@/@types/parseable/api/dashboards';

const { setDashboards, setTileData, selectDashboard } = dashboardsStoreReducers;

export const useDashboardsQuery = (opts: { updateTimeRange?: (dashboard: Dashboard) => void }) => {
	const [activeDashboard, setDashboardsStore] = useDashboardsStore((store) => store.activeDashboard);

	const {
		isError: fetchDashaboardsError,
		isSuccess: fetchDashboardsSuccess,
		isLoading: fetchDashboardsLoading,
		refetch: fetchDashboards,
	} = useQuery(['dashboards'], () => getDashboards(), {
		retry: false,
		enabled: false, // not on mount
		refetchOnWindowFocus: false,
		onSuccess: (data) => {
			const firstDashboard = _.head(data.data);
			if (!activeDashboard && firstDashboard && opts.updateTimeRange) {
				opts.updateTimeRange(firstDashboard);
			}
			setDashboardsStore((store) => setDashboards(store, data.data || []));
		},
		onError: () => {
			setDashboardsStore((store) => setDashboards(store, []));
		},
	});

	const { mutate: createDashboard, isLoading: isCreatingDashboard } = useMutation(
		(data: { dashboard: CreateDashboardType; onSuccess?: () => void }) => postDashboard(data.dashboard),
		{
			onSuccess: (response, variables) => {
				const { dashboard_id } = response.data;
				if (_.isString(dashboard_id) && !_.isEmpty(dashboard_id)) {
					setDashboardsStore((store) => selectDashboard(store, null, response.data));
				}
				fetchDashboards();
				variables.onSuccess && variables.onSuccess();
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

	const { mutate: importDashboard, isLoading: isImportingDashboard } = useMutation(
		(data: { dashboard: ImportDashboardType; onSuccess?: () => void }) => postDashboard(data.dashboard),
		{
			onSuccess: (response, variables) => {
				const { dashboard_id } = response.data;
				if (_.isString(dashboard_id) && !_.isEmpty(dashboard_id)) {
					setDashboardsStore((store) => selectDashboard(store, null, response.data));
				}
				fetchDashboards();
				variables.onSuccess && variables.onSuccess();
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
		(data: { dashboard: UpdateDashboardType; onSuccess?: () => void }) => {
			return putDashboard(data.dashboard.dashboard_id, data.dashboard);
		},
		{
			onSuccess: (_data, variables) => {
				fetchDashboards();
				variables.onSuccess && variables.onSuccess();
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

	const { mutate: deleteDashboard, isLoading: isDeleting } = useMutation(
		(data: { dashboardId: string; onSuccess?: () => void }) => removeDashboard(data.dashboardId),
		{
			onSuccess: (_data, variables) => {
				fetchDashboards().then(() => {
					variables.onSuccess && variables.onSuccess();
				});
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

	return {
		fetchDashaboardsError,
		fetchDashboardsSuccess,
		fetchDashboardsLoading,
		fetchDashboards,

		createDashboard,
		isCreatingDashboard,
		updateDashboard,
		isUpdatingDashboard,
		importDashboard,
		isImportingDashboard,

		deleteDashboard,
		isDeleting,
	};
};

export const useTileQuery = (opts?: { tileId?: string; onSuccess?: (data: TileQueryResponse) => void }) => {
	const [, setDashboardsStore] = useDashboardsStore((_store) => null);
	const { onSuccess } = opts || {};
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
				const tileData = _.isEmpty(res) ? { records: [], fields: [] } : res.data;
				opts?.tileId && setDashboardsStore((store) => setTileData(store, opts.tileId || '', tileData));
				opts?.onSuccess && opts.onSuccess(tileData);
				setFetchState({ isLoading: false, isError: false, isSuccess: true });
			} catch (e: any) {
				setFetchState({ isLoading: false, isError: true, isSuccess: false });
				notifyError({ message: _.isString(e.response.data) ? e.response.data : 'Unable to fetch tile data' });
			}
		},
		[onSuccess],
	);

	return {
		...fetchState,
		fetchTileData,
	};
};
