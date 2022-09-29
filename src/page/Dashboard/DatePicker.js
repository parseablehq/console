import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css";

import React, { forwardRef, useState } from "react";

import { CalendarIcon } from "@heroicons/react/outline";
import DatePicker from "react-datepicker";
import moment from "moment";

const FORMAT = "DD-MM-YYYY HH:mm";

const Calendar = ({ setStartDate, setEndDate, start, end }) => {
  const [dateRange, setDateRange] = useState([
    moment(start, FORMAT).startOf("day").toDate(),
    moment(end, FORMAT).startOf("day").toDate(),
  ]);
  const [startDate, endDate] = dateRange;
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button onClick={onClick} ref={ref}>
      <CalendarIcon
        strokeWidth={1.5}
        className="h-[1.2rem] w-[1.2rem] text-white block ml-auto"
        aria-hidden="true"
      />
    </button>
  ));
  console.log(startDate);
  return (
    <DatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      filterDate={function (day) {
        return moment(day).isBefore(moment());
      }}
      disabledKeyboardNavigation
      className={"custom-date-picker"}
      onChange={function (update) {
        setDateRange(update);
        setStartDate(moment(update[0]).startOf("day").format(FORMAT));
        setEndDate(
          moment(update[update[1] ? 1 : 0])
            .endOf("day")
            .format(FORMAT)
        );
      }}
      dayClassName={function (date) {
        return moment(date).isSame(moment(endDate)) && moment(date).isSame(moment(startDate))
          ? "custom-date-picker-day-same"
          : moment(date).isSame(moment(endDate))
          ? "custom-date-picker-day-end"
          : moment(date).isSame(moment(startDate))
          ? "custom-date-picker-day-start"
          : "";
      }}
      customInput={<ExampleCustomInput />}
    />
  );
};

export default Calendar;
