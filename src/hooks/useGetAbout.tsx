import { getCurrentAbout } from '@/api/about';
import { useQuery } from 'react-query';

export const useAbout = () => {
	const {
		data: getAboutData,
		isError: getAboutIsError,
		isSuccess: getAboutIsSuccess,
		isLoading: getAboutIsLoading,
	} = useQuery(['fetch-about'], () => getCurrentAbout(), {
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
