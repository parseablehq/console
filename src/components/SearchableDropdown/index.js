import { memo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import DropdownButton from "../DropdownButton";

const SearchableDropdown = ({ data, setValue, value, label }) => {
  const [query, setQuery] = useState("");
  // TODO: Throw error on no name
  // TODO: Remove value from prop

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
            displayValue={(value) =>
              data.length && value ? value.name : "No data found"
            }
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
            {!!filteredData ? (
              filteredData.map((data) => (
                <Combobox.Option key={data.name} value={data}>
                  {({ active, selected }) => (
                    <DropdownButton
                      text={data.name}
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
