import { Listbox } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import Button from "../DropdownButton";

const Dropdown = ({ name, disabled, value, setValue }) => {
  const data = [
    {
      name: "1 sec",
      value: 1,
    },
    {
      name: "2 sec",
      value: 2,
    },
    {
      name: "5 sec",
      value: 5,
    },
    {
      name: "10 sec",
      value: 10,
    },
    {
      name: "20 sec",
      value: 20,
    },
    {
      name: "1 min",
      value: 60,
    },
    {
      name: "None",
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
        value={value}
        onChange={setValue}
        className="relative text-left ml-3 w-28"
      >
        <Listbox.Button
          disabled={disabled}
          className={"input flex disabled:text-gray-300 mt-1 text-left"}
        >
          <div>
            {disabled ? "None" : data.find((obj) => obj.value === value).name}
          </div>
          <SelectorIcon
            className="h-5 w-5 text-gray-500 ml-auto"
            aria-hidden="true"
          />
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
                  className={`block custom-focus cursor-pointer hover:bg-bluePrimary hover:text-white text-sm font-semibold select-none py-2 px-4 text-gray-700`}
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
