import moment from "moment";
import { useState, useEffect, useRef } from "react";
import DatePicker from "./DatePicker";
import { SelectorIcon } from "@heroicons/react/solid";
import { CalculatorIcon, ClockIcon } from "@heroicons/react/outline";

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

  const [fromInput, setFromInput] = useState(
    moment().subtract(10, "minutes").format(FORMAT),
  );

  const [toInput, setToInput] = useState(moment().format(FORMAT));

  const getDate = (index) => {
    const rangeVal = getRange();
    setFromInput(moment(rangeVal[rangeArr[index]][0]).format(FORMAT));
    setToInput(moment(rangeVal[rangeArr[index]][1]).format(FORMAT));

    setFromDate(moment(rangeVal[rangeArr[index]][0]));
    setToDate(moment(rangeVal[rangeArr[index]][1]));
    setRange(index);
  };

  const checkValidDate = () => {
    return (
      moment(toInput, FORMAT).isValid() &&
      moment(fromInput, FORMAT).isValid() &&
      moment(toInput, FORMAT).isAfter(moment(fromInput, FORMAT))
    );
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsOpen(false));

  const submitCal = () => {
    setRange(7);
    setIsOpen(false)
    setFromDate(moment(fromInput, FORMAT));
    setToDate(moment(toInput, FORMAT));
  };

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          "search-button flex disabled:text-gray-300 mt-1 custom-focus text-left"
        }
      >
        {range === 7 ? (
          <span className="text-sm mt-[0.125rem] mb-[0.125rem]">
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
            "absolute left-0 mt-2 w-[28rem] origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          }
        >
          <div className="flex my-2 w-full border border-grey-200">
            <div className="flex flex-col ">
              {rangeArr.map((item, index) => (
                <button
                  key={index}
                  onClick={() => getDate(index)}
                  className={`w-40 hover:bg-bluePrimary text-left px-3 hover:border-bluePrimary hover:text-gray-100 py-2 border border-gray-200 text-sm text-gray-600 font-medium`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-grow-1 w-full flex-col mx-4">
              <div className="mt-2 relative">
                <label className="text-xs " htmlFor="">
                  From
                </label>
                <input
                  value={fromInput}
                  onBlur={() => {
                    if (moment(fromInput, FORMAT).isValid)
                      setFromInput(moment(fromInput, FORMAT).format(FORMAT));
                  }}
                  onChange={(e) => {
                    setFromInput(e.target.value);
                  }}
                  className="custom-focus custom-input text-xs"
                  type="text"
                />
                <div className="absolute right-2 top-[1.85rem]">
                  <DatePicker
                    setStartDate={setFromInput}
                    setEndDate={setToInput}
                    start={fromInput}
                    end={toInput}
                  />
                </div>
              </div>
              <div className="mt-2 relative">
                <label className="text-xs mt-2" htmlFor="">
                  To
                </label>
                <input
                  value={toInput}
                  onBlur={() => {
                    if (moment(toInput, FORMAT).isValid)
                      setToInput(moment(toInput, FORMAT).format(FORMAT));
                  }}
                  onChange={(e) => {
                    setToInput(e.target.value);
                  }}
                  className="custom-input custom-focus text-xs"
                  type="text"
                />
                <div className="absolute right-2 top-[1.85rem]">
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
              <div className="mt-auto ml-auto mb-2">
                <button onClick={() => setIsOpen(false)} className="ml-auto mr-2 custom-focus btn text-sm font-semibold text-gray-600 border-gray-400 border-2 p-1 rounded px-3 px-2">
                  close
                </button>
                <button
                  disabled={!checkValidDate()}
                  onClick={submitCal}
                  className="ml-auto custom-focus btn text-sm font-semibold text-white border-yellowButton disabled:border-yellow-400 disabled:bg-yellow-400 border-2 p-1 bg-yellowButton rounded px-3 px-2"
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
