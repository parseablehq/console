import React from "react";
import PropTypes from 'prop-types';
import classNames from "classnames";

const Button = ({ children, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "py-2 leading-6 px-4 text-sm rounded-md disabled:opacity-75 bg-primary-200 text-gray-50"
      )}
    >
      {children}
    </button>
  );
};

export default Button;

Button.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

Button.defaultProps = {
  children: null,
  disabled: false,
};

