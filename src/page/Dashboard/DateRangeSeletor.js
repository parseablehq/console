import { useEffect, useRef, useState } from "react";

import { ClockIcon } from "@heroicons/react/outline";
import DatePicker from "./DatePicker";
import React from "react";
import moment from "moment";

const FORMAT = "DD-MM-YYYY HH:mm";

function useOutsideAlerter(ref, func) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        func();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, func]);
}

const DateRangeSelector = ({
  getRange,
  setRange,
  range,
  setFromDate,
  setToDate,
  fromDate,
  toDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [fromInput, setFromInput] = useState(moment(fromDate).format(FORMAT));

  const [toInput, setToInput] = useState(moment(toDate).format(FORMAT));

  const toDateRef = useRef(null);

  function getDate(index) {
    const rangeVal = getRange();
    setFromInput(moment(rangeVal[rangeArr[index]][0]).format(FORMAT));
    setToInput(moment(rangeVal[rangeArr[index]][1]).format(FORMAT));
    setFromDate(moment(rangeVal[rangeArr[index]][0]));
    setToDate(moment(rangeVal[rangeArr[index]][1]));
    setRange(index);
  }

  function submitDate(e) {
    e.preventDefault();
    if (checkValidDate()) {
      submitCal();
    }
  }

  function handleFromDateSubmit(e) {
    e.preventDefault();
    if (checkValidDate()) {
      toDateRef?.current?.focus();
    }
  }

  function checkValidDate() {
    return (
      moment(toInput, FORMAT).isValid() &&
      moment(fromInput, FORMAT).isValid() &&
      moment(toInput, FORMAT).isAfter(moment(fromInput, FORMAT))
    );
  }

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsOpen(false));

  function submitCal() {
    setRange(7);
    setIsOpen(false);
    setFromDate(moment(fromInput, FORMAT));
    setToDate(moment(toInput, FORMAT));
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

  return (
    <div className="relative z-50">
      <button
        onClick={function () {
          setIsOpen(!isOpen);
        }}
        className={
          "input rounded-r-none flex border-r-0 disabled:text-gray-300 mt-1 h-[2.4rem] text-left w-80"
        }
      >
        {range === 7 ? (
          <span className="text-xs mt-[0.2rem]">
            {moment(fromDate).format(FORMAT)} - {moment(toDate).format(FORMAT)}
          </span>
        ) : (
          rangeArr[range]
        )}
        <ClockIcon
          className="h-5 w-5 my-auto mr-0 ml-auto text-gray-500"
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          ref={wrapperRef}
          className={
            "absolute z-50 left-0 mt-2 w-[28rem] origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          }
        >
          <div className="flex my-2 w-full">
            <div className="flex flex-col ">
              {rangeArr.map((item, index) => (
                <button
                  key={index}
                  onClick={function () {
                    setIsOpen(false);
                    getDate(index);
                  }}
                  className={`w-40 hover:bg-primary-200 text-left px-3 hover:border-primary-200 hover:text-gray-100 py-2 border border-gray-200 text-sm text-gray-600 font-medium`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-grow-1 w-full flex-col px-4 border border-grey-200 border-l-0 border-r-0">
              <div className="mt-2 relative">
                <form onSubmit={handleFromDateSubmit}>
                  <label className="text-label" htmlFor="">
                    From
                  </label>
                  <input
                    value={fromInput}
                    onBlur={function () {
                      if (moment(fromInput, FORMAT).isValid)
                        setFromInput(moment(fromInput, FORMAT).format(FORMAT));
                    }}
                    onChange={function (e) {
                      setFromInput(e.target.value);
                    }}
                    className=" input text-xs"
                    type="text"
                  />
                </form>
              </div>
              <div className="mt-2 relative">
                <form onSubmit={submitDate}>
                  <label className="text-label mt-2" htmlFor="">
                    To
                  </label>
                  <input
                    value={toInput}
                    ref={toDateRef}
                    onBlur={function () {
                      if (moment(toInput, FORMAT).isValid)
                        setToInput(moment(toInput, FORMAT).format(FORMAT));
                    }}
                    onChange={function (e) {
                      setToInput(e.target.value);
                    }}
                    className="input text-xs"
                    type="text"
                  />
                </form>
              </div>
              <div className="ml-auto">
                <div className="mt-3 px-2 pt-2 rounded-md py-1 bg-primary-200">
                  <DatePicker
                    setStartDate={setFromInput}
                    setEndDate={setToInput}
                    start={fromInput}
                    end={toInput}
                  />
                </div>
              </div>
              {!checkValidDate() && (
                <div className="text-red-600 mt-2 font-semibold text-sm">
                  Error dates are not valid
                </div>
              )}
              <div className="mt-auto mb-2 flex">
                <div className="mr-auto mt-2 font-semibold text-xs">
                  GMT {moment().format("Z")}
                </div>
                <button
                  onClick={function () {
                    setIsOpen(false);
                  }}
                  className="ml-auto block mr-2 custom-focus btn text-sm font-semibold text-gray-600 border-gray-400 border-2 p-1 rounded px-3 "
                >
                  close
                </button>
                <button
                  disabled={!checkValidDate()}
                  onClick={submitCal}
                  className="block custom-focus btn text-sm font-semibold text-white border-primary-200 disabled:border-blue-200 disabled:bg-blue-200 border-2 p-1 bg-primary-200 rounded px-3 "
                >
                  apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
