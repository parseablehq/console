import { Index, PillFilterList } from "./../../components/PillFilterList/index";
import React from "react";
import { Popover } from "@headlessui/react";
import SearchableDropdown from "../../components/SearchableDropdown";
import Button from "../../components/Button";
import PillFilter from "../../components/PillFilter";

const pills = [
  "fhjdskbj",
  "nhdfjjhfjdhkfjdhskjfhdskj",
  "nhdfjjhfjdhkfjdhskjfhdskj",
  "nhdfjjhfjdhkfjdhskjfhdskj",
  "nhdfjjhfjdhkfjdhskjfhdskj",
  "nhdfjjhfjdhkfjdhskjfhdskj",
  "nhdfjjhfjdhkfjdhskjfhdskj",

];

export default function Filters() {
  return (
    <Popover className="relative w-96 ml-3">
      <label className="text-label ml-1" htmlFor="">
        Filter
      </label>
      <div className="input w-full mt-1">
        <Popover.Button>Solutions</Popover.Button>
      </div>
      <Popover.Panel className="absolute mt-1 right-0 w-[48rem] overflow-auto rounded-md bg-gray-50 py-1 border border-1 border-gray-500">
        <div className="flex flex-col mx-4 my-2">
          <div className="flex">
            <SearchableDropdown data={[]} label={"Column Filters"} />
            <div className="ml-2">
              <SearchableDropdown data={[]} />
            </div>
            <div className="ml-2">
              <input type="text" className="input mt-7" />
            </div>
            <div className="mt-7 ml-4">
              <Button>Add Filter</Button>
            </div>
          </div>

          <PillFilterList x={pills} />
        </div>
        <img src="/solutions.jpg" alt="" />
      </Popover.Panel>
    </Popover>
  );
}
