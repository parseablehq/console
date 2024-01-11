import { getLogStreamList } from '@/api/logStream';
import { useQuery } from 'react-query';
import { IconFileAlert, IconCheck } from '@tabler/icons-react';
import { notifyApi } from '@/utils/notification';

export const useGetLogStreamList = () => {
	const {
		data: getLogStreamListData,
		isError: getLogStreamListIsError,
		isSuccess: getLogStreamListIsSuccess,
		isLoading: getLogStreamListIsLoading,
		refetch: getLogStreamListRefetch,
	} = useQuery(['fetch-log-stream-list'], () => getLogStreamList(), {
		onError: () => {
			notifyApi({
				color: 'red',
				message: 'Failed to get log streams alert',
				icon: <IconFileAlert size="1rem" />,
			});
		},
		onSuccess: () => {
			notifyApi({
				color: 'green',
				title: 'Streams was loaded',
				message: 'Successfully Loaded',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
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
