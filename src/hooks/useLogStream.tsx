import { useMutation, useQuery } from 'react-query';
import {
	deleteLogStream,
	getLogStreamList,
	createLogStream,
	updateLogStream,
	detectLogStreamSchema,
} from '@/api/logStream';
import { AxiosError, isAxiosError } from 'axios';
import { notifyError, notifySuccess } from '@/utils/notification';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';

type CreateStreamOpts = {
	streamName: string;
	fields: Record<string, string>;
	headers: Record<string, string | boolean>;
	onSuccess: () => void;
};

export const useLogStream = () => {
	const {
		mutate: deleteLogStreamMutation,
		isSuccess: deleteLogStreamIsSuccess,
		isError: deleteLogStreamIsError,
		isLoading: deleteLogStreamIsLoading,
	} = useMutation((data: { deleteStream: string; onSuccess: () => void }) => deleteLogStream(data.deleteStream), {
		onSuccess: (_data, variables) => {
			getLogStreamListRefetch();
			variables.onSuccess && variables.onSuccess();
			notifySuccess({ message: `Stream ${variables.deleteStream} deleted successfully` });
		},
	});

	const {
		mutate: detectLogStreamSchemaMutation,
		isSuccess: detectLogStreamSchemaIsSuccess,
		isError: detectLogStreamSchemaIsError,
		isLoading: detectLogStreamSchemaIsLoading,
	} = useMutation(
		(data: { sampleLogs: any[]; onSuccess: (data: LogStreamSchemaData) => void }) =>
			detectLogStreamSchema(data.sampleLogs),
		{
			onSuccess: (data, variables) => {
				variables.onSuccess && variables.onSuccess(data.data);
				notifySuccess({ message: `Detected schema successfully` });
			},
			onError: (data: AxiosError) => {
				if (isAxiosError(data) && typeof data.message === 'string') {
					notifyError({ message: data.message });
				}
			},
		},
	);

	const {
		mutate: createLogStreamMutation,
		isSuccess: createLogStreamIsSuccess,
		isError: createLogStreamIsError,
		isLoading: createLogStreamIsLoading,
	} = useMutation((data: CreateStreamOpts) => createLogStream(data.streamName, { fields: data.fields }, data.headers), {
		onError: (data: AxiosError) => {
			if (isAxiosError(data) && typeof data.message === 'string') {
				notifyError({ message: data.message });
			}
		},
		onSuccess: (_data, variables) => {
			variables.onSuccess && variables.onSuccess();
			notifySuccess({ message: `Stream ${variables.streamName} created successfully` });
		},
	});

	const {
		data: getLogStreamListData,
		isError: getLogStreamListIsError,
		isSuccess: getLogStreamListIsSuccess,
		isLoading: getLogStreamListIsLoading,
		refetch: getLogStreamListRefetch,
	} = useQuery(
		['fetch-log-stream-list', deleteLogStreamIsSuccess, createLogStreamIsSuccess],
		() => getLogStreamList(),
		{
			retry: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		},
	);

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

	const {
		mutate: updateLogStreamMutation,
		isSuccess: updateLogStreamIsSuccess,
		isError: updateLogStreamIsError,
		isLoading: updateLogStreamIsLoading,
	} = useMutation(
		(data: { streamName: string; header: Record<string, string>; onSuccess: () => void; onError?: () => void }) =>
			updateLogStream(data.streamName, null, { 'x-p-update-stream': true, ...data.header }),
		{
			onError: (data: AxiosError, variables) => {
				variables.onError && variables.onError();
				if (isAxiosError(data) && typeof data.response?.data === 'string') {
					notifyError({ message: data.response.data });
				}
			},
			onSuccess: (_data, variables) => {
				variables.onSuccess && variables.onSuccess();
				notifySuccess({ message: `Stream ${variables.streamName} updated successfully` });
			},
		},
	);

	return {
		deleteLogStreamMutation,
		deleteLogStreamIsSuccess,
		deleteLogStreamIsError,
		deleteLogStreamIsLoading,
		getLogStreamListData,
		getLogStreamListIsError,
		getLogStreamListIsSuccess,
		getLogStreamListIsLoading,
		getLogStreamListRefetch,
		createLogStreamMutation,
		createLogStreamIsSuccess,
		createLogStreamIsError,
		createLogStreamIsLoading,
		updateLogStreamMutation,
		updateLogStreamIsSuccess,
		updateLogStreamIsError,
		updateLogStreamIsLoading,
		detectLogStreamSchemaMutation,
		detectLogStreamSchemaIsSuccess,
		detectLogStreamSchemaIsError,
		detectLogStreamSchemaIsLoading,
	};
};
