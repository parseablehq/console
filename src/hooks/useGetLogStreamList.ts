import { LogStreamData } from '@/@types/parseable/api/stream';

import { getLogStreamList } from '@/api/logStream';
import { StatusCodes } from 'http-status-codes';
import { useEffect } from 'react';
import useMountedState from './useMountedState';

export const useGetLogStreamList = () => {
	const [data, setData] = useMountedState<LogStreamData | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

	const getData = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await getLogStreamList();

			switch (res.status) {
				case StatusCodes.OK: {
					const streams = res.data;

					setData(streams);
					break;
				}
				default: {
					setError('Something went wrong!.');
				}
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	return { data, error, loading };
};
