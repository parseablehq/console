import { useMutation, useQuery } from 'react-query';
import { notifyError, notifySuccess } from '@/utils/notification';
import { AxiosError, isAxiosError } from 'axios';
import _ from 'lodash';
import { useDashboardsStore, dashboardsStoreReducers } from '@/pages/Dashboards/providers/DashboardsProvider';
import { getDashboards, getQueryData, postDashboard, putDashboard, removeDashboard } from '@/api/dashboard';
import {
	CreateDashboardType,
	Dashboard,
	ImportDashboardType,
	TileQueryResponse,
	UpdateDashboardType,
} from '@/@types/parseable/api/dashboards';
import { useSearchParams } from 'react-router-dom';
import { sanitiseSqlString } from '@/utils/sanitiseSqlString';

const { setDashboards, setTileData, selectDashboard } = dashboardsStoreReducers;

export const useDashboardsQuery = (opts: { updateTimeRange?: (dashboard: Dashboard) => void }) => {
	const [activeDashboard, setDashboardsStore] = useDashboardsStore((store) => store.activeDashboard);
	const [searchParams] = useSearchParams();

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
			setDashboardsStore((store) => setDashboards(store, data.data || [], searchParams.get('id') || ''));
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

export const useTileQuery = (opts: {
	tileId?: string;
	query: string;
	startTime: Date;
	endTime: Date;
	onSuccess?: (data: TileQueryResponse) => void;
	enabled?: boolean;
}) => {
	const [, setDashboardsStore] = useDashboardsStore((_store) => null);
	const { query, startTime, endTime, tileId, enabled = true } = opts;
	const { isLoading, isFetching, isError, refetch } = useQuery(
		[tileId, startTime, endTime],
		() =>
			getQueryData({
				query: sanitiseSqlString(query, false, 100),
				startTime,
				endTime,
			}),
		{
			onSuccess: (res) => {
				const tileData = _.isEmpty(res) ? { records: [], fields: [] } : res.data;
				if (tileId) {
					setDashboardsStore((store) => setTileData(store, tileId, tileData));
				}
				if (opts.onSuccess) {
					opts.onSuccess(tileData);
				}
			},
			onError: (error: AxiosError) => {
				if (isAxiosError(error) && error.response) {
					notifyError({
						message: _.isString(error.response.data) ? error.response.data : 'Unable to fetch tile data',
					});
				}
			},
			refetchOnWindowFocus: false,
			enabled,
		},
	);

	const isLoadingState = isLoading || isFetching;

	return {
		isLoading: isLoadingState,
		isError,
		refetch,
	};
};
