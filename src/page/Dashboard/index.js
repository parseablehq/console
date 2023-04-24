import "./index.css";

import React, { useEffect, useState } from "react";
import {
  useGetLogStream,
  useGetLogStreamSchema,
  useQueryLogs,
} from "../../utils/api";

import DateSearchField from "./DateSearchField";
import Field from "./FieldBox";
import Filters from "./Filters";
import SearchableDropdown from "../../components/SearchableDropdown";
import SideDialog from "../../components/SideDialog";
import Table from "./Table";
import moment from "moment";

const getCurrentTime = () => {
  let now = new Date();
  let start = moment(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0,
      0
    )
  );

  return moment(start);
};

function getRange() {
  return {
    "Past 10 Minutes": [
      getCurrentTime().subtract(10, "minutes"),
      getCurrentTime().add(1, "minutes"),
    ],
    "Past 1 Hour": [getCurrentTime().subtract(60, "minutes"), getCurrentTime().add(1, "minutes")],
    "Past 5 Hours": [getCurrentTime().subtract(5, "hours"), getCurrentTime().add(1, "minutes")],
    "Past 24 Hours": [getCurrentTime().subtract(24, "hours"), getCurrentTime().add(1, "minutes")],
    "Past 3 Days": [getCurrentTime().subtract(3, "days"), getCurrentTime().add(1, "minutes")],
    "Past 7 Days": [getCurrentTime().subtract(7, "days"), getCurrentTime().add(1, "minutes")],
    "Past 2 Months": [getCurrentTime().subtract(2, "months"), getCurrentTime().add(1, "minutes")],
  };
}

let rangeArr = [
  "Past 10 Minutes",
  "Past 1 Hour",
  "Past 5 Hours",
  "Past 24 Hours",
  "Past 3 Days",
  "Past 7 Days",
  "Past 2 Months",
];

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [clickedRow, setClickedRow] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [interval, setInterval] = useState(null);
  const [range, setRange] = useState(0);
  const [selectedLogSchema, setSelectedLogSchema] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableMeta, setAvailableMeta] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedMeta, setSelectedMeta] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filters, setFilters] = useState([]);
  const [startTime, setStartTime] = useState(
    getCurrentTime().subtract(10, "minutes")
  );

  function addAvailableTags(label) {
    if (availableTags.includes(label)) {
      return;
    } else {
      setAvailableTags([...availableTags, label]);
    }
  }

  function addAvailableMeta(label) {
    if (availableMeta.includes(label)) {
      return;
    } else {
      setAvailableMeta([...availableMeta, label]);
    }
  }

  const [endTime, setEndTime] = useState(getCurrentTime());

  const [selectedLogStream, setSelectedLogStream] = useState(null);

  const logStream = useGetLogStream({
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setSelectedLogStream(data.data[0]);
      setSelectedTags([]);
      setAvailableTags([]);
      setAvailableMeta([]);
      setSelectedFilters([]);
      setSelectedMeta([]);
    },
  });

  const logStreamSchema = useGetLogStreamSchema(selectedLogStream?.name, {
    retry: false,
    enabled: Boolean(selectedLogStream?.name != null),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data.data.fields) {
        const allFields = data.data.fields.map((field) => {
          return field.name;
        });

        setSelectedLogSchema([
          ...allFields.filter(
            (field) => field !== "p_metadata" && field !== "p_tags"
          ),
        ]);
      } else {
        setSelectedLogSchema([]);
      }
    },
  });

  const logQueries = useQueryLogs(
    selectedLogStream?.name,
    moment(startTime).utcOffset("+00:00").format("YYYY-MM-DDTHH:mm:ssZ"),
    moment(endTime).utcOffset("+00:00").format("YYYY-MM-DDTHH:mm:ssZ"),
    logStreamSchema?.data?.data?.fields?.map((field) => {
      return field.name;
    }),
    () => {
      if (range < 7 && interval) {
        const rangeVal = getRange();
        setStartTime(rangeVal[rangeArr[range]][0]);
        setEndTime(rangeVal[rangeArr[range]][1]);
      }
    },
    {
      retry: false,
      enabled:
        Boolean(
          logStreamSchema?.data?.data?.fields?.map((field) => {
            return field.name;
          })?.length !== 0
        ) && Boolean(selectedLogStream?.name != null),
      refetchOnWindowFocus: false,
      refetchInterval:
        interval === null || range === 7 ? false : interval * 1000,
    }
  );

  function getData(logQueriesData) {
    let dataSet = [];
    logQueriesData?.data?.pages?.forEach &&
      logQueriesData?.data?.pages?.data?.forEach((element) => {
        dataSet = [...dataSet, element];
      });

    return dataSet;
  }

  const { fetchNextPage } = logQueries;

  useEffect(() => {
    let fetching = false;
    const handleScroll = async (e) => {
      const { scrollHeight, scrollTop, clientHeight } =
        e.target.scrollingElement;
      if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.2) {
        fetching = true;
        await fetchNextPage();
        fetching = false;
      }
    };
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [fetchNextPage]);

  function removeTag(tag) {
    setSelectedTags([...selectedTags.filter((item) => item !== tag)]);
  }

  function removeMeta(tag) {
    setSelectedMeta([...selectedMeta.filter((item) => item !== tag)]);
  }

  function removeFilter(column, contains, query) {
    setSelectedFilters([
      ...selectedFilters.filter(
        (item) =>
          !(
            item.column === column &&
            item.contains === contains &&
            item.query === query
          )
      ),
    ]);
  }

  function addTag(tag) {
    setSelectedTags([...selectedTags, tag]);
  }

  function addFilter(filter) {
    setSelectedFilters([...selectedFilters, filter]);
  }

  function addMeta(tag) {
    setSelectedMeta([...selectedMeta, tag]);
  }

  return (
    <>
      <div className="bg-primary">
        <div className="sticky top-0 h-screen">
          <Field
            logStreamSchema={logStreamSchema}
            setSelectedLogSchema={setSelectedLogSchema}
            selectedLogSchema={selectedLogSchema}
            availableTags={availableTags}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="sticky z-10 bg-white border px-4 top-0 flex-shrink-0 flex h-24 items-center  ">
          <SearchableDropdown
            label={"Streams"}
            data={logStream?.data?.data != null ? logStream?.data?.data : []}
            setValue={setSelectedLogStream}
            value={selectedLogStream}
          />
          <DateSearchField
            range={range}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
            startTime={startTime}
            endTime={endTime}
            setRange={setRange}
            getRange={getRange}
            logQueries={logQueries}
            interval={interval}
            setInterval={setInterval}
          />
          <Filters
            filter={filters}
            setFilters={setFilters}
            schema={logStreamSchema?.data?.data}
            data={getData(logQueries)}
            availableTags={availableTags}
            availableMeta={availableMeta}
            removeTag={removeTag}
            removeMeta={removeMeta}
            addTag={addTag}
            addMeta={addMeta}
            addFilter={addFilter}
            removeFilter={removeFilter}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="overflow-x-auto min-w-0">
          <Table
            selectedLogSchema={selectedLogSchema}
            logQueries={logQueries}
            selectedTags={selectedTags}
            searchQuery={searchQuery}
            setOpen={setOpen}
            setClickedRow={setClickedRow}
            addAvailableTags={addAvailableTags}
            addAvailableMeta={addAvailableMeta}
            selectedMeta={selectedMeta}
            selectedFilters={selectedFilters}
            hideError={
              logStreamSchema.isError ||
              logStream.isError ||
              !logStreamSchema?.data?.data
            }
          />
        </div>

        {!logStream.isLoading &&
          (logStream.isError || !logStream?.data?.data.length) ? (
          <div
            style={{ transform: "translateX(-50%) translateY(-50%)" }}
            className="absolute font-semibold text-gray-500 left-1/2 top-80"
          >
            Please create a log stream first to search logs. Refer to the
            documentation{" "}
            <a
              rel="noreferrer"
              target={"_blank"}
              className="text-blue-500 hover:underline"
              href="https://www.parseable.io/docs/introduction"
            >
              here
            </a>
            .
          </div>
        ) : (
          <></>
        )}

        {!logStreamSchema.isLoading &&
          !logStreamSchema.isFetching &&
          (logStreamSchema.isError || !logStreamSchema?.data?.data) ? (
          <div
            style={{ transform: "translateX(-50%) translateY(-50%)" }}
            className="absolute font-semibold text-gray-500 left-1/2 top-80"
          >
            <p>
              No events found, please send data to this stream before query. Refer to the documentation{" "}
              <a
                rel="noreferrer"
                target={"_blank"}
                className="text-blue-500 hover:underline"
                href="https://www.parseable.io/docs/category/log-ingestion"
              >
                here
              </a>
            </p>
            .
          </div>
        ) : (
          <></>
        )}
      </div>

      <SideDialog open={open} setOpen={setOpen} data={clickedRow} />
    </>
  );
};

export default Dashboard;
