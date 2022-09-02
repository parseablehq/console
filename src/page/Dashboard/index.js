import moment from "moment";
import { useState, Fragment, useRef, useCallback, useEffect } from "react";
import Layout from "../../components/Layout";
import SideDialog from "../../components/SideDialog";
import { Listbox, Transition } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Combobox } from "@headlessui/react";
import { CheckIcon, XCircleIcon, SelectorIcon } from "@heroicons/react/solid";
import BeatLoader from "react-spinners/BeatLoader";
import { Menu } from "@headlessui/react";
import {
  useGetLogStream,
  useGetLogStreamSchema,
  useQueryLogs,
} from "../../utils/api";
import "./index.css";
import Field from "./FieldBox";
import Calendar from "./DateRangeSeletor";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function hasSubArray(master, sub) {
  master.sort();
  sub.sort();
  return sub.every(
    (
      (i) => (v) =>
        (i = master.indexOf(v, i) + 1)
    )(0),
  );
}

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
        0,
      ),
    );

    return moment(start);
  };

  const getRange = () => {
    return {
      // "Live tracking": [moment(start), moment(end)],
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
  };

  const [open, setOpen] = useState(false);
  const [clickedRow, setClickedRow] = useState({});
  const [timeZone, setTimeZone] = useState("UTC");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [labelSelected, setLabelSelected] = useState([]);
  const [searchSelected, setSearchSelected] = useState({});
  const [interval, setInterval] = useState(null);
  const [range, setRange] = useState(0);
  const [selectedLogSchema, setSelectedLogSchema] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  // const [dateRangeValues, setDateRangeValues] = useState(getRange);
  const [startTime, setStartTime] = useState(
    getCurrentTime().subtract(10, "minutes"),
    // .utcOffset("+00:00")
    // .format("YYYY-MM-DDThh:mm:ss),
  );

  const addAvailableTags = (label) => {
    if (availableTags.includes(label)) {
      return;
    } else {
      setAvailableTags([...availableTags, label]);
    }
  };

  const [endTime, setEndTime] = useState(getCurrentTime());

  const refreshInterval = [
    {
      name: "1 sec",
      value: 1,
    },
    {
      name: "2 sec",
      value: 2,
    },
    {
      name: "5 sec",
      value: 5,
    },
    {
      name: "10 sec",
      value: 10,
    },
    {
      name: "20 sec",
      value: 20,
    },
    {
      name: "1 min",
      value: 60,
    },
    {
      name: "None",
      value: null,
    },
  ];

  let rangeArr = [
    // "Live tracking",
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
          (field) => field !== "p_metadata" && field !== "p_tags",
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
    },
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

  const timeZoneChange = (e) => {
    setTimeZone(e.target.value);
  };

  const getFilteredArray = (data, searchString, key) => {
    if (!data) {
      return [];
    }
    if (!searchString) {
      return data;
    } else {
      return data.filter((data) =>
        data[key]
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(searchQuery.toLowerCase().replace(/\s+/g, "")),
      );
    }
  };

  const removeTag = (tag) => {
    setSelectedTags([...selectedTags.filter((item) => item !== tag)]);
  };

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
            <div className="flex-1 px-4 flex justify-">
              <div className="flex- flex">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-xs text-gray-700"
                  >
                    Stream
                  </label>
                  <Combobox
                    value={selectedLogStream != null ? selectedLogStream : {}}
                    onChange={(e) => {
                      setSelectedLogStream(e);
                    }}
                  >
                    <div className="relative mt-1">
                      <Combobox.Input
                        className="custom-input custom-focus"
                        displayValue={(stream) =>
                          logStream.isError || !logStream?.data?.data.length
                            ? "No log streams found"
                            : stream.name
                        }
                        onChange={(event) => setQuery(event.target.value)}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <SelectorIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery("")}
                      >
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {getFilteredArray(
                            logStream?.data?.data,
                            query,
                            "name",
                          ).length === 0 && query !== "" ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              No log streams found
                            </div>
                          ) : (
                            getFilteredArray(
                              logStream?.data?.data,
                              query,
                              "name",
                            ).map((stream, index) => (
                              <Combobox.Option
                                key={index}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-bluePrimary text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={stream}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {stream.name}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? "text-white"
                                            : "text-bluePrimary"
                                        }`}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>
                </div>
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-xs ml-3 text-gray-700"
                >
                  Search
                </label>
                <div className="flex items-center ml-3">
                  <Calendar
                    range={range}
                    setFromDate={setStartTime}
                    setToDate={setEndTime}
                    fromDate={startTime}
                    toDate={endTime}
                    setRange={setRange}
                    getRange={getRange}
                  />
                  <Combobox
                    value={searchSelected}
                    onChange={(e) => {
                      setSearchSelected(e);
                      setSearchOpen(true);
                    }}
                  >
                    <div className="relative mt-1">
                      <div className="relative cursor-default w-96">
                        <Combobox.Input
                          className="search-input custom-focus placeholder-iconGrey"
                          // displayValue={(data) => 'Search'}
                          placeholder="Search"
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <SearchIcon
                            className="h-5 w-5 text-iconGrey"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      {/* <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setSearchQuery("")}
                      >
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {getFilteredArray(
                            logQueries?.data?.data,
                            searchQuery,
                            "log",
                          ).length === 0 && searchQuery !== "" ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              Nothing found.
                            </div>
                          ) : (
                            getFilteredArray(
                              logQueries?.data?.data,
                              searchQuery,
                              "log",
                            ) &&
                            getFilteredArray(
                              logQueries?.data?.data,
                              searchQuery,
                              "log",
                            )?.map((data, index) => (
                              <Combobox.Option
                                key={index}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-bluePrimary text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={data}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {data.log}
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active
                                            ? "text-white"
                                            : "text-bluePrimary"
                                        }`}
                                      >
                                        <CheckIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition> */}
                    </div>
                  </Combobox>
                </div>
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-xs text-gray-700 ml-4"
                >
                  Refresh Interval
                </label>
                <Menu as="div" className="relative text-left ml-3 w-40">
                  <Menu.Button
                    disabled={range === 7}
                    className={
                      "custom-input flex disabled:text-gray-300 mt-1 custom-focus text-left"
                    }
                  >
                    <div>
                      {range === 7
                        ? "None"
                        : refreshInterval.find((obj) => obj.value === interval)
                            .name}
                    </div>
                    <SelectorIcon
                      className="h-5 w-5 my-auto mr-0 ml-auto text-gray-400"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                  <Menu.Items
                    className={
                      "absolute left-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    }
                  >
                    {refreshInterval.map((interval) => (
                      <Menu.Item key={interval}>
                        {({ active, selected }) => (
                          <div
                            onClick={() => setInterval(interval.value)}
                            className={`block custom-focus cursor-pointer hover:bg-bluePrimary hover:text-white text-sm font-semibold select-none py-2 px-4 text-gray-700`}
                          >
                            {interval.name}
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>
              </div>

              <div className="ml-3 flex-1">
                <label
                  htmlFor="location"
                  className="block text-xs text-gray-700"
                >
                  Tag filters
                </label>
                <Listbox
                  value={selectedTags}
                  onChange={setSelectedTags}
                  multiple
                >
                  <div className="relative w-full mt-1">
                    <Listbox.Button className="custom-input flex text-left custom-focus">
                      {selectedTags.length > 0
                        ? selectedTags.map((tag) => (
                            <span className="relative block w-min py-px pl-1 pr-6 truncate ml-1 bg-slate-200 rounded-md">
                              {tag}
                              <XCircleIcon
                                onClick={() => removeTag(tag)}
                                className="hover:text-gray-600 transform duration-200 text-gray-700 w-4 absolute top-1 right-1"
                              />
                            </span>
                          ))
                        : "Select Tags"}
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto grid grid-cols-2 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {availableTags.length !== 0 ? (
                          availableTags.map((person, personIdx) => (
                            <Listbox.Option
                              key={personIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 px-2 ${
                                  active
                                    ? "bg-bluePrimary text-white"
                                    : "text-gray-900"
                                }`
                              }
                              value={person}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`flex items-center truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {selected ? (
                                      <div className="w-4 h-4 mr-1 flex items-center justify-center bg-white rounded-sm border-2 border-bluePrimary">
                                        <CheckIcon className="w-3 h-3 font-bold text-bluePrimary" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 mr-1 bg-white rounded-sm border-2 border-gray-400"></div>
                                    )}
                                    {person}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))
                        ) : (
                          <Listbox.Option>Nothing Found</Listbox.Option>
                        )}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>
          </div>

          {/* <DatetimeRangePicker onChange={(e) => console.log('skhd',e)} /> */}

          {/* <div className="w-44">
              <AdvanceDateTimePicker />
            </div> */}

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
                <table className="divide-y min-w-full divide-gray-300">
                  <thead className=" bg-gray-200">
                    <tr className="">
                      {selectedLogSchema?.map((name) => (
                        <th
                          // scope="col"
                          className="px-3 whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          {name}
                        </th>
                      ))}
                      <th
                        // scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Tags
                      </th>
                    </tr>
                  </thead>
                  {logQueries.isLoading &&
                  (!logQueries.data ||
                    !logQueries.data?.data ||
                    logQueries.data?.data?.length === 0) ? (
                    <tbody>
                      <tr align={"center"}>
                        <td
                          colSpan={selectedLogSchema.length}
                          className="py-3 justify-center"
                        >
                          <BeatLoader
                            color={"#1A237E"}
                            loading={logQueries.isLoading}
                            cssOverride={override}
                            size={10}
                          />
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {logQueries?.data?.pages?.map &&
                        logQueries.data.pages.map(
                          (page) =>
                            page?.data?.map &&
                            page?.data?.map(
                              (data, index) =>
                                hasSubArray(
                                  data.p_tags?.split("^"),
                                  selectedTags,
                                ) &&
                                (searchQuery === "" ||
                                  JSON.stringify(data)
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())) && (
                                  <tr
                                    onClick={() => {
                                      console.log(JSON.stringify(data));
                                      setOpen(true);
                                      setClickedRow(data);
                                    }}
                                    className="cursor-pointer hover:bg-slate-100 hover:shadow"
                                    key={index}
                                  >
                                    {selectedLogSchema.map((schema) => (
                                      <td className="truncate text-ellipsis overflow-hidden max-w-200 sm:max-w-xs md:max-w-sm lg:max-w-sm  xl:max-w-md px-3 py-4 text-xs md:text-sm text-gray-700">
                                        {data[schema] || ""}
                                      </td>
                                    ))}
                                    {data.p_tags
                                      ?.split("^")
                                      .forEach((tag) => {
                                        addAvailableTags(tag);
                                      })}
                                  </tr>
                                ),
                            ),
                        )}
                      <tr align={"center"}>
                        <td
                          colSpan={selectedLogSchema.length}
                          className="py-3 justify-center"
                        >
                          <BeatLoader
                            color={"#1A237E"}
                            loading={logQueries.isFetchingNextPage}
                            cssOverride={override}
                            size={10}
                          />
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
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
