import { FetchTransport, createChannel, createClient } from 'nice-grpc-web';
import { AsyncRecordBatchStreamReader } from '@apache-arrow/ts';

import { type FlightServiceClient, FlightServiceDefinition, FlightData } from '@/assets/arrow';
import useMountedState from './useMountedState';
import { useEffect } from 'react';
import { parseLogData } from '@/utils';

// Function to convert FlightData to a Uint8Array
function flightDataToUint8Array(data: FlightData): Uint8Array {
	const token = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
	const length = new Uint8Array(new Uint32Array([data.dataHeader.length]).buffer);
	return new Uint8Array([...token, ...length, ...data.dataHeader, ...data.dataBody]);
}

// Create a ReadableStream from the async iterable
function createFlightDataReadableStream(dataIterable: AsyncIterable<FlightData>): ReadableStream<Uint8Array> {
	return new ReadableStream<Uint8Array>({
		async start(controller) {
			for await (const flightData of dataIterable) {
				const uint8ArrayData = flightDataToUint8Array(flightData);
				controller.enqueue(uint8ArrayData);
			}
			controller.close(); // Signal the end of the stream
		},
	});
}
let abortController = new AbortController();
export const useDoGetLiveTail = () => {
	const [data, setData] = useMountedState<any[]>([]);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);
	const [search, setSearch] = useMountedState<string>('');
	const [tailData, setTailData] = useMountedState<any[]>([]);

	function livetail(currentStreamName: string, grpcPort: number | null, abortController: AbortController) {
		if (currentStreamName && grpcPort) {
			const grpcUrl = new URL(window.location.origin);
			grpcUrl.port = String(grpcPort);

			const transport = FetchTransport({ credentials: 'include' });
			const channel = createChannel(grpcUrl.origin, transport);
			const client: FlightServiceClient = createClient(FlightServiceDefinition, channel);

			let encoder = new TextEncoder();
			let iter = client.doGet(
				{ ticket: encoder.encode(JSON.stringify({ stream: currentStreamName })) },
				{
					signal: abortController.signal,
				},
			);

			let task = async function () {
				let decoder = await AsyncRecordBatchStreamReader.from(createFlightDataReadableStream(iter));
				for await (const resp of decoder) {
					// setData((prevData) => [resp.toArray()[0].toJSON(), ...prevData.slice(0, 99)]);
					setTailData((prevData) => [...prevData.slice(0, 99), resp.toArray()[0].toJSON()]);
				}
				return 'done';
			};

			task().then((x: any) => {
				console.log(x);
			});
		}
	}

	const doGetLiveTail = async (streamName: string, grpcPort: number) => {
		try {
			setLoading(true);
			setError(null);
			abortController = new AbortController();

			livetail(streamName, grpcPort, abortController);
		} catch {
			setError('Failed to get Alert');
		} finally {
			setLoading(false);
		}
	};

	const abort = () => {
		abortController.abort();
		console.log('Abort');
	};

	useEffect(() => {
		if (search === '') {
			setData(tailData);
		} else {
			const searchText = search.trim().toLowerCase();
			tailData.map((log) => {
				for (const key in log) {
					const logValue = parseLogData(log[key], key);
					if (logValue?.toString().toLowerCase().includes(searchText)) {
						setData((prevData) => [log, ...prevData.slice(0, 99)]);
					}
				}
			});
		}
	}, [search, tailData]);

	const resetData = () => {
		setData([]);
	};

	return { data, error, loading, doGetLiveTail, resetData, setSearch, abort };
};
