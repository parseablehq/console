import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { getUserRoles } from '@/api/users';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '@/constants/routes';

export const useGetUserRole = () => {
	const [data, setData] = useMountedState<any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
	const navigate = useNavigate();

	const getRoles = async (userName:string) => {
		try {
			setLoading(true);
			setError(null);
			const res = await getUserRoles(userName);
			switch (res.status) {
				case StatusCodes.OK: {
					let  result:any[]=[]
					for (var prop in res.data ) {
						result=[...result,...res.data[prop]]
					}
					setData(result);
					break;
				}
				case StatusCodes.UNAUTHORIZED: {
					setError('Unauthorized');
					navigate(
						{
							pathname: LOGIN_ROUTE,
						},
						{ replace: true },
					);

					break;
				}
				default: {
					setError('Failed to get Roles');
					console.error(res);
				}
			}
		} catch(error) {
			setError('Failed to get ALert');
			console.error(error);	
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, getRoles, resetData };
};
