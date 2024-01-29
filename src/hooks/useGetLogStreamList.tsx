import { getLogStreamList } from '@/api/logStream';
import { useQuery } from 'react-query';
import { AxiosError, isAxiosError } from 'axios';
import Cookies from 'js-cookie';

export const useGetLogStreamList = () => {
	const logout = () => {
		Cookies.remove('session');
		Cookies.remove('username');
		window.location.reload();
	};

	const {
		data: getLogStreamListData,
		isError: getLogStreamListIsError,
		isSuccess: getLogStreamListIsSuccess,
		isLoading: getLogStreamListIsLoading,
		refetch: getLogStreamListRefetch,
	} = useQuery(['fetch-log-stream-list'], () => getLogStreamList(), {
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && data.response) {
				if (data.response && data.response.status === 401) {
					logout();
				}
			}
		},
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	getLogStreamListData?.data.sort((a, b) => {
		const nameA = a.name.toUpperCase();
		const nameB = b.name.toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});

	return {
		getLogStreamListData,
		getLogStreamListIsError,
		getLogStreamListIsSuccess,
		getLogStreamListIsLoading,
		getLogStreamListRefetch,
	};
};
