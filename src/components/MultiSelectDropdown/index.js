import Button from "../DropdownButton";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Listbox } from "@headlessui/react";
import Pill from "../Pill";
import React from "react";
import PropTypes from 'prop-types';

const MultipleSelectDropdown = ({
  name,
  values,
  setSelectedValues,
  data,
  removeValue,
}) => (
  <div className="ml-3 flex-1">
    <label htmlFor="location" className="text-label">
      {name}
    </label>
    <Listbox value={values} onChange={setSelectedValues} multiple>
      <div className="relative w-full mt-1">
        <Listbox.Button className="input flex text-left">
          {values.length > 0
            ? values.map((val) => (
                <Pill
                  text={val}
                  onClose={function () {
                    removeValue(val);
                  }}
                />
              ))
            : "Select Tags"}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options
          className={
            "absolute left-0 mt-2 py-2 w-80 origin-top-right rounded-md bg-gray-50 shadow-lg border border-1 border-gray-400"
          }
        >
          {data.length !== 0 ? (
            data.map((value) => (
              <Listbox.Option key={value} value={value}>
                {({ active, selected }) => (
                  <Button text={value} active={active} selected={selected} />
                )}
              </Listbox.Option>
            ))
          ) : (
            <div className="px-3 py-2">Nothing Found</div>
          )}
        </Listbox.Options>
      </div>
    </Listbox>
  </div>
);

export default MultipleSelectDropdown;

MultipleSelectDropdown.propTypes = {
  name: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.string),
  setSelectedValues: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.string),
  removeValue: PropTypes.func.isRequired,
};

MultipleSelectDropdown.defaultProps = {
  name: null,
  values: [],
  data: [],
};
