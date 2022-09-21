import React from "react";
import classNames from "classnames";

const Button = ({ children, disabled }) => {
  return (
    <button
      className={classNames(
        "py-2 leading-6 px-4 text-sm rounded-md bg-primary-200 text-gray-50"
      )}
    >
      {children}
    </button>
  );
};

export default Button;
