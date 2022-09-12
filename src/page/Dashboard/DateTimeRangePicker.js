import "./DateTimeRangePicker.css";

import { CalendarIcon } from "@heroicons/react/outline";
import DateTimeRangeContainer from "react-advanced-datetimerange-picker";
import React from "react";
import moment from "moment";

let local = {
  format: "DD-MM-YYYY HH:mm",
  sundayFirst: false,
};

const Picker = ({
  setStartChange,
  setEndChange,
  range,
  setRange,
  rangeArr,
  endDate,
  startDate,
  dateRangeValues,
  getRange,
  setDateRangeValues,
}) => {
  const [isRangeSelected, setIsRangeSelected] = React.useState(false);

  const applyCallback = (startDate, endDate) => {
    if (isRangeSelected && range !== 7) {
      const rangeVal = getRange();
      setStartChange(rangeVal[rangeArr[range]][0]);
      setEndChange(rangeVal[rangeArr[range]][1]);
    } else {
      setStartChange(startDate);
      setEndChange(endDate);
    }
  };

  React.useEffect(() => {
    if (isRangeSelected && range !== 7) {
      const rangeVal = getRange();
      setStartChange(rangeVal[rangeArr[range]][0]);
      setEndChange(rangeVal[rangeArr[range]][1]);
    }
    setIsRangeSelected(false);
  }, [isRangeSelected]);

  React.useEffect(() => {
    range !== 7 && setIsRangeSelected(true);
  }, [range])

  const style = {
    fromDot: { backgroundColor: "rgb(100, 0, 34)" },
    toDot: { backgroundColor: "rgb(0, 135, 255)" },
    fromDate: {
      backgroundColor: "rgb(26 35 126)",
    },
    toDate: { backgroundColor: "rgb(26 35 126)" },
    betweenDates: {
      backgroundColor: "#90CAF9",
    },
    hoverCell: { color: "rgb(200, 0, 34)" },
    customRangeButtons: {
      backgroundColor: "white",
      border: "none",
      padding: "0.4rem 0.75rem",
      color: "rgb(66 66 66)",
      fontWeight: 500,
    },
    customRangeSelected: {
      backgroundColor: "white",
      border: "none",
      padding: "0.4rem 0.75rem",
      color: "rgb(66 66 66)",
      fontWeight: 500,
    },
  };

  const getMaxDate = () => {
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

  return (
    <div>
      <DateTimeRangeContainer
        ranges={dateRangeValues}
        start={startDate}
        end={endDate}
        local={local}
        maxDate={getMaxDate()}
        style={style}
        smartMode={true}
        autoApply={true}
        applyCallback={applyCallback}
        rangeCallback={(e) => {
          setRange(e);
        }}
      >
        <button className="search-button custom-focus mt-1 flex">
          <span className="block mr-auto">
            {range === 7 ? (
              <span className="text-sm">
                {moment(startDate).format("YY-MM-DD hh:mm")} -{" "}
                {moment(endDate).format("YY-MM-DD hh:mm")}
              </span>
            ) : (
              rangeArr[range]
            )}
          </span>
          <CalendarIcon
            className="h-6 w-6 text-textGrey block ml-auto"
            aria-hidden="true"
          />
        </button>
      </DateTimeRangeContainer>
    </div>
  );
};

export default Picker;
