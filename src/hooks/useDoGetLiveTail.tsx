import { FetchTransport, createChannel, createClient } from 'nice-grpc-web';
import { AsyncRecordBatchStreamReader } from '@apache-arrow/ts';
import { FlightServiceDefinition, FlightData } from '@/assets/arrow';
import useMountedState from './useMountedState';
import { useEffect, useRef } from 'react';
import { LogStreamData } from '@/@types/parseable/api/stream';
import { useLogsStore, logsStoreReducers } from '@/pages/Logs/providers/LogsProvider';

const { resetLiveTailSearchState } = logsStoreReducers;
const TOTAL_LOGS_TO_SHOW = 500;

function flightDataToUint8Array(data: FlightData): Uint8Array {
	const token = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
	const length = new Uint8Array(new Uint32Array([data.dataHeader.length]).buffer);
	return new Uint8Array([...token, ...length, ...data.dataHeader, ...data.dataBody]);
}

function createFlightDataReadableStream(dataIterable: AsyncIterable<FlightData>): ReadableStream<Uint8Array> {
	return new ReadableStream<Uint8Array>({
		async start(controller) {
			for await (const flightData of dataIterable) {
				controller.enqueue(flightDataToUint8Array(flightData));
			}
			controller.close();
		},
	});
}

export const useDoGetLiveTail = () => {
	const [data, setData] = useMountedState<any[]>([]);
	const [finalData, setFinalData] = useMountedState<any[]>([]);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
	const [schema, setSchema] = useMountedState<LogStreamData>([]);
	const [field, setField] = useMountedState<string>('');
	const [search, setSearch] = useMountedState<string>('');
	const [{ liveTailSearchField, liveTailSearchValue }, setLogsStore] = useLogsStore((store) => store.liveTailConfig);
	const abortControllerRef = useRef(new AbortController());

	// Handles initiating the live tail stream
	const livetail = (currentStreamName: string, grpcPort: number | null, abortController: AbortController) => {
		if (!currentStreamName || !grpcPort) return;

		const grpcUrl = new URL(window.location.origin);
		grpcUrl.port = String(grpcPort);

		const transport = FetchTransport({ credentials: 'include' });
		const channel = createChannel(grpcUrl.origin, transport);
		const client = createClient(FlightServiceDefinition, channel);

		const encoder = new TextEncoder();
		const iter = client.doGet(
			{ ticket: encoder.encode(JSON.stringify({ stream: currentStreamName })) },
			{ signal: abortController.signal },
		);

		(async () => {
			try {
				const decoder = await AsyncRecordBatchStreamReader.from(createFlightDataReadableStream(iter));
				setSchema((await decoder.open()).schema.fields);

				let batchCount = 0;
				for await (const resp of decoder) {
					batchCount++;
					if (batchCount == 1) {
						setLoading(true);
					}

					await new Promise((resolve) => setTimeout(resolve, 600));

					if (abortController.signal.aborted) {
						break;
					}

					if (data.length > TOTAL_LOGS_TO_SHOW) {
						data.pop();
					}
					if (resp.toArray()[0]?.toJSON()) {
						setData((prevData) => [resp.toArray()[0]?.toJSON(), ...prevData.slice(0, TOTAL_LOGS_TO_SHOW)]);
					}
				}
				setLoading(false);
			} catch (e) {
				setLoading(false);
				setError('Failed to get data');
			} finally {
				setLoading(false);
			}
			setLoading(false);
		})();
	};

	// Starts the live tail
	const doGetLiveTail = (streamName: string, grpcPort: number | null) => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();
		livetail(streamName, grpcPort, abortControllerRef.current);
	};

	const abort = () => {
		abortControllerRef.current.abort();
	};

	const resetData = () => setData([]);

	useEffect(() => {
		setSearch(liveTailSearchValue);
		setField(liveTailSearchField);
	}, [liveTailSearchField, liveTailSearchField]);

	useEffect(() => {
		if (field && search) {
			setFinalData(
				data.filter((item) => {
					const fieldValue = item[field.toLowerCase()];
					return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(search.toLowerCase());
				}),
			);
		} else {
			setFinalData(data);
		}
	}, [field, search, data]);

	useEffect(() => {
		setLogsStore((store) => resetLiveTailSearchState(store));
		return () => {
			abortControllerRef.current.abort();
		};
	}, []);

	return { finalData, error, loading, doGetLiveTail, resetData, abort, schema };
};
