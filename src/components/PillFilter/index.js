import React from "react";
import PropTypes from 'prop-types';
import className from "classnames";

const PillFilter = ({ text, onClick, selected }) => {
  return (
    <button
      onClick={() => onClick()}
      className={className(
        "block w-min py-2 px-3 max-w-[15rem] cursor-pointer hover:bg-gray-600 hover:text-gray-50 border-2 truncate mr-3 my-1 text-xs leading-3 rounded-xl",
        { "bg-gray-600 font-semibold text-gray-50 border-gray-600": selected },
        { "bg-gray-50 font-medium text-gray-600 border-gray-400": !selected }
      )}
    >
      <span>{text}</span>
    </button>
  );
};

export default PillFilter;

PillFilter.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

PillFilter.defaultProps = {
  text: null,
  selected: false,
};
