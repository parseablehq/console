import React from "react";
import { XCircleIcon } from "@heroicons/react/solid";
import className from "classnames";

const PillFilter = ({ text, onClick, selected }) => {
  return (
    <div
      onClick={() => onClick()}
      className={className(
        "block w-min py-3 px-6 max-w-[15rem] min-w-[8rem] cursor-pointer hover:bg-gray-600 hover:text-gray-50 border-2 border-gray-600 truncate mr-3 my-1 text-sm font-semibold leading-3 rounded-full",
        { "bg-gray-600 text-gray-50": selected },
        { "bg-gray-50 text-gray-600": !selected }

      )}
    >
      <span>{text}</span>
    </div>
  );
};

export default PillFilter;
