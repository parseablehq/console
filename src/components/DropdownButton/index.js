import { CheckIcon } from "@heroicons/react/solid";
import React from "react";
import PropTypes from 'prop-types';
import classNames from "classnames";

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

Button.propTypes = {
  text: PropTypes.string,
  active: PropTypes.bool,
  selected: PropTypes.bool,
};

Button.defaultProps = {
  text: null,
  active: false,
  selected: false,
};
