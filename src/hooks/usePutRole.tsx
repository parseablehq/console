import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { putRole } from '@/api/roles';

export const usePutRole = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const putRolePermission = async (roleName: string, permissions: any) => {
		try {
			setLoading(true);
			setError(null);
			const res = await putRole(roleName, permissions);

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					break;
				}
				default: {
					setError('Failed to get Role');
					console.error(res);
				}
			}
		} catch (error) {
			setError('Failed to get Role');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, putRolePermission, resetData };
};
