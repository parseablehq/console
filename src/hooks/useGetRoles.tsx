import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { getRoles } from '@/api/roles';

export const useGetRoles = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getRolesList = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getRoles();

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					break;
				}
				default: {
					setError('Failed to get Roles');
					console.error(res);
				}
			}
		} catch(error) {
			setError('Failed to get Roles');
			console.error(error);	
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getRolesList, resetData };
};
