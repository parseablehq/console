import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { getCurrentAbout } from '@/api/about';
import { AboutData } from '@/@types/parseable/api/about';

export const useGetAbout = () => {
	const [data, setData] = useMountedState<AboutData | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getAbout = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getCurrentAbout();

			switch (res.status) {
				case StatusCodes.OK: {
					
					setData(res.data);
					break;
				}
				default: {
					setError('Failed to get ALert');
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

	return { data, error, loading, getAbout, resetData };
};
