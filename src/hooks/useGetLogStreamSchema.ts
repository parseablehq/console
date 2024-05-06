import { LogStreamSchemaData } from '@/@types/parseable/api/stream';
import { getLogStreamSchema } from '@/api/logStream';
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { Field } from '@/@types/parseable/dataType';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useLogsStore, logsStoreReducers } from '@/pages/Logs/providers/LogsProvider';

const {setStreamSchema} = logsStoreReducers;

export const useGetLogStreamSchema = () => {
	const [data, setData] = useMountedState<LogStreamSchemaData | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
	const [currentStream] = useAppStore((store) => store.currentStream);
	const [, setLogsStore] = useLogsStore(_store => null)

	const getDataSchema = async (stream: string | null = currentStream) => {
		try {
			setLoading(true);
			setError(null);
			if (!stream) throw 'Current stream context is missing';

			const res = await getLogStreamSchema(stream);

			switch (res.status) {
				case StatusCodes.OK: {
					const schema = res.data;

					setData(schema);
					setLogsStore(store => setStreamSchema(store, schema))
					break;
				}
				default: {
					setError('Failed to get log schema');
				}
			}
		} catch {
			setError('Failed to get log schema');
		} finally {
			setLoading(false);
		}
	};

	const resetData = () => {
		setData(null);
	};

	const reorderSchemaFields = (destination: number, source: number) => {
		setData((prev) => {
			if (prev != null) {
				if (destination >= prev.fields.length || source >= prev.fields.length) {
					setError('Unable to reorder fields');
					return prev;
				}
				if (destination === source) return prev;

				const newFields: Field[] = [...prev.fields];
				for (let i = 0; i < prev.fields.length; i++) {
					let offset = 0;
					if (source < destination && i >= source && i < destination) offset = 1;
					else if (destination < source && i > destination && i <= source) offset = -1;
					newFields[i] = prev.fields[i + offset];
				}
				newFields[destination] = prev.fields[source];

				return {
					...prev,
					fields: newFields,
				};
			}

			return null;
		});
	};

	return { data, error, loading, getDataSchema, resetData, reorderSchemaFields };
};
