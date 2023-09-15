import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFileAlert } from '@tabler/icons-react';
import { postLLM } from '@/api/llm';


// this used to call ai query api
export const usePostLLM = () => {
	const [data, setData] = useMountedState<string | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);


	// this function is used to call ai query api
	const postLLMQuery = async (prompt: string, stream: string) => {
		try {
			setLoading(true);
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Genrating Query',
				message: 'Query will be genrated using AI.',
				autoClose: false,
				withCloseButton: false,
			});
			setError(null);
			const res = await postLLM(prompt, stream);
			switch (res.status) {
				case StatusCodes.OK: {
					setData(res.data);
					notifications.update({
						id: 'load-data',
						color: 'green',
						title: 'Query Genrated',
						message: 'Query Genrated Successfully',
						icon: <IconCheck size="1rem" />,
						autoClose: 3000,
					});
					break;
				}
				default: {
					setError(res.data);
					console.error(res);
					notifications.update({
						id: 'load-data',
						color: 'red',
						title: 'Error occurred',
						message: res.data,
						icon: <IconFileAlert size="1rem" />,
						autoClose: 2000,
					});
				}
			}
		} catch (error) {
			setError('Failed to get create user');
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error occurred',
				message: 'Error occurred while genrating query',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	//reset data
	const resetData = () => {
		setData(null);
	};

	return { data, error, loading, postLLMQuery, resetData };
};
