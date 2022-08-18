import moment from "moment";
import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.css";
import { CalendarIcon } from "@heroicons/react/outline";
const FORMAT = "DD-MM-YYYY HH:mm";

const Calendar = ({ setStartDate, setEndDate, start, end }) => {
  const [dateRange, setDateRange] = useState([
    moment(start).unix(),
    moment(end).unix(),
  ]);
  const [startDate, endDate] = dateRange;
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button onClick={onClick} ref={ref}>
      <CalendarIcon
        className="h-[1.2rem] w-[1.2rem] text-white block ml-auto"
        aria-hidden="true"
      />
    </button>
  ));
  return (
    <DatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      filterDate={(day) => moment(day).isBefore(moment())}
      className={"custom-date-picker"}
      onChange={(update) => {
        setDateRange(update);
        setStartDate(moment(update[0]).startOf("day").format(FORMAT));
        setEndDate(
          moment(update[update[1] ? 1 : 0])
            .endOf("day")
            .format(FORMAT),
        );
      }}
      dayClassName={(date) => {
        return moment(date).isSame(moment(startDate))
          ? "custom-date-picker-day-start"
          : moment(date).isSame(moment(endDate))
          ? "custom-date-picker-day-end"
          : "";
      }}
      customInput={<ExampleCustomInput />}
    />
  );
};

export default Calendar;
