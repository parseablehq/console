import axios from "axios";

export const getServerURL = () => {
  return "/";
};

export const get = async (url) => {
  return axios.get(getServerURL() + url, {
    headers: {
      Authorization: "Basic " + localStorage.getItem("auth"),
    },
  });
};

export const post = async (url, data, signal) => {
  return axios.post(
    getServerURL() + url,
    data,
    {
      headers: {
        Authorization: "Basic " + localStorage.getItem("auth"),
      },
    },
    { signal },
  );
};

export const getLogStream = async () => {
  return get("api/v1/logstream");
};

export const queryLogs = async (streamName, startTime, endTime) => {
  return post("api/v1/query", {
    query: `select * from ${streamName}`,
    startTime: startTime,
    endTime: endTime,
  });
};

export * from "./logstreams.js";
export * from "./query.js";
