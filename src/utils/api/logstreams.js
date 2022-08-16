import { useQuery } from "@tanstack/react-query";
import { get } from "./index";
import { LOG_STREAMS, LOG_STREAMS_URL } from "./constants";

const getLogStream = async () => {
  return await get(LOG_STREAMS_URL);
};

export const useGetLogStream = (option = {}) => useQuery([LOG_STREAMS], getLogStream, option);