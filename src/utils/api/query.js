import { useQuery } from "@tanstack/react-query";
import { post } from "./index";
import { QUERY_URL, QUERY } from "./constants";

const queryLogs = async (streamName, startTime, endTime, signal) => {
  return await post(
    QUERY_URL,
    {
      query: `select * from ${streamName}`,
      startTime: startTime,
      endTime: endTime,
    },
    { signal },
  );
};

export const useQueryLogs = (streamName, startTime, endTime, fn, option = {}) =>
  useQuery(
    [QUERY, streamName, startTime, endTime],
    async ({ signal }) => {
      await fn();
      return await queryLogs(streamName, startTime, endTime, signal);
    },
    option,
  );
