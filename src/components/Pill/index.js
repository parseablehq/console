import React from "react";
import { XCircleIcon } from "@heroicons/react/solid";

const Pill = ({ text, onClose }) => {
  return (
    <span className="relative block w-min py-1 pl-2 pr-6 truncate mr-1 bg-secondary-200 text-xs text-gray-800 font-semibold leading-3 rounded-md">
      {text}
      <XCircleIcon
        onClick={onClose}
        className="hover:text-gray-600 transform duration-200 text-red-700 w-4 absolute top-[0.125rem] right-1"
      />
    </span>
  );
};

export default Pill;
