import { useQuery } from 'react-query';
import { AxiosResponse } from 'axios';
import { getLogStreamSchema } from '@/api/logStream';
import { LogStreamSchemaData } from '@/@types/parseable/api/stream';

export const useStreamSchema = (stream: string) => {
	const {
		data: streamSchema,
		isError: getStreamSchemaError,
		isSuccess: getStreamSchemaSuccess,
		isLoading: getStreamSchemaLoading,
		refetch: getStreamSchemaRefetch,
	} = useQuery<AxiosResponse<LogStreamSchemaData>, Error>(['fetch-stream-schema', stream], () => getLogStreamSchema(stream), {
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
	return {
		streamSchema,
		getStreamSchemaError,
		getStreamSchemaSuccess,
		getStreamSchemaLoading,
		getStreamSchemaRefetch,
	};
};
