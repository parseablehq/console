import Calendar from "./DateRangeSeletor";
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
  setSearchQuery,
}) => (
  <div className="flex-1">
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

      <div className="relative mt-1 flex-1">
        <div className="relative cursor-default">
          <input
            className="input rounded-l-none placeholder-iconGrey"
            // displayValue={(data) => 'Search'}
            placeholder="Search"
            onChange={function (e) {
              setSearchQuery(e.target.value);
            }}
          />
          <button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <SearchIcon className="h-5 w-5 text-iconGrey" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DateSearchField;
