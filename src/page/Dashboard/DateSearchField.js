import Calendar from "./DateRangeSeletor";
import { Combobox } from "@headlessui/react";
import React from "react";
import { SearchIcon } from "@heroicons/react/solid";

const DateSearchField = ({
  range,
  setStartTime,
  setEndTime,
  startTime,
  endTime,
  setRange,
  getRange,
  searchSelected,
  setSearchSelected,
  setSearchOpen,
  setSearchQuery,
}) => (
  <div>
    <label htmlFor="location" className="text-label ml-3">
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
        onChange={function (e) {
          setSearchSelected(e);
          setSearchOpen(true);
        }}
      >
        <div className="relative mt-1">
          <div className="relative cursor-default w-96">
            <Combobox.Input
              className="input rounded-l-none placeholder-iconGrey"
              // displayValue={(data) => 'Search'}
              placeholder="Search"
              onChange={function (e) {
                setSearchQuery(e.target.value);
              }}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <SearchIcon
                className="h-5 w-5 text-iconGrey"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
        </div>
      </Combobox>
    </div>
  </div>
);

export default DateSearchField;
