import { useInfiniteQuery } from "@tanstack/react-query";
import { post } from "./index";
import { QUERY_URL, QUERY } from "./constants";

const queryLogs = async (
  streamName,
  startTime,
  endTime,
  signal,
  pageParam,
  selectedLogSchema,
) => {
  let dateStream = null;

  for (let index in selectedLogSchema) {
    if (
      selectedLogSchema[index].includes("date") ||
      selectedLogSchema[index].includes("time")
    ) {
      dateStream = selectedLogSchema[index];
    }
  }

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

export const useQueryLogs = (
  streamName,
  startTime,
  endTime,
  selectedLogSchema,
  fn,
  option = {},
) =>
  useInfiniteQuery(
    [QUERY, streamName, startTime, endTime],
    async ({ signal, pageParam = 1 }) => {
      await fn();
      return await queryLogs(
        streamName,
        startTime,
        endTime,
        signal,
        pageParam,
        selectedLogSchema,
      );
    },
    {
      ...option,
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return lastPage.data.length !== 0 ? nextPage : undefined;
      },
    },
  );
