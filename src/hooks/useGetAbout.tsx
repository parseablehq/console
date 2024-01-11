import { getCurrentAbout } from '@/api/about';
import { useQuery } from 'react-query';
import { notifyApi } from '@/utils/notification';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';

export const useAbout = () => {
	const {
		data: getAboutData,
		isError: getAboutIsError,
		isSuccess: getAboutIsSuccess,
		isLoading: getAboutIsLoading,
	} = useQuery(['fetch-about'], () => getCurrentAbout(), {
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

	return {
		getAboutData,
		getAboutIsError,
		getAboutIsSuccess,
		getAboutIsLoading,
	};
};
