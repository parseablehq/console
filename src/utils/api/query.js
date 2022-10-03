import { QUERY, QUERY_URL } from "./constants";

import { post } from "./index";
import { useInfiniteQuery } from "@tanstack/react-query";

const queryLogs = (
  streamName,
  startTime,
  endTime,
  signal,
  pageParam,
  logSchema,
) => {
  let dateStream = null;

  for (let index in logSchema) {
    if (
      logSchema[index].includes("date") ||
      logSchema[index].includes("time")
    ) {
      dateStream = logSchema[index];
    }
  }
  return post(
    QUERY_URL,
    {
      query: `select * from ${streamName} ${
        dateStream !== null ? `order by ${dateStream} ` : ""
      }limit 10${pageParam === 1 ? "" : ` offset ${(pageParam - 1) * 10}`}`,
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
  logSchema,
  fn,
  option = {},
) =>
  useInfiniteQuery(
    [QUERY, streamName, logSchema, startTime, endTime],
    async ({ signal, pageParam = 1 }) => {
      await fn();
      return queryLogs(
        streamName,
        startTime,
        endTime,
        signal,
        pageParam,
        logSchema,
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
