import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { getRole } from '@/api/roles';

export const useGetRole = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getRolePrivilege = async (roleName:string) => {
		try {
			setLoading(true);
			setError(null);
			const res = await getRole(roleName);
            
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
		} catch(error) {
			setError('Failed to get Role');
			console.error(error);	
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getRolePrivilege, resetData };
};
