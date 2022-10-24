import Button from "../DropdownButton";
import { Listbox } from "@headlessui/react";
import React from "react";
import PropTypes from 'prop-types';
import { SelectorIcon } from "@heroicons/react/solid";

const Dropdown = ({ name, disabled, value, setValue, customStyle, Icon }) => {
  const data = [
    {
      name: "1s",
      value: 1,
    },
    {
      name: "2s",
      value: 2,
    },
    {
      name: "5s",
      value: 5,
    },
    {
      name: "10s",
      value: 10,
    },
    {
      name: "20s",
      value: 20,
    },
    {
      name: "1m",
      value: 60,
    },
    {
      name: "Off",
      value: null,
    },
  ];

  return (
    <div>
      <label htmlFor="location" className="text-label ml-4">
        {name}
      </label>
      <Listbox
        as="div"
        value={disabled ? null : value}
        onChange={setValue}
        className="relative text-left"
      >
        <Listbox.Button
          disabled={disabled}
          className={`${customStyle} input flex ${
            disabled && "text-gray-400"
          } mt-1 text-left`}
        >
          <div>
            {disabled ? "Off" : data.find((obj) => obj.value === value).name}
          </div>
          {!Icon ? (
            <SelectorIcon
              className={`h-5 w-5 ${
                disabled ? "text-gray-300" : "text-gray-500"
              } ml-2`}
              aria-hidden="true"
            />
          ) : (
            <Icon
              className={`h-5 w-5 ${
                disabled ? "text-gray-300" : "text-gray-500"
              } ml-2`}
            />
          )}
        </Listbox.Button>
        <Listbox.Options
          className={
            "absolute left-0 mt-2 py-2 w-40 origin-top-right rounded-md bg-gray-50 shadow-lg border border-1 border-gray-400"
          }
        >
          {data.map((obj) => (
            <Listbox.Option key={obj} value={obj.value}>
              {({ active, selected }) => (
                <Button
                  text={obj.name}
                  active={active}
                  selected={selected}
                  // onClick={() => setValue(obj.value)}
                  className={`block focus cursor-pointer hover:bg-bluePrimary hover:text-white text-sm font-semibold select-none py-2 px-4 text-gray-700`}
                />
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

export default Dropdown;

Dropdown.propTypes = {
  name: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  customStyle: PropTypes.string,
  Icon: PropTypes.elementType,
};

Dropdown.defaultProps = {
  name: null,
  disabled: false,
  value: null,
  customStyle: '',
  Icon: null,
};
