import React, { memo, useState } from "react";

import { Combobox } from "@headlessui/react";
import DropdownButton from "../DropdownButton";
import { SelectorIcon } from "@heroicons/react/solid";

const SearchableDropdown = ({ data, setValue, value, label }) => {
  const [query, setQuery] = useState("");

  const filteredData =
    query === ""
      ? data
      : data.filter((obj) => {
          return obj.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div>
      <label className="text-label ml-1" htmlFor="stream">
        {label}
      </label>
      <Combobox value={value} onChange={setValue}>
        <div className="relative mt-1">
          <Combobox.Input
            name="stream"
            className={"input"}
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(val) => {
              return data.length && val ? val.name : "No data found";
            }}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon
              className="h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
          </Combobox.Button>
          <Combobox.Options
            className={
              "absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-50 py-1 border border-1 border-gray-500"
            }
          >
            {filteredData?.map ? (
              filteredData.map((obj) => (
                <Combobox.Option key={obj.name} value={obj}>
                  {({ active, selected }) => (
                    <DropdownButton
                      text={obj.name}
                      active={active}
                      selected={selected}
                    />
                  )}
                </Combobox.Option>
              ))
            ) : (
              <div>No data</div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};

export default memo(SearchableDropdown);
