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
import Layout from "../../components/Layout";
import RefreshInterval from "./RefreshInterval";
import SearchableDropdown from "../../components/SearchableDropdown";
import SideDialog from "../../components/SideDialog";
import Table from "./Table";
import TagFilters from "./TagFilters";
import moment from "moment";

const Dashboard = () => {
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
        getCurrentTime(),
      ],
      "Past 1 Hour": [
        getCurrentTime().subtract(60, "minutes"),
        getCurrentTime(),
      ],
      "Past 5 Hours": [getCurrentTime().subtract(5, "hours"), getCurrentTime()],
      "Past 24 Hours": [
        getCurrentTime().subtract(24, "hours"),
        getCurrentTime(),
      ],
      "Past 3 Days": [getCurrentTime().subtract(3, "days"), getCurrentTime()],
      "Past 7 Days": [getCurrentTime().subtract(7, "days"), getCurrentTime()],
      "Past 2 Months": [
        getCurrentTime().subtract(2, "months"),
        getCurrentTime(),
      ],
    };
  }

  const [open, setOpen] = useState(false);
  const [clickedRow, setClickedRow] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSelected, setSearchSelected] = useState({});
  const [interval, setInterval] = useState(null);
  const [range, setRange] = useState(0);
  const [selectedLogSchema, setSelectedLogSchema] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
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

  const [endTime, setEndTime] = useState(getCurrentTime());

  let rangeArr = [
    "Past 10 Minutes",
    "Past 1 Hour",
    "Past 5 Hours",
    "Past 24 Hours",
    "Past 3 Days",
    "Past 7 Days",
    "Past 2 Months",
  ];

  const [selectedLogStream, setSelectedLogStream] = useState(null);

  const logStream = useGetLogStream({
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setSelectedLogStream(data.data[0]);
    },
  });

  const logStreamSchema = useGetLogStreamSchema(selectedLogStream?.name, {
    retry: false,
    enabled: !!(selectedLogStream?.name != null),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const allFields = data.data.fields.map((field) => {
        return field.name;
      });

      setSelectedLogSchema([
        ...allFields.filter(
          (field) => field !== "p_metadata" && field !== "p_tags"
        ),
      ]);
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
      if (range < 7) {
        const rangeVal = getRange();
        setStartTime(rangeVal[rangeArr[range]][0]);
        setEndTime(rangeVal[rangeArr[range]][1]);
      }
    },
    {
      onSuccess: () => {
        setSelectedTags([]);
        setAvailableTags([]);
      },
      retry: false,
      enabled:
        !!(
          logStreamSchema?.data?.data?.fields?.map((field) => {
            return field.name;
          })?.length !== 0
        ) && !!(selectedLogStream?.name != null),
      refetchOnWindowFocus: false,
      refetchInterval:
        interval === null || range === 7 ? false : interval * 1000,
    }
  );

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

  return (
    <>
      <Layout
        labels={
          logQueries?.data?.data?.length > 0 &&
          logQueries?.data?.data[0]?.labels
        }
      >
        <div className="">
          <div className="sticky bg-white border top-0 flex-shrink-0 flex h-24 items-center  ">
            <div className="flex-1 px-4 flex justify-center">
              <SearchableDropdown
                label={"Streams"}
                data={
                  logStream?.data?.data != null ? logStream?.data?.data : []
                }
                setValue={setSelectedLogStream}
                value={selectedLogStream}
              />
              <DateSearchField
                range={range}
                setStartTime={setStartTime}
                setEndTime={setStartTime}
                startTime={startTime}
                endTime={endTime}
                setRange={setRange}
                getRange={getRange}
                searchSelected={searchSelected}
                setSearchSelected={setSearchSelected}
                setSearchOpen={setSearchOpen}
                setSearchQuery={setSearchQuery}
              />
              <RefreshInterval
                range={range}
                interval={interval}
                setInterval={setInterval}
              />
              <Filters />
            </div>
          </div>

          <div className="overflow-auto">
            <div className="flex min-w-full">
              <div className=" min-w-[16rem]">
                <Field
                  logStreamSchema={logStreamSchema}
                  setSelectedLogSchema={setSelectedLogSchema}
                  selectedLogSchema={selectedLogSchema}
                />
              </div>

              <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"></div>

              <div className="overflow-x-scroll flex-1 ">
                <Table
                  selectedLogSchema={selectedLogSchema}
                  logQueries={logQueries}
                  selectedTags={selectedTags}
                  searchQuery={searchQuery}
                  setOpen={setOpen}
                  setClickedRow={setClickedRow}
                  addAvailableTags={addAvailableTags}
                />
              </div>
            </div>
          </div>
          {logStream.isError || !logStream?.data?.data.length ? (
            <div
              style={{ transform: "translateX(-50%) translateY(-50%)" }}
              className="absolute -z-10 font-semibold text-gray-500 left-1/2 top-80"
            >
              Please create a log stream first to search logs. Refer to the
              documentation{" "}
              <a
                rel="noreferrer"
                target={"_blank"}
                className="text-blue-500 hover:underline"
                href="https://www.parseable.io/docs/intro"
              >
                here
              </a>
              .
            </div>
          ) : (
            <></>
          )}
        </div>

        {Object.keys(searchSelected).length !== 0 && (
          <SideDialog
            open={searchOpen}
            setOpen={setSearchOpen}
            data={searchSelected}
          />
        )}

        <SideDialog open={open} setOpen={setOpen} data={clickedRow} />
      </Layout>
    </>
  );
};

export default Dashboard;
