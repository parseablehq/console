import moment from "moment";
import { useState, Fragment } from "react";
import Layout from "../../components/Layout";
import SideDialog from "../../components/SideDialog";
import { Listbox, Transition } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Combobox } from "@headlessui/react";
import { CheckIcon, XCircleIcon, SelectorIcon } from "@heroicons/react/solid";
import BeatLoader from "react-spinners/BeatLoader";
import { Menu } from "@headlessui/react";
import { useGetLogStream, useQueryLogs } from "../../utils/api";
import "./index.css";
import Picker from "./DateTimeRangePicker";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function hasSubArray(master, sub) {
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
  const [dateRangeValues, setDateRangeValues] = useState(getRange);
  const [startTime, setStartTime] = useState(
    getCurrentTime().subtract(10, "minutes"),
    // .utcOffset("+00:00")
    // .format("YYYY-MM-DDThh:mm:ss),
  );

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

  const logStream = useGetLogStream({ staleTime: 60 * 1000 });
  if (logStream.isSuccess && logStream?.data?.data && !selectedLogStream) {
    setSelectedLogStream(logStream.data.data[0]);
  }

  const logQueries = useQueryLogs(
    selectedLogStream?.name,
    moment(startTime).utcOffset("+00:00").format("YYYY-MM-DDTHH:mm:ssZ"),
    moment(endTime).utcOffset("+00:00").format("YYYY-MM-DDTHH:mm:ssZ"),
    () => {
      if (range < 7) {
        const rangeVal = getRange();
        setDateRangeValues(rangeVal);
        setStartTime(rangeVal[rangeArr[range]][0]);
        setEndTime(rangeVal[rangeArr[range]][1]);
      }
    },
    {
      retry : false,
      enabled: !!(selectedLogStream?.name != null),
      refetchInterval:
        interval === null || range === 7 ? false : interval * 1000,
    },
  );

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

  const clearLabel = (label) => {
    const labelArray = labelSelected;
    const filteredArray = [...labelArray.filter((item) => item !== label)];
    setLabelSelected(filteredArray);
  };

  return (
    <>
      <Layout
        labels={
          logQueries?.data?.data.length > 0 && logQueries?.data?.data[0]?.labels
        }
      >
        <div className="bg-white shadow">
          <div className="sticky top-0 flex-shrink-0 flex h-24 items-center  ">
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
                        displayValue={(stream) => stream.name}
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
                              Nothing found.
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
                  <Picker
                    rangeArr={rangeArr}
                    range={range}
                    setRange={setRange}
                    setStartChange={setStartTime}
                    setEndChange={setEndTime}
                    startDate={startTime}
                    endDate={endTime}
                    dateRangeValues={dateRangeValues}
                    getRange={getRange}
                    setDateRangeValues={setDateRangeValues}
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
                      <Transition
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
                      </Transition>
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
                      <Menu.Item>
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
                  value={labelSelected}
                  onChange={setLabelSelected}
                  multiple
                >
                  <div className="relative w-full mt-1">
                    <Listbox.Button className="custom-input flex text-left custom-focus">
                      {labelSelected.length > 0
                        ? labelSelected.map((label) => (
                            <span className="relative block w-min py-px pl-1 pr-6 truncate ml-1 bg-slate-200 rounded-md">
                              {label}
                              <XCircleIcon
                                onClick={() => clearLabel(label)}
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
                        {Object.keys(
                          logQueries?.data?.data ? logQueries?.data?.data : [],
                        ).length !== 0 ? (
                          logQueries?.data?.data[0].labels
                            ?.split(",")
                            .map((person, personIdx) => (
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

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"></div>
              <table className="min-w-full divide-y divide-gray-300">
                <thead className=" bg-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 flex items-center justify-between  space-x-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      <div>Time</div>

                      <select
                        id="time"
                        name="time"
                        className="mt-1 block pl-3 pr-10 py-1 text-base  bg-gray-200 border-gray-300 focus:outline-none sm:text-sm rounded-md"
                        defaultValue={timeZone}
                        onChange={(e) => timeZoneChange(e)}
                      >
                        <option value="UTC">UTC</option>
                        {/* <option value="GMT">GMT</option> */}
                        <option value="IST">IST</option>
                      </select>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 w-full text-left text-sm font-semibold text-gray-900"
                    >
                      Log
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:block px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tags
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                {logQueries.isFetching &&
                (!logQueries.data ||
                  !logQueries.data?.data ||
                  logQueries.data?.data?.length === 0) ? (
                  <tbody>
                    <tr align={"center"}>
                      <td></td>
                      <td className=" flex py-3 justify-center">
                        <BeatLoader
                          color={"#1A237E"}
                          loading={logQueries.isFetching}
                          cssOverride={override}
                          size={10}
                        />
                        <td></td>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {logQueries?.data?.data?.map &&
                      logQueries?.data?.data?.map(
                        (data, index) =>
                          hasSubArray(
                            data.labels?.split(","),
                            labelSelected,
                          ) && (
                            <tr
                              onClick={() => {
                                setOpen(true);
                                setClickedRow(data);
                              }}
                              className="cursor-pointer hover:bg-slate-100 hover:shadow"
                              key={index}
                            >
                              <td className="whitespace-nowrap py-5 pl-4 pr-3 text-xs md:text-sm font-medium text-gray-900 sm:pl-6">
                                {timeZone === "UTC" || timeZone === "GMT"
                                  ? moment
                                      .utc(data.time)
                                      .format("DD/MM/YYYY, HH:mm")
                                  : moment(data.time)
                                      .utcOffset("+05:30")
                                      .format("DD/MM/YYYY, HH:mm")}
                              </td>
                              <td className="truncate text-ellipsis overflow-hidden max-w-200 sm:max-w-xs md:max-w-sm lg:max-w-sm  xl:max-w-md px-3 py-4 text-xs md:text-sm text-gray-700">
                                {data.log}
                              </td>
                              <td className="hidden xl:flex  whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                {data.labels
                                  ?.split(",")
                                  .filter((tag, index) => index <= 2)
                                  .map((tag, index) => (
                                    <div className="mx-1  bg-slate-200 rounded-sm flex justify-center items-center px-1 py-1">
                                      {tag}
                                    </div>
                                  ))}
                              </td>
                              <td className="hidden lg:flex xl:hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                {data.labels
                                  ?.split(",")
                                  .filter((tag, index) => index <= 1)
                                  .map((tag, index) => (
                                    <div className="mx-1  bg-slate-200 rounded-sm flex justify-center items-center px-1 py-1">
                                      {tag}
                                    </div>
                                  ))}
                              </td>
                            </tr>
                          ),
                      )}
                  </tbody>
                )}
              </table>
            </div>
          </div>
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
