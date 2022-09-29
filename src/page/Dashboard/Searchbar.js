import React from "react";
import { SearchIcon } from "@heroicons/react/solid";

function Searchbar(setSearchQuery) {
  return (
    <div className="relative cursor-default">
      <div className="flex flex-col">
        <input
          className="input w-64 rounded-r-none border-r-0 placeholder-iconGrey"
          placeholder="Search"
          onChange={function (e) {
            setSearchQuery(e.target.value);
          }}
        />
      </div>
      <button className="absolute inset-y-0 right-0 flex items-center pr-2">
        <SearchIcon className="h-5 w-5 text-iconGrey" aria-hidden="true" />
      </button>
    </div>
  );
}

export default Searchbar;
