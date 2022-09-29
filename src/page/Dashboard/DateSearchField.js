import Calendar from "./DateRangeSeletor";
import React from "react";
import RefreshInterval from "./RefreshInterval";

const DateSearchField = ({
  range,
  setStartTime,
  setEndTime,
  startTime,
  endTime,
  setRange,
  getRange,
  interval,
  setInterval,
}) => (
  <div className="flex">
    <div>
      <label htmlFor="location" className="text-label ml-3">
        Search
      </label>
      <div className="flex ml-3">
        <Calendar
          range={range}
          setFromDate={setStartTime}
          setToDate={setEndTime}
          fromDate={startTime}
          toDate={endTime}
          setRange={setRange}
          getRange={getRange}
        />
      </div>
    </div>
    <RefreshInterval
      range={range}
      interval={interval}
      setInterval={setInterval}
    />
  </div>
);

export default DateSearchField;
