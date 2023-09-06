import { getQueryCount } from "@/api/query";
import useMountedState from "./useMountedState";
import { StatusCodes } from 'http-status-codes';
import { LogsQuery } from "@/@types/parseable/api/query";


export const useGetQueryCount = () => {
    const [data, setData] = useMountedState< any | null>(null);
	const [error, setError] = useMountedState<string | null>(null);
	const [loading, setLoading] = useMountedState<boolean>(false);

    const getQueryCountData = async (logsQuery: LogsQuery) => {
        setLoading(true);
        try {
            const res = await getQueryCount(logsQuery);

            switch (res.status) {
				case StatusCodes.OK: {

					setData(res.data);
					break;
				}
				default: {
					setError('Failed to get Query Count');
					console.error(res);
				}
			}

        } catch (error) {
            setError("Failed to get Query Count");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    const resetData = () => {
        setData(null);
    };


    return { data, error, loading, getQueryCountData ,resetData};
}