import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { getUsers } from '@/api/users';

export const useGetUsers = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getUsersList = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getUsers();

			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					break;
				}
				default: {
					setError('Failed to get Users');
					console.error(res);
				}
			}
		} catch(error) {
			setError('Failed to get Users');
			console.error(error);	
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getUsersList, resetData };
};
