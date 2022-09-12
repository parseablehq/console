import classNames from "classnames";
import { CheckIcon } from "@heroicons/react/solid";

const Button = ({ text, active, selected }) => {
  return (
    <li
      className={classNames(
        "hover:bg-primary-200 hover:cursor-pointer hover:text-gray-50 text-left px-3 py-2 mx-1 rounded-lg relative flex text-sm",
        { "font-semibold": selected },
        { "bg-primary-200 text-gray-50": active }
      )}
    >
      {text}
      {selected && (
        <CheckIcon className="h-5 w-5 inline-block ml-auto my-auto" />
      )}
    </li>
  );
};

export default Button;
